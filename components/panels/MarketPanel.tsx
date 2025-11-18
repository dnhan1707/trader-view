'use client'

import useSWR from 'swr'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'

export function MarketPanel() {
  const { data: now } = useSWR('market-now', api.marketNow)
  const { data: hols } = useSWR('market-upcoming', api.marketUpcoming)

  return (
    <Panel title="Market">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="panel">
          <div className="panel-header">Status (Now)</div>
          <div className="panel-body text-sm">
            {now ? <pre className="whitespace-pre-wrap">{JSON.stringify(now, null, 2)}</pre> : <div className="text-terminal-muted">Loading...</div>}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">Upcoming Holidays</div>
          <div className="panel-body text-sm">
            {Array.isArray(hols) ? (
              <ul className="space-y-2">
                {hols.map((h: any, i: number) => (
                  <li key={i} className="flex items-center justify-between border-b border-terminal-border/60 pb-2">
                    <span>{h?.name || h?.holiday || 'Holiday'}</span>
                    <span className="text-terminal-muted">{h?.date || h?.when || ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-terminal-muted">Loading...</div>
            )}
          </div>
        </div>
      </div>
    </Panel>
  )
}
