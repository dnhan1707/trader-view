'use client'

import useSWR from 'swr'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import { useState } from 'react'
import { DataTable } from '@/components/DataTable'
import { useSymbol } from '@/components/SymbolContext'

export function ReferencePanel({ dense }: { dense?: boolean } = {}) {
  const { symbol } = useSymbol()
  const [limit, setLimit] = useState(50)
  const { data: exchanges } = useSWR(['exchanges'], () => api.exchanges())
  const { data: dividends } = useSWR(['dividends', symbol, limit], () => api.dividends({ ticker: symbol, limit }))
  const { data: ipos } = useSWR(['ipos', limit], () => api.ipos({ limit }))
  const { data: cond } = useSWR(['conditions'], () => api.conditions({ asset_class: 'stocks' }))

  const rowsEx = exchanges?.results || exchanges?.data || exchanges?.items || []
  const rowsDiv = dividends?.results || dividends?.data || dividends?.items || []
  const rowsIpo = ipos?.results || ipos?.data || ipos?.items || []
  const rowsCond = cond?.results || cond?.data || cond?.items || []

  return (
    <Panel
      title="Reference"
      actions={
        <div className="flex items-center gap-2">
          <label className="text-terminal-muted text-xs">Limit</label>
          <input type="number" min={10} max={500} value={limit} onChange={(e) => setLimit(parseInt(e.target.value || '50'))} className="w-20 bg-black/30 border border-terminal-border rounded px-2 py-1 text-sm" />
        </div>
      }
      dense={dense}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="panel">
          <div className="panel-header">Exchanges</div>
          <div className="panel-body">
            <DataTable rows={rowsEx} columns={inferColumns(rowsEx)} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">Dividends · {symbol}</div>
          <div className="panel-body">
            <DataTable rows={rowsDiv} columns={inferColumns(rowsDiv)} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">IPOs</div>
          <div className="panel-body">
            <DataTable rows={rowsIpo} columns={inferColumns(rowsIpo)} />
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">Condition Codes</div>
          <div className="panel-body">
            <DataTable rows={rowsCond} columns={inferColumns(rowsCond)} />
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
