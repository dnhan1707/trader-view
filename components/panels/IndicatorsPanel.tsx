'use client'

import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import { useSymbol } from '@/components/SymbolContext'
import { IndicatorChart, toSeriesPoints } from '@/components/IndicatorChart'
import { DataTable } from '@/components/DataTable'

// Limit indicators to SMA to stay within API rate limits
type IndicatorKind = 'SMA'

export function IndicatorsPanel({ dense }: { dense?: boolean } = {}) {
  const { symbol } = useSymbol()
  const [kind] = useState<IndicatorKind>('SMA')
  const [windowSize, setWindowSize] = useState<number>(14)
  const [limit, setLimit] = useState<number>(200)

  const key = useMemo(() => ['ind', kind, symbol, windowSize, limit] as const, [kind, symbol, windowSize, limit])

  const { data, error, isLoading } = useSWR(key, async () => {
    const p = { window: windowSize, limit }
    return api.sma(symbol, p)
  }, { revalidateOnFocus: false, dedupingInterval: 60000 })

  // SMA sample shape: { results: { values: [{ timestamp, value }, ...], underlying: {...} }, status: 'OK' }
  const values: any[] = useMemo(() => {
    if (Array.isArray(data?.results?.values)) return data.results.values
    if (Array.isArray(data?.values)) return data.values
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.items)) return data.items
    return []
  }, [data])

  const series = useMemo(() => toSeriesPoints(values), [values])
  const tableRows = useMemo(
    () =>
      values.map((r: any) => ({
        time: r?.timestamp ? new Date(r.timestamp).toLocaleDateString() : r?.time ?? '',
        value: typeof r?.value === 'number' ? r.value : Number(r?.value ?? 0),
      })),
    [values]
  )

  return (
    <Panel
      title={`Indicators · ${symbol}`}
      actions={
        <div className="flex items-center gap-2">
          <span className="text-xs text-terminal-muted">Indicator: SMA</span>
          <label className="text-terminal-muted text-xs">Window</label>
          <input type="number" min={2} max={200} value={windowSize} onChange={(e) => setWindowSize(parseInt(e.target.value || '14'))} className="w-16 bg-black/30 border border-terminal-border rounded px-2 py-1 text-sm" />
          <label className="text-terminal-muted text-xs">Limit</label>
          <input type="number" min={50} max={1000} value={limit} onChange={(e) => setLimit(parseInt(e.target.value || '200'))} className="w-20 bg-black/30 border border-terminal-border rounded px-2 py-1 text-sm" />
        </div>
      }
      dense={dense}
    >
      {isLoading && <div className="text-terminal-muted">Loading...</div>}
      {error && <div className="text-terminal-danger">Error: {String(error.message || error)}</div>}
      {!!series.length && <IndicatorChart data={series} />}
      {data?.results?.underlying?.url && (
        <div className="text-xs text-terminal-muted mt-2">
          Underlying: <a href={data.results.underlying.url} target="_blank" rel="noreferrer" className="text-terminal-info hover:underline">open ↗</a>
        </div>
      )}
      <div className="mt-3">
        <DataTable rows={tableRows} columns={["time", "value"]} />
      </div>
    </Panel>
  )
}

