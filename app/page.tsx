'use client'

import { Sidebar } from '@/components/Sidebar'
import { Topbar } from '@/components/Topbar'
import { useState } from 'react'
import { OverviewPanel } from '@/components/panels/OverviewPanel'
import { IndicatorsPanel } from '@/components/panels/IndicatorsPanel'
import { MarketPanel } from '@/components/panels/MarketPanel'
import { StocksPanel } from '@/components/panels/StocksPanel'
import { NewsPanel } from '@/components/panels/NewsPanel'
import { ReferencePanel } from '@/components/panels/ReferencePanel'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'indicators', label: 'Indicators' },
  { id: 'market', label: 'Market' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'news', label: 'News' },
  { id: 'reference', label: 'Reference' },
]

export default function Page() {
  const [tab, setTab] = useState<string>('overview')

  return (
    <div className="h-screen grid grid-cols-[240px_1fr] grid-rows-[48px_1fr]">
      <div className="col-span-2 row-[1/2] border-b border-terminal-border">
        <Topbar />
      </div>
      <aside className="row-[2/3] border-r border-terminal-border">
        <Sidebar tabs={TABS} active={tab} onSelect={setTab} />
      </aside>
      <main className="row-[2/3] overflow-auto p-3 space-y-3">
        {tab === 'overview' && <OverviewPanel />}
        {tab === 'indicators' && <IndicatorsPanel />}
        {tab === 'market' && <MarketPanel />}
        {tab === 'stocks' && <StocksPanel />}
        {tab === 'news' && <NewsPanel />}
        {tab === 'reference' && <ReferencePanel />}
      </main>
    </div>
  )
}
