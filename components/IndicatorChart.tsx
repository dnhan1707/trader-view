'use client'

import { useEffect, useRef } from 'react'
import { createChart, ISeriesApi, UTCTimestamp } from 'lightweight-charts'

type SeriesPoint = { time: UTCTimestamp; value: number }

export function IndicatorChart({ data, height = 240 }: { data: SeriesPoint[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      height,
      layout: { background: { color: 'transparent' }, textColor: '#d6e2f0' },
      grid: { horzLines: { color: '#1b222c' }, vertLines: { color: '#1b222c' } },
      rightPriceScale: { borderColor: '#1b222c' },
      timeScale: { borderColor: '#1b222c' },
      crosshair: { mode: 0 },
    })
    const series = chart.addLineSeries({ color: '#00e396', lineWidth: 2 })
    seriesRef.current = series
    chartRef.current = chart
    const ro = new ResizeObserver(() => chart.applyOptions({ width: containerRef.current!.clientWidth }))
    ro.observe(containerRef.current)
    return () => {
      ro.disconnect()
      chart.remove()
    }
  }, [height])

  useEffect(() => {
    seriesRef.current?.setData(data)
  }, [data])

  return <div ref={containerRef} className="w-full" style={{ height }} />
}

export function toSeriesPoints(results: any[], valueKey?: string): SeriesPoint[] {
  if (!Array.isArray(results)) return []
  const out: SeriesPoint[] = []
  for (const r of results) {
    const t = r.timestamp || r.time || r.published_utc || r.date
    const v = valueKey ? r[valueKey] : r.value ?? r.indicator ?? r.close ?? r.price
    if (t && typeof v === 'number') {
      const ts = Math.floor(new Date(t).getTime() / 1000) as UTCTimestamp
      out.push({ time: ts, value: v })
    }
  }
  return out.sort((a, b) => a.time - b.time)
}
