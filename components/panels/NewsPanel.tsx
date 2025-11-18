'use client'

import useSWR from 'swr'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import { useSymbol } from '@/components/SymbolContext'

export function NewsPanel() {
  const { symbol } = useSymbol()
  const { data } = useSWR(['news', symbol], () => api.news({ ticker: symbol, limit: 20, order: 'desc', sort: 'published_utc' }))
  const items: any[] = data?.results || data?.data || data?.items || []

  return (
    <Panel title={`News · ${symbol}`}>
      <ul className="space-y-3">
        {items.length === 0 && <li className="text-terminal-muted">No news</li>}
        {items.map((n, i) => (
          <li key={i} className="panel">
            <div className="panel-body">
              <div className="text-sm text-terminal-muted">{n.published_utc ? new Date(n.published_utc).toLocaleString() : ''}</div>
              <div className="font-medium text-base">{n.title || n.headline || 'News'}</div>
              {n.description && <div className="text-sm mt-1 text-terminal-muted">{n.description}</div>}
              {n.url && (
                <a href={n.url} target="_blank" rel="noreferrer" className="text-terminal-info hover:underline text-sm">
                  Open source ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
