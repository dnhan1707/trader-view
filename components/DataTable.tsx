export function DataTable({ rows, columns }: { rows: any; columns: string[] }) {
  const data = Array.isArray(rows) ? rows : []
  if (data.length === 0) return <div className="text-terminal-muted">No data</div>
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead className="text-terminal-muted">
          <tr>
            {columns.map((c) => (
              <th key={c} className="text-left font-medium px-2 py-1 border-b border-terminal-border whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i} className="odd:bg-white/5">
              {columns.map((c) => (
                <td key={c} className="px-2 py-1 whitespace-nowrap align-top">
                  {formatValue(r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatValue(v: any) {
  if (v == null) return ''
  if (typeof v === 'number') return Number.isInteger(v) ? v.toString() : v.toFixed(4)
  if (typeof v === 'string') return v
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}
