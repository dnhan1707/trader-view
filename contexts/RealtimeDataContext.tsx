'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { WebSocketManager, WebSocketMessage, StockTrade, StockAgg, IndexValue, getWebSocketManager } from '@/lib/websocket'

// Real-time data state interfaces
export interface RealtimeStockData {
  ticker: string
  currentPrice: number
  lastTradeTime: number
  
  // From aggregates
  open?: number
  close?: number
  high?: number
  low?: number
  volume?: number // Bar volume (this specific candle)
  accumulatedVolume?: number // Total volume traded today (CRITICAL for header)
  officialOpen?: number
  prevClose?: number // Previous day close for correct change calculation
  
  // Derived
  priceChange?: number
  priceChangePercent?: number
  
  // UI state
  lastPriceDirection?: 'up' | 'down' | 'neutral'
  flashPrice?: boolean
}

export interface RealtimeIndexData {
  ticker: string
  value: number
  lastUpdateTime: number
  
  // UI state  
  lastDirection?: 'up' | 'down' | 'neutral'
  flashValue?: boolean
}

interface RealtimeDataContextType {
  // Connection state
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  
  // Data
  stocks: Map<string, RealtimeStockData>
  indices: Map<string, RealtimeIndexData>
  
  // Actions
  subscribeToTicker: (ticker: string) => void
  unsubscribeFromTicker: (ticker: string) => void
  getStockData: (ticker: string) => RealtimeStockData | undefined
  getIndexData: (ticker: string) => RealtimeIndexData | undefined
  
  // Subscriptions
  subscribedTickers: string[]
}

const RealtimeDataContext = createContext<RealtimeDataContextType | undefined>(undefined)

export function useRealtimeData() {
  const context = useContext(RealtimeDataContext)
  if (!context) {
    throw new Error('useRealtimeData must be used within a RealtimeDataProvider')
  }
  return context
}

interface RealtimeDataProviderProps {
  children: React.ReactNode
}

export function RealtimeDataProvider({ children }: RealtimeDataProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [stocks, setStocks] = useState<Map<string, RealtimeStockData>>(new Map())
  const [indices, setIndices] = useState<Map<string, RealtimeIndexData>>(new Map())
  const [subscribedTickers, setSubscribedTickers] = useState<string[]>([])
  
  const wsManagerRef = useRef<WebSocketManager>()
  const stocksRef = useRef(stocks)
  const indicesRef = useRef(indices)
  
  // Keep refs up to date for use in callbacks
  useEffect(() => {
    stocksRef.current = stocks
  }, [stocks])
  
  useEffect(() => {
    indicesRef.current = indices
  }, [indices])

  // Initialize WebSocket connection
  useEffect(() => {
    const wsManager = getWebSocketManager()
    wsManagerRef.current = wsManager

    setConnectionStatus('connecting')
    
    // Connection status handler
    const unsubscribeConnection = wsManager.onConnection((connected) => {
      setIsConnected(connected)
      setConnectionStatus(connected ? 'connected' : 'disconnected')
    })

    // Message handler with client-side filtering and efficient state updates
    const unsubscribeMessages = wsManager.onMessage((messages: WebSocketMessage[]) => {
      const stockUpdates = new Map(stocksRef.current)
      const indexUpdates = new Map(indicesRef.current)
      let hasStockUpdates = false
      let hasIndexUpdates = false

      messages.forEach(message => {
        try {
          if (message.ev === 'T') {
            // Stock Trade - Live price updates ONLY
            // DO NOT calculate price change here - we need prevClose first
            const trade = message as StockTrade
            const existing = stockUpdates.get(trade.sym)
            
            stockUpdates.set(trade.sym, {
              ...existing,
              ticker: trade.sym,
              currentPrice: trade.p,
              lastTradeTime: trade.t,
              // Price change calculation moved to when we have prevClose
              priceChange: existing?.prevClose ? trade.p - existing.prevClose : existing?.priceChange,
              priceChangePercent: existing?.prevClose ? 
                ((trade.p - existing.prevClose) / existing.prevClose) * 100 : existing?.priceChangePercent,
              lastPriceDirection: existing?.prevClose && trade.p !== existing.prevClose ?
                (trade.p > existing.prevClose ? 'up' : 'down') : existing?.lastPriceDirection || 'neutral',
              flashPrice: true
            })
            hasStockUpdates = true

          } else if (message.ev === 'AM' || message.ev === 'A') {
            // Stock Aggregate - OHLC data with CORRECT volume mapping
            const agg = message as StockAgg
            const existing = stockUpdates.get(agg.sym)
            
            stockUpdates.set(agg.sym, {
              ...existing,
              ticker: agg.sym,
              currentPrice: existing?.currentPrice || agg.c,
              lastTradeTime: existing?.lastTradeTime || Date.now(),
              open: agg.o,
              close: agg.c,
              high: agg.h,
              low: agg.l,
              volume: agg.v,  // Bar volume (for charts) - this specific candle
              accumulatedVolume: agg.av,  // CRITICAL: Total volume today (for header display)
              officialOpen: agg.op
            })
            hasStockUpdates = true

          } else if (message.ev === 'V') {
            // Index Value
            const index = message as IndexValue
            const existing = indexUpdates.get(index.T)
            
            const valueChange = existing ? index.val - existing.value : 0
            
            indexUpdates.set(index.T, {
              ...existing,
              ticker: index.T,
              value: index.val,
              lastUpdateTime: index.t,
              lastDirection: valueChange > 0 ? 'up' : valueChange < 0 ? 'down' : 'neutral',
              flashValue: true
            })
            hasIndexUpdates = true
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', message, error)
        }
      })

      // Batch state updates to prevent excessive re-renders
      if (hasStockUpdates) {
        setStocks(stockUpdates)
      }
      if (hasIndexUpdates) {
        setIndices(indexUpdates)
      }
    })

    // Connect
    wsManager.connect().catch(error => {
      console.error('Failed to connect to WebSocket:', error)
      setConnectionStatus('error')
    })

    // Update subscribed tickers list
    setSubscribedTickers(wsManager.getSubscribedTickers)

    return () => {
      unsubscribeConnection()
      unsubscribeMessages()
    }
  }, [])

  // Clear flash states after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setStocks(prev => {
        const updated = new Map(prev)
        let hasChanges = false
        
        updated.forEach((data, ticker) => {
          if (data.flashPrice) {
            updated.set(ticker, { ...data, flashPrice: false })
            hasChanges = true
          }
        })
        
        return hasChanges ? updated : prev
      })
      
      setIndices(prev => {
        const updated = new Map(prev)
        let hasChanges = false
        
        updated.forEach((data, ticker) => {
          if (data.flashValue) {
            updated.set(ticker, { ...data, flashValue: false })
            hasChanges = true
          }
        })
        
        return hasChanges ? updated : prev
      })
    }, 500) // Flash duration
    
    return () => clearTimeout(timer)
  }, [stocks, indices])

  const subscribeToTicker = useCallback((ticker: string) => {
    if (wsManagerRef.current) {
      wsManagerRef.current.subscribe(ticker)
      setSubscribedTickers(wsManagerRef.current.getSubscribedTickers)
    }
  }, [])

  const unsubscribeFromTicker = useCallback((ticker: string) => {
    if (wsManagerRef.current) {
      wsManagerRef.current.unsubscribe(ticker)
      setSubscribedTickers(wsManagerRef.current.getSubscribedTickers)
      
      // Remove from our state
      setStocks(prev => {
        const updated = new Map(prev)
        updated.delete(ticker)
        return updated
      })
      
      setIndices(prev => {
        const updated = new Map(prev)
        updated.delete(ticker)
        return updated
      })
    }
  }, [])

  const getStockData = useCallback((ticker: string) => {
    return stocks.get(ticker)
  }, [stocks])

  const getIndexData = useCallback((ticker: string) => {
    return indices.get(ticker)
  }, [indices])

  return (
    <RealtimeDataContext.Provider value={{
      isConnected,
      connectionStatus,
      stocks,
      indices,
      subscribeToTicker,
      unsubscribeFromTicker,
      getStockData,
      getIndexData,
      subscribedTickers
    }}>
      {children}
    </RealtimeDataContext.Provider>
  )
}