'use client'

import useSWR from 'swr'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import { StatusPill } from '@/components/StatusPill'

interface StatusSectionProps {
  title: string
  data: Record<string, string> | undefined
}

function StatusSection({ title, data }: StatusSectionProps) {
  if (!data) {
    return (
      <div className="bg-terminal-panel/30 rounded-lg p-3 border border-terminal-border">
        <h4 className="font-medium text-sm mb-3">{title}</h4>
        <div className="text-terminal-muted text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-terminal-panel/30 rounded-lg p-3 border border-terminal-border">
      <h4 className="font-medium text-sm mb-3">{title}</h4>
      <div className="space-y-2 text-xs">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-terminal-muted">{key}</span>
            <StatusPill status={value} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MarketPanel({ dense }: { dense?: boolean } = {}) {
  const { data: now } = useSWR('market-now', api.marketNow, { revalidateOnFocus: false, dedupingInterval: 60000 })

  const marketStatus: string | undefined = now?.market
  const afterHours: boolean | undefined = now?.afterHours
  const earlyHours: boolean | undefined = now?.earlyHours
  const serverTime: string | undefined = now?.serverTime
  const currencies: Record<string, string> = now?.currencies || {}
  const exchanges: Record<string, string> = now?.exchanges || {}
  const indicesGroups: Record<string, string> = now?.indicesGroups || {}

  return (
    <Panel title="Market Status" dense={dense}>
      <div className="space-y-4 h-full">
        {/* Main Market Status - Prominent at top */}
        <div className="bg-terminal-panel/50 rounded-lg p-4 border border-terminal-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Market Overview</h3>
            {marketStatus && <StatusPill status={marketStatus} />}
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-terminal-muted text-xs uppercase tracking-wide">After Hours</div>
              <div className="font-medium">{afterHours == null ? '—' : afterHours ? 'Active' : 'Closed'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-terminal-muted text-xs uppercase tracking-wide">Early Hours</div>
              <div className="font-medium">{earlyHours == null ? '—' : earlyHours ? 'Active' : 'Closed'}</div>
            </div>
            <div className="space-y-1 col-span-2 lg:col-span-2">
              <div className="text-terminal-muted text-xs uppercase tracking-wide">Server Time</div>
              <div className="font-medium">{serverTime ? new Date(serverTime).toLocaleString() : '—'}</div>
            </div>
          </div>
        </div>

        {/* Status Grids - Organized in clean sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          <StatusSection title="Currencies" data={currencies} />
          <StatusSection title="Exchanges" data={exchanges} />
          <StatusSection title="Indices Groups" data={indicesGroups} />
        </div>
      </div>
    </Panel>
  )
}

function KVStatuses({ data }: { data: Record<string, string> }) {
  const entries = Object.entries(data || {})
  if (entries.length === 0) return <div className="text-terminal-muted text-sm">No data</div>
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      {entries.map(([k, v]) => (
        <div key={k} className="contents">
          <div className="text-terminal-muted capitalize">{k.replace(/[_-]+/g, ' ')}</div>
          <div><StatusPill status={v} /></div>
        </div>
      ))}
    </div>
  )
}
