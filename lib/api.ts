const BASE = '/backend'

async function get<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(BASE + path, typeof window === 'undefined' ? 'http://localhost' : window.location.origin)
  if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)))
  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return (await res.json()) as T
  return (await res.text()) as unknown as T
}

export const api = {
  // health: () => get<string>('/health'), // Disabled to save API budget
  ticker: (symbol: string) => get<any>(`/api/tickers/${encodeURIComponent(symbol)}`),
  sma: (symbol: string, params?: Record<string, any>) => get<any>(`/api/indicators/sma/${encodeURIComponent(symbol)}`, params),
  // ema: (symbol: string, params?: Record<string, any>) => get<any>(`/api/indicators/ema/${encodeURIComponent(symbol)}`, params),
  // macd: (symbol: string, params?: Record<string, any>) => get<any>(`/api/indicators/macd/${encodeURIComponent(symbol)}`, params),
  // rsi: (symbol: string, params?: Record<string, any>) => get<any>(`/api/indicators/rsi/${encodeURIComponent(symbol)}`, params),
  // exchanges: (params?: Record<string, any>) => get<any>('/api/exchanges', params),
  // marketUpcoming: () => get<any[]>('/api/market/upcoming'),
  marketNow: () => get<any>('/api/market/now'),
  // conditions: (params?: Record<string, any>) => get<any>('/api/market/condition', params),
  // ipos: (params?: Record<string, any>) => get<any>('/api/ipos', params),
  // dividends: (params?: Record<string, any>) => get<any>('/api/dividends', params),
  shortInterest: (params?: Record<string, any>) => get<any>('/api/stocks/short-interest', params),
  // shortVolume: (params?: Record<string, any>) => get<any>('/api/stocks/short-volume', params),
  news: (params?: Record<string, any>) => get<any>('/api/news', params),
}

export type AnyJson = any
