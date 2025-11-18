export function StatusPill({ status }: { status: string | boolean | number | null | undefined }) {
  const s = normalize(status)
  const color =
    s === 'ok' || s === 'open' || s === 'healthy'
      ? 'bg-green-500/20 text-green-300 border-green-400/20'
      : s === 'warn' || s === 'degraded' || s === 'afterhours'
      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/20'
      : 'bg-red-500/20 text-red-300 border-red-400/20'
  return <span className={`px-2 py-0.5 rounded text-xs border ${color}`}>{label(status)}</span>
}

function normalize(x: any): 'ok' | 'open' | 'healthy' | 'warn' | 'degraded' | 'afterhours' | 'error' {
  if (x === true) return 'ok'
  if (typeof x === 'string') {
    const v = x.toLowerCase()
    if (['ok', 'open', 'healthy'].includes(v)) return v as any
    if (['warn', 'warning', 'degraded', 'afterhours', 'after-hours'].includes(v)) return 'warn'
  }
  return 'error'
}

function label(x: any): string {
  if (x === true) return 'OK'
  if (x === false) return 'Error'
  if (typeof x === 'string') return x
  if (typeof x === 'number') return String(x)
  return 'Unknown'
}
