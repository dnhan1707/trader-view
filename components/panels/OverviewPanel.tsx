'use client'

import useSWR from 'swr'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import { useSymbol } from '@/components/SymbolContext'

export function OverviewPanel() {
  const { symbol } = useSymbol()
  const { data, error, isLoading } = useSWR(['ticker', symbol], () => api.ticker(symbol), { revalidateOnFocus: false })
  const { data: health } = useSWR('health', () => api.health(), { revalidateOnFocus: false })

  return (
    <Panel
      title={`Overview · ${symbol}`}
      actions={<span className={`px-2 py-0.5 rounded text-xs ${health === 'ok' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>API: {health || '...'}</span>}
    >
      {isLoading && <div className="text-terminal-muted">Loading...</div>}
      {error && <div className="text-terminal-danger">Error: {String(error.message || error)}</div>}
      {data && <KeyValueGrid obj={data} />}
    </Panel>
  )
}

function KeyValueGrid({ obj }: { obj: any }) {
  if (!obj || typeof obj !== 'object') return <div>Unexpected response</div>
  const entries = Object.entries(obj)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {entries.map(([k, v]) => (
        <div key={k} className="panel">
          <div className="panel-header text-terminal-muted">{k}</div>
          <div className="panel-body text-sm break-words">{formatValue(v)}</div>
        </div>
      ))}
    </div>
  )
}

function formatValue(v: any): string {
  if (v == null) return ''
  if (typeof v === 'object') return JSON.stringify(v, null, 2)
  return String(v)
}
