'use client'

import useSWR from 'swr'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import { useSymbol } from '@/components/SymbolContext'
import { StatusPill } from '@/components/StatusPill'

export function OverviewPanel({ dense }: { dense?: boolean } = {}) {
  const { symbol } = useSymbol()
  const { data, error, isLoading } = useSWR(['ticker', symbol], () => api.ticker(symbol), { revalidateOnFocus: false, dedupingInterval: 60000 })

  return (
    <Panel
      title={`Overview · ${symbol}`}
      actions={<div className="flex items-center gap-2 text-xs"><span className="text-terminal-muted">Symbol:</span><span>{symbol}</span>{data?.status && <StatusPill status={data.status} />}</div>}
      dense={dense}
    >
      {isLoading && <div className="text-terminal-muted">Loading...</div>}
      {error && <div className="text-terminal-danger">Error: {String(error.message || error)}</div>}
      {data && <CompanyOverview obj={data.results ?? data} />}
    </Panel>
  )
}

function CompanyOverview({ obj }: { obj: any }) {
  const id = {
    Name: obj?.name,
    Ticker: obj?.ticker ?? obj?.ticker_root,
    Market: obj?.market,
    Exchange: obj?.primary_exchange,
    Locale: obj?.locale,
    Active: obj?.active ? 'Yes' : 'No',
    'List Date': obj?.list_date ? new Date(obj.list_date).toLocaleDateString() : undefined,
    CIK: obj?.cik,
    'Composite FIGI': obj?.composite_figi,
    'Share Class FIGI': obj?.share_class_figi,
    'SIC Code': obj?.sic_code,
    'SIC Description': obj?.sic_description,
  }

  const valuation = {
    'Market Cap': obj?.market_cap,
  }

  const shares = {
    'Weighted Shares Outstanding': obj?.weighted_shares_outstanding,
    'Share Class Shares Outstanding': obj?.share_class_shares_outstanding,
    'Round Lot': obj?.round_lot,
  }

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
      <div className="panel flex flex-col h-full min-h-0">
        <div className="panel-header">Identity</div>
        <div className="panel-body min-h-0 overflow-auto">
          <KVTable data={id} />
        </div>
      </div>
      <div className="panel flex flex-col h-full min-h-0">
        <div className="panel-header">Valuation</div>
        <div className="panel-body min-h-0 overflow-auto">
          <KVTable data={valuation} numberFormat />
        </div>
      </div>
      <div className="panel flex flex-col h-full min-h-0">
        <div className="panel-header">Shares</div>
        <div className="panel-body min-h-0 overflow-auto">
          <KVTable data={shares} numberFormat />
        </div>
      </div>
      <div className="panel flex flex-col h-full min-h-0">
        <div className="panel-header">Contact</div>
        <div className="panel-body min-h-0 overflow-auto">
          <KVTable data={contact} />
        </div>
      </div>
      {Object.keys(address).length > 0 && (
        <div className="panel flex flex-col h-full min-h-0">
          <div className="panel-header">Address</div>
          <div className="panel-body min-h-0 overflow-auto">
            <KVTable data={address} />
          </div>
        </div>
      )}
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
    <table className="w-full text-sm">
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k} className="border-b border-terminal-border/60">
            <td className="py-1 pr-3 text-terminal-muted whitespace-nowrap">{labelize(k)}</td>
            <td className="py-1 break-words">
              {isUrl(v) ? (
                <a href={v} target="_blank" rel="noreferrer" className="text-terminal-info hover:underline">
                  {v}
                </a>
              ) : (
                formatCell(v, numberFormat)
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
