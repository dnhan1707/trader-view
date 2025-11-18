'use client'

import { useEffect, useRef } from 'react'
import { useSymbol } from './SymbolContext'

export function Topbar({
  viewMode,
  setViewMode,
  dense,
  setDense,
  showSidebar,
  setShowSidebar,
}: {
  viewMode: 'tabs' | 'dashboard'
  setViewMode: (m: 'tabs' | 'dashboard') => void
  dense: boolean
  setDense: (v: boolean) => void
  showSidebar: boolean
  setShowSidebar: (v: boolean) => void
}) {
  const { symbol, setSymbol } = useSymbol()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !/input|textarea|select/i.test((e.target as HTMLElement)?.tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="h-full flex items-center justify-between px-3 bg-terminal-panel">
      <div className="flex items-center gap-3">
        <div className="font-semibold tracking-wide">Trader View</div>
        <div className="text-xs text-terminal-muted">Fast Terminal UI</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="px-2 py-1 rounded border border-terminal-border text-xs hover:bg-white/5"
          title="Toggle Sidebar"
        >
          {showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
        </button>
        <button
          onClick={() => setViewMode(viewMode === 'tabs' ? 'dashboard' : 'tabs')}
          className="px-2 py-1 rounded border border-terminal-border text-xs hover:bg-white/5"
          title="Switch View"
        >
          {viewMode === 'tabs' ? 'Dashboard' : 'Tabs'}
        </button>
        <button
          onClick={() => setDense(!dense)}
          className={`px-2 py-1 rounded border text-xs hover:bg-white/5 ${dense ? 'border-terminal-accent/60' : 'border-terminal-border'}`}
          title="Toggle Compact Mode"
        >
          {dense ? 'Compact: On' : 'Compact: Off'}
        </button>
        <input
          ref={inputRef}
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase().trim())}
          placeholder="Symbol e.g. AAPL"
          className="px-3 py-1.5 rounded bg-black/30 border border-terminal-border outline-none focus:border-terminal-accent/60 text-sm w-64"
        />
        <span className="text-xs text-terminal-muted">/ to focus</span>
      </div>
    </div>
  )
}
