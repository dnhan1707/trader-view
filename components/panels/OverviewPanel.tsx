'use client'

import useSWR from 'swr'
import React, { useEffect } from 'react'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import { useSymbol } from '@/components/SymbolContext'
import { StatusPill } from '@/components/StatusPill'
import { useRealtimeData } from '@/contexts/RealtimeDataContext'
import { RealtimePrice, TickerSubscription } from '@/components/RealtimeComponents'

export function OverviewPanel({ dense }: { dense?: boolean } = {}) {
  const { symbol } = useSymbol()
  const { data, error, isLoading } = useSWR(['ticker', symbol], () => api.ticker(symbol), { revalidateOnFocus: false, dedupingInterval: 60000 })
  const { data: ratiosData, error: ratiosError } = useSWR(
    symbol ? ['ratios', symbol] : null, 
    () => api.ratios(symbol), 
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 600000, // 10 minutes cache
      errorRetryCount: 1,
      shouldRetryOnError: false
    }
  )
  
  // Snapshot data for real-time market data (when WebSocket is unavailable)
  const { data: snapshotData } = useSWR(
    symbol ? ['snapshot', symbol] : null,
    () => api.snapshot(symbol),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds cache for live data
      errorRetryCount: 2
    }
  )
  const { subscribeToTicker, getStockData } = useRealtimeData()
  
  // Auto-subscribe to current symbol for real-time data
  useEffect(() => {
    if (symbol) {
      subscribeToTicker(symbol)
    }
  }, [symbol, subscribeToTicker])

  const realtimeData = getStockData(symbol)
  
  // Use snapshot data as fallback when WebSocket is unavailable
  const currentData = realtimeData || (snapshotData?.ticker ? {
    currentPrice: snapshotData.ticker.lastTrade?.p || snapshotData.ticker.day?.c,
    priceChange: snapshotData.ticker.todaysChange,
    priceChangePercent: snapshotData.ticker.todaysChangePerc,
    open: snapshotData.ticker.day?.o,
    high: snapshotData.ticker.day?.h,
    low: snapshotData.ticker.day?.l,
    close: snapshotData.ticker.prevDay?.c,
    prevClose: snapshotData.ticker.prevDay?.c, // Add prevClose for consistency
    volume: snapshotData.ticker.day?.v,
    lastPriceDirection: snapshotData.ticker.todaysChange > 0 ? 'up' : snapshotData.ticker.todaysChange < 0 ? 'down' : 'neutral'
  } : undefined)

  return (
    <Panel
      title={`Overview · ${symbol}`}
      actions={
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-terminal-muted">Symbol:</span>
            <span>{symbol}</span>
          </div>
          <TickerSubscription ticker={symbol} />
          {currentData ? (
            <div className="flex items-center gap-2">
              <span className="text-terminal-muted">{realtimeData ? 'Live:' : 'Snapshot:'}</span>
              <span className={`font-mono ${
                currentData.lastPriceDirection === 'up' ? 'text-terminal-success' :
                currentData.lastPriceDirection === 'down' ? 'text-terminal-danger' :
                'text-terminal-foreground'
              }`}>
                ${currentData.currentPrice?.toFixed(2)}
              </span>
              {currentData.priceChange !== undefined && (
                <span className={`text-xs ${
                  currentData.priceChange > 0 ? 'text-terminal-success' :
                  currentData.priceChange < 0 ? 'text-terminal-danger' :
                  'text-terminal-muted'
                }`}>
                  {currentData.priceChange > 0 ? '+' : ''}{currentData.priceChange?.toFixed(2)}
                  ({currentData.priceChangePercent > 0 ? '+' : ''}{currentData.priceChangePercent?.toFixed(2)}%)
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-terminal-muted">Market:</span>
              <span className="text-terminal-danger">Closed</span>
            </div>
          )}
        </div>
      }
      dense={dense}
    >
      {isLoading && <div className="text-terminal-muted">Loading...</div>}
      {error && <div className="text-terminal-danger">Error: {String(error.message || error)}</div>}
      {data && <CompanyOverview obj={data.results ?? data} currentData={currentData} ratiosData={ratiosData?.results?.find((r: any) => r.ticker === symbol)} ratiosError={ratiosError} />}
    </Panel>
  )
}

function CompanyOverview({ obj, currentData, ratiosData, ratiosError }: { obj: any, currentData?: any, ratiosData?: any, ratiosError?: any }) {
  const id = {
    Name: obj?.name,
    Ticker: obj?.ticker ?? obj?.ticker_root,
    Exchange: obj?.primary_exchange,
    Market: obj?.market,
  }

  // Simplified valuation with performance optimization
  const currentPrice = currentData?.currentPrice
  const staticPrice = ratiosData?.price
  const eps = ratiosData?.earnings_per_share
  const dividendYield = ratiosData?.dividend_yield
  const staticMarketCap = ratiosData?.market_cap
  
  // Live calculations (memoized for performance)
  const liveMarketCap = React.useMemo(() => 
    currentPrice && staticMarketCap && staticPrice ? 
      (staticMarketCap / staticPrice) * currentPrice : undefined, 
    [currentPrice, staticMarketCap, staticPrice]
  )
  
  const livePE = React.useMemo(() => 
    currentPrice && eps ? currentPrice / eps : undefined,
    [currentPrice, eps]
  )
  
  const sharesOutstanding = React.useMemo(() => 
    staticMarketCap && staticPrice ? staticMarketCap / staticPrice : undefined,
    [staticMarketCap, staticPrice]
  )
  
  const liveDividendYield = React.useMemo(() => 
    dividendYield && currentPrice && staticPrice ? 
      (dividendYield * staticPrice / currentPrice) : undefined,
    [dividendYield, currentPrice, staticPrice]
  )

  // Optimized valuation object (only essential fields for performance)
  const valuation = React.useMemo(() => ({
    'Market Cap': liveMarketCap ? `$${(liveMarketCap / 1e9).toFixed(2)}B` : (staticMarketCap ? `$${(staticMarketCap / 1e9).toFixed(2)}B` : obj?.market_cap),
    ...(currentData && {
      'Current Price': `$${currentData.currentPrice.toFixed(2)}`,
      'Price Change': currentData.priceChange !== undefined ? 
        `${currentData.priceChange >= 0 ? '+' : ''}${currentData.priceChange.toFixed(2)} (${currentData.priceChangePercent >= 0 ? '+' : ''}${currentData.priceChangePercent.toFixed(2)}%)` : 
        undefined,
      'Prev Close': currentData.close ? `$${currentData.close.toFixed(2)}` : undefined,
    }),
    ...(ratiosData && {
      'P/E Ratio': livePE ? livePE.toFixed(2) : (ratiosData.price_to_earnings ? ratiosData.price_to_earnings.toFixed(2) : undefined),
      'EPS (TTM)': eps ? `$${eps.toFixed(2)}` : undefined,
      'P/B Ratio': ratiosData.price_to_book ? ratiosData.price_to_book.toFixed(2) : undefined,
      'Dividend Yield': liveDividendYield ? `${(liveDividendYield * 100).toFixed(2)}%` : (dividendYield ? `${(dividendYield * 100).toFixed(2)}%` : undefined),
      'P/S Ratio': ratiosData.price_to_sales ? ratiosData.price_to_sales.toFixed(2) : undefined,
      'ROE': ratiosData.return_on_equity ? `${(ratiosData.return_on_equity * 100).toFixed(2)}%` : undefined,
    }),
    // Show OHLC data from current source
    ...(currentData && {
      'Day Open': currentData.open ? `$${currentData.open.toFixed(2)}` : undefined,
      'Day High': currentData.high ? `$${currentData.high.toFixed(2)}` : undefined,
      'Day Low': currentData.low ? `$${currentData.low.toFixed(2)}` : undefined,
      'Volume': currentData.volume ? currentData.volume.toLocaleString() : undefined,
    })
  }), [liveMarketCap, staticMarketCap, obj?.market_cap, currentData, ratiosData, livePE, eps, liveDividendYield, dividendYield])

  // Simplified shares data
  const shares = React.useMemo(() => ({
    ...(sharesOutstanding && {
      'Shares Outstanding': `${(sharesOutstanding / 1e9).toFixed(2)}B`,
    }),
    'Weighted Shares Outstanding': obj?.weighted_shares_outstanding,
  }), [sharesOutstanding, obj?.weighted_shares_outstanding])

  const contact = {
    Phone: obj?.phone_number,
    Website: obj?.homepage_url,
  }

  const address = obj?.address
    ? {
        Address: [obj.address.address1, obj.address.city, obj.address.state, obj.address.postal_code].filter(Boolean).join(', '),
      }
    : {}

  // const branding = obj?.branding
  //   ? {
  //       'Logo URL': obj.branding.logo_url,
  //       'Icon URL': obj.branding.icon_url,
  //     }
  //   : {}

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 h-full">
      {/* Combined Identity & Contact - 1 column, compact */}
      <div className="panel flex flex-col h-full min-h-0">
        <div className="panel-header">Info</div>
        <div className="panel-body min-h-0 overflow-auto space-y-4">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-terminal-muted">Name:</span><span>{id.Name}</span></div>
            <div className="flex justify-between"><span className="text-terminal-muted">Ticker:</span><span>{id.Ticker}</span></div>
            <div className="flex justify-between"><span className="text-terminal-muted">Exchange:</span><span>{id.Exchange}</span></div>
            <div className="flex justify-between"><span className="text-terminal-muted">Market:</span><span>{id.Market}</span></div>
            {contact.Phone && <div className="flex justify-between"><span className="text-terminal-muted">Phone:</span><span>{contact.Phone}</span></div>}
            {contact.Website && <div className="flex justify-between"><span className="text-terminal-muted">Website:</span><span className="truncate">{contact.Website}</span></div>}
            {Object.keys(address).length > 0 && <div className="flex justify-between"><span className="text-terminal-muted">Address:</span><span className="truncate">{address.Address}</span></div>}
          </div>
        </div>
      </div>
      
      {/* Valuation - unboxed, 2 columns */}
      <div className="xl:col-span-2 space-y-2">
        <h3 className="text-terminal-foreground font-mono text-sm font-bold mb-3">
          Valuation 
        </h3>
        <KVTable data={valuation} numberFormat />
        
        <h3 className="text-terminal-foreground font-mono text-sm font-bold mb-3 mt-6">Shares</h3>
        <KVTable data={shares} numberFormat />
      </div>
      {/* {Object.keys(branding).length > 0 && (
        <div className="panel flex flex-col h-full min-h-0">
          <div className="panel-header">Branding</div>
          <div className="panel-body min-h-0 overflow-auto">
            <Branding branding={obj.branding} />
          </div>
        </div>
      )} */}
      {/* {obj?.description && (
        <div className="panel flex flex-col h-full min-h-0 md:col-span-2 xl:col-span-3">
          <div className="panel-header">Description</div>
          <div className="panel-body min-h-0 overflow-auto text-sm text-terminal-muted">
            {obj.description}
          </div>
        </div>
      )} */}
    </div>
  )
}

function KVTable({ data, numberFormat }: { data: Record<string, any>; numberFormat?: boolean }) {
  const entries = Object.entries(data || {})
  if (entries.length === 0) return <div className="text-terminal-muted">No data</div>
  return (
    <table className="w-full text-sm table-fixed">
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k} className="border-b border-terminal-border/60">
            <td className="py-1 pr-3 text-terminal-muted whitespace-nowrap w-1/2">{labelize(k)}</td>
            <td className="py-1 w-1/2 break-words min-w-0 max-w-0 overflow-hidden">
              {isUrl(v) ? (
                <a href={v} target="_blank" rel="noreferrer" className="text-terminal-info hover:underline truncate block">
                  {v}
                </a>
              ) : (
                <div className="truncate">
                  {formatCell(v, numberFormat)}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function pick(obj: any, keys: string[]): Record<string, any> {
  const out: Record<string, any> = {}
  if (!obj) return out
  for (const k of keys) {
    const found = findKey(obj, k)
    if (found) out[found] = obj[found]
  }
  return out
}

function restFields(obj: any, used: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  if (!obj) return out
  for (const k of Object.keys(obj)) if (!(k in used)) out[k] = obj[k]
  return out
}

function findKey(obj: any, hint: string): string | null {
  const keys = Object.keys(obj || {})
  const lc = hint.toLowerCase()
  return keys.find((k) => k.toLowerCase() === lc || k.toLowerCase().includes(lc)) || null
}

function labelize(k: string): string {
  return k
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (c) => c.toUpperCase())
}

function formatCell(v: any, nf?: boolean) {
  if (v == null) return ''
  if (typeof v === 'number') return nf ? formatNumber(v) : String(v)
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'string') return v
  return Array.isArray(v) ? `${v.length} items` : '—'
}

function formatNumber(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (abs >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return n.toString()
}

function isUrl(v: any): v is string {
  return typeof v === 'string' && /^https?:\/\//i.test(v)
}

// function Branding({ branding }: { branding: any }) {
//   return (
//     <div className="flex items-center gap-4">
//       {branding?.icon_url && (
//         <img src={branding.icon_url} alt="Icon" className="h-8 w-8 rounded bg-white p-1" />
//       )}
//       {branding?.logo_url && (
//         <img src={branding.logo_url} alt="Logo" className="h-8 max-w-[160px] rounded bg-white p-1" />
//       )}
//     </div>
//   )
// }
