'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type SymbolContextType = {
  symbol: string
  setSymbol: (s: string) => void
}

const Ctx = createContext<SymbolContextType | undefined>(undefined)

export function SymbolProvider({ children }: { children: React.ReactNode }) {
  const [symbol, setSymbol] = useState<string>('AAPL')

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('symbol') : null
    if (saved) setSymbol(saved)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('symbol', symbol)
  }, [symbol])

  const value = useMemo(() => ({ symbol, setSymbol }), [symbol])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSymbol() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSymbol must be used within SymbolProvider')
  return ctx
}
