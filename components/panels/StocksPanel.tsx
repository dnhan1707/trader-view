'use client'

import useSWR from 'swr'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import { useSymbol } from '@/components/SymbolContext'
import { DataTable } from '@/components/DataTable'

export function StocksPanel() {
  const { symbol } = useSymbol()
  const { data: shortI } = useSWR(['shortI', symbol], () => api.shortInterest({ ticker: symbol, limit: 100 }))
  const { data: shortV } = useSWR(['shortV', symbol], () => api.shortVolume({ ticker: symbol, limit: 100 }))

  const rowsI = shortI?.results || shortI?.data || shortI?.items || []
  const rowsV = shortV?.results || shortV?.data || shortV?.items || []

  return (
    <Panel title={`Stocks · ${symbol}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="panel">
          <div className="panel-header">Short Interest</div>
          <div className="panel-body">
            <DataTable rows={rowsI} columns={inferColumns(rowsI)} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">Short Volume</div>
          <div className="panel-body">
            <DataTable rows={rowsV} columns={inferColumns(rowsV)} />
          </div>
        </div>
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
