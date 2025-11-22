// 'use client'

// import { useRealtimeData } from '@/contexts/RealtimeDataContext'
// import { RealtimeIndex } from '@/components/RealtimeComponents'
// import { cn } from '@/lib/utils'
// import { useEffect } from 'react'

// export function MarketStatusBar({ className }: { className?: string }) {
//   const { subscribeToTicker, getIndexData } = useRealtimeData()
  
//   // Auto-subscribe to major indices for market overview
//   useEffect(() => {
//     subscribeToTicker('I:SPX')
//     subscribeToTicker('I:NDX') 
//     subscribeToTicker('I:DJI')
//   }, [subscribeToTicker])

//   const majorIndices = [
//     { ticker: 'I:SPX', label: 'S&P 500', icon: '📈' },
//     { ticker: 'I:NDX', label: 'Nasdaq', icon: '💻' },
//     { ticker: 'I:DJI', label: 'Dow Jones', icon: '🏭' }
//   ]

//   return (
//     <div className={cn('bg-terminal-background border-b-2 border-terminal-border px-4 py-2', className)}>
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-1">
//           <span className="text-terminal-success font-bold text-lg">🔴</span>
//           <span className="font-bold text-terminal-foreground">LIVE MARKET</span>
//         </div>
        
//         <div className="flex items-center gap-6">
//           {majorIndices.map(({ ticker, label, icon }) => {
//             const data = getIndexData(ticker)
//             return (
//               <div key={ticker} className="flex items-center gap-2">
//                 <span className="text-sm">{icon}</span>
//                 <div className="text-center">
//                   <div className="text-xs text-terminal-muted font-bold">{label}</div>
//                   <RealtimeIndex ticker={ticker} size="sm" />
//                 </div>
//               </div>
//             )
//           })}
//         </div>
        
//         <div className="text-xs text-terminal-muted">
//           {new Date().toLocaleTimeString()}
//         </div>
//       </div>
//     </div>
//   )
// }