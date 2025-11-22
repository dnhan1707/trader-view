'use client'

import { useState } from 'react'
import { Panel } from '@/components/Panel'
import { useRealtimeData } from '@/contexts/RealtimeDataContext'
import { RealtimePrice, RealtimeIndex } from '@/components/RealtimeComponents'
import { useSymbol } from '@/components/SymbolContext'

export function TickerManagerPanel({ dense }: { dense?: boolean } = {}) {
  const [inputTicker, setInputTicker] = useState('')
  const { subscribeToTicker, getStockData, getIndexData } = useRealtimeData()
  const { setSymbol } = useSymbol()

  const handleSelectStock = (ticker: string) => {
    setSymbol(ticker)
    subscribeToTicker(ticker)
    setInputTicker('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputTicker.trim()) {
      handleSelectStock(inputTicker.trim().toUpperCase())
    }
  }

  // Popular stocks for quick selection
  const popularTickers = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'
  ]

  return (
    <Panel title="Stock Selector" dense={dense}>
      <div className="space-y-4">
        {/* Stock Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputTicker}
            onChange={(e) => setInputTicker(e.target.value)}
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="flex-1 px-3 py-2 bg-terminal-background border border-terminal-border rounded text-sm focus:outline-none focus:border-terminal-success font-mono uppercase"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-terminal-success text-terminal-background border border-terminal-success rounded text-sm font-medium hover:bg-terminal-success/90 transition-colors"
          >
            SELECT
          </button>
        </form>

        {/* Quick Stock Selection */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-terminal-muted">Quick Select</h4>
          <div className="grid grid-cols-4 gap-2">
            {popularTickers.map((ticker) => (
              <button
                key={ticker}
                onClick={() => handleSelectStock(ticker)}
                className="px-2 py-1 bg-terminal-panel border border-terminal-border rounded text-xs font-mono hover:border-terminal-success transition-colors"
              >
                {ticker}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  )
}