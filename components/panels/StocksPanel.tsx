'use client'

import useSWR from 'swr'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import { useSymbol } from '@/components/SymbolContext'
import { DataTable } from '@/components/DataTable'

export function StocksPanel({ dense }: { dense?: boolean } = {}) {
  const { symbol } = useSymbol()
  const { data: shortI } = useSWR(['shortI', symbol], () => api.shortInterest({ ticker: symbol, limit: 50, sort: 'settlement_date.desc' }), { revalidateOnFocus: false, dedupingInterval: 300000 }) // 5 min cache

  const rowsI = shortI?.results || shortI?.data || shortI?.items || []
  // short volume disabled to stay within API rate limit

  return (
    <Panel title={`Stocks · ${symbol}`} dense={dense}>
      <div className="grid grid-cols-1 gap-3 min-h-0">
        <div className="panel flex flex-col min-h-0">
          <div className="panel-header">Short Interest</div>
          <div className="panel-body min-h-0 overflow-auto">
            <DataTable rows={rowsI} columns={inferColumns(rowsI)} />
          </div>
        </div>
        {/** Short Volume panel removed to reduce API usage */}
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
