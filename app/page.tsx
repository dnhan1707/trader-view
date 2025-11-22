'use client'

import { Sidebar } from '@/components/Sidebar'
import { Topbar } from '@/components/Topbar'
import { useState } from 'react'
import { OverviewPanel } from '@/components/panels/OverviewPanel'
import { IndicatorsPanel } from '@/components/panels/IndicatorsPanel'
import { MarketPanel } from '@/components/panels/MarketPanel'
import { StocksPanel } from '@/components/panels/StocksPanel'
import { NewsPanel } from '@/components/panels/NewsPanel'
import { TickerManagerPanel } from '@/components/panels/TickerManagerPanel'
import { RealtimeDataProvider } from '@/contexts/RealtimeDataContext'
import { ConnectionStatus } from '@/components/RealtimeComponents'
import { SymbolProvider } from '@/components/SymbolContext'
// import { MarketStatusBar } from '@/components/MarketStatusBar'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'indicators', label: 'Indicators' },
  { id: 'market', label: 'Market' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'news', label: 'News' },
  { id: 'tickers', label: 'Live Tickers' },
]

export default function Page() {
  const [tab, setTab] = useState<string>('overview')
  const [viewMode, setViewMode] = useState<'tabs' | 'dashboard'>('dashboard')
  const [dense, setDense] = useState<boolean>(true)
  const [showSidebar, setShowSidebar] = useState<boolean>(false)

  const gridCols = showSidebar ? 'grid-cols-[240px_1fr]' : 'grid-cols-[1fr]'

  return (
    <SymbolProvider>
      <RealtimeDataProvider>
        <div className={`h-screen grid ${gridCols} grid-rows-[48px_1fr]`}>
        {/* Topbar */}
        <div className={showSidebar ? 'col-span-2' : 'col-span-1'}>
          <div className="flex items-center justify-between h-full px-2">
            <Topbar
              viewMode={viewMode}
              setViewMode={setViewMode}
              dense={dense}
              setDense={setDense}
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
            />
            <ConnectionStatus />
          </div>
        </div>
        
        {/* Market Status Bar */}
        {/* <div className={showSidebar ? 'col-span-2' : 'col-span-1'}>
          <MarketStatusBar />
        </div> */}
        
      {showSidebar && (
        <aside className="row-[2/3] border-r border-terminal-border overflow-hidden">
          <Sidebar tabs={TABS} active={tab} onSelect={setTab} />
        </aside>
      )}
      <main className="row-[2/3] overflow-hidden p-3">
        {viewMode === 'tabs' ? (
          <div className="h-full flex flex-col gap-3">
            <div className="min-h-0 flex-1">
              {/* Single active panel fills available space; it will scroll internally */}
              {tab === 'overview' && <OverviewPanel dense={dense} />}
              {tab === 'indicators' && <IndicatorsPanel dense={dense} />}
              {tab === 'market' && <MarketPanel dense={dense} />}
              {tab === 'stocks' && <StocksPanel dense={dense} />}
              {tab === 'news' && <NewsPanel dense={dense} />}
              {tab === 'tickers' && <TickerManagerPanel dense={dense} />}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {/* Single Stock Focus Layout */}
            <div className="grid gap-3 p-1 grid-cols-1 lg:grid-cols-12 auto-rows-min">
              
              {/* Stock Selector - Compact at top */}
              <section className="col-span-1 lg:col-span-12">
                <div className="h-[120px] min-h-0">
                  <TickerManagerPanel dense={dense} />
                </div>
              </section>
              
              {/* Main Stock Overview - Primary focus */}
              <section className="col-span-1 lg:col-span-8">
                <div className="h-[450px] min-h-0">
                  <OverviewPanel dense={dense} />
                </div>
              </section>
              
              {/* Market Context - Supporting info */}
              <div className="col-span-1 lg:col-span-4">
                <div className="h-[450px] min-h-0">
                  <MarketPanel dense={dense} />
                </div>
              </div>
              
              {/* Technical Analysis */}
              <div className="col-span-1 lg:col-span-6">
                <div className="h-[350px] min-h-0">
                  <IndicatorsPanel dense={dense} />
                </div>
              </div>
              
              {/* Related Stocks */}
              <div className="col-span-1 lg:col-span-6">
                <div className="h-[350px] min-h-0">
                  <StocksPanel dense={dense} />
                </div>
              </div>
              
              {/* News - Market context */}
              <div className="col-span-1 lg:col-span-12">
                <div className="h-[300px] min-h-0">
                  <NewsPanel dense={dense} />
                </div>
              </div>
              
            </div>
          </div>
        )}      
      </main>
    </div>
    </RealtimeDataProvider>
    </SymbolProvider>
  )
}
