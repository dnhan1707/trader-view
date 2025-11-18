'use client'

import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import { useSymbol } from '@/components/SymbolContext'
import { IndicatorChart, toSeriesPoints } from '@/components/IndicatorChart'
import { DataTable } from '@/components/DataTable'

type IndicatorKind = 'SMA' | 'EMA' | 'MACD' | 'RSI'

export function IndicatorsPanel() {
  const { symbol } = useSymbol()
  const [kind, setKind] = useState<IndicatorKind>('SMA')
  const [windowSize, setWindowSize] = useState<number>(14)
  const [limit, setLimit] = useState<number>(200)

  const key = useMemo(() => ['ind', kind, symbol, windowSize, limit] as const, [kind, symbol, windowSize, limit])

  const { data, error, isLoading } = useSWR(key, async () => {
    const p = { window: windowSize, limit }
    if (kind === 'SMA') return api.sma(symbol, p)
    if (kind === 'EMA') return api.ema(symbol, p)
    if (kind === 'MACD') return api.macd(symbol, { short_window: 12, long_window: 26, signal_window: 9, limit })
    return api.rsi(symbol, p)
  })

  const results: any[] = useMemo(() => data?.results || data?.data || data?.items || data?.values || [], [data])
  const series = useMemo(() => toSeriesPoints(results), [results])

  return (
    <Panel
      title={`Indicators · ${symbol}`}
      actions={
        <div className="flex items-center gap-2">
          <select value={kind} onChange={(e) => setKind(e.target.value as IndicatorKind)} className="bg-black/30 border border-terminal-border rounded px-2 py-1 text-sm">
            <option>SMA</option>
            <option>EMA</option>
            <option>MACD</option>
            <option>RSI</option>
          </select>
          <label className="text-terminal-muted text-xs">Window</label>
          <input type="number" min={2} max={200} value={windowSize} onChange={(e) => setWindowSize(parseInt(e.target.value || '14'))} className="w-16 bg-black/30 border border-terminal-border rounded px-2 py-1 text-sm" />
          <label className="text-terminal-muted text-xs">Limit</label>
          <input type="number" min={50} max={1000} value={limit} onChange={(e) => setLimit(parseInt(e.target.value || '200'))} className="w-20 bg-black/30 border border-terminal-border rounded px-2 py-1 text-sm" />
        </div>
      }
    >
      {isLoading && <div className="text-terminal-muted">Loading...</div>}
      {error && <div className="text-terminal-danger">Error: {String(error.message || error)}</div>}
      {!!series.length && <IndicatorChart data={series} />}
      <div className="mt-3">
        <DataTable rows={results} columns={inferColumns(results)} />
      </div>
    </Panel>
  )
}

function inferColumns(rows: any[]): string[] {
  if (!Array.isArray(rows) || rows.length === 0) return []
  const keys = new Set<string>()
  for (const r of rows.slice(0, 5)) Object.keys(r || {}).forEach((k) => keys.add(k))
  return Array.from(keys)
}
