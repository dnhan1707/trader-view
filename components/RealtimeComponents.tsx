'use client'

import { useRealtimeData } from '@/contexts/RealtimeDataContext'
import { cn } from '@/lib/utils'

interface RealtimePriceProps {
  ticker: string
  className?: string
  showChange?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function RealtimePrice({ 
  ticker, 
  className, 
  showChange = true,
  size = 'md'
}: RealtimePriceProps) {
  const { getStockData } = useRealtimeData()
  const data = getStockData(ticker)

  if (!data) {
    return (
      <div className={cn('text-terminal-muted', className)}>
        —
      </div>
    )
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl font-bold'
  }

  const priceDirection = data.lastPriceDirection
  const flashClass = ''

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Current Price - Prominent */}
      <span 
        className={cn(
          sizeClasses[size],
          'font-mono transition-all duration-300',
          {
            'text-terminal-success': priceDirection === 'up',
            'text-terminal-danger': priceDirection === 'down',
            'text-terminal-foreground': priceDirection === 'neutral'
          },
          flashClass
        )}
      >
        ${data.currentPrice.toFixed(2)}
      </span>

      {/* Price Change - Enhanced for traders */}
      {showChange && data.priceChange !== undefined && data.priceChangePercent !== undefined && (
        <div className={cn(
          'flex items-center gap-2 text-xs font-mono',
          size === 'lg' ? 'text-sm' : 'text-xs'
        )}>
          <span 
            className={cn(
              'font-bold px-1 py-0.5 rounded',
              {
                'text-terminal-success bg-terminal-success/20': data.priceChange > 0,
                'text-terminal-danger bg-terminal-danger/20': data.priceChange < 0,
                'text-terminal-muted bg-terminal-muted/20': data.priceChange === 0
              }
            )}
          >
            {data.priceChange > 0 ? '+' : ''}{data.priceChange.toFixed(2)}
          </span>
          <span 
            className={cn(
              'font-bold',
              {
                'text-terminal-success': data.priceChangePercent > 0,
                'text-terminal-danger': data.priceChangePercent < 0,
                'text-terminal-muted': data.priceChangePercent === 0
              }
            )}
          >
            ({data.priceChangePercent > 0 ? '+' : ''}{data.priceChangePercent.toFixed(2)}%)
          </span>
        </div>
      )}
    </div>
  )
}

interface RealtimeIndexProps {
  ticker: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function RealtimeIndex({ 
  ticker, 
  className,
  size = 'md'
}: RealtimeIndexProps) {
  const { getIndexData } = useRealtimeData()
  const data = getIndexData(ticker)

  if (!data) {
    return (
      <div className={cn('text-terminal-muted', className)}>
        —
      </div>
    )
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl font-bold'
  }

  const direction = data.lastDirection
  const flashClass = ''

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <span 
        className={cn(
          sizeClasses[size],
          'font-mono transition-all duration-300',
          {
            'text-terminal-success': direction === 'up',
            'text-terminal-danger': direction === 'down',
            'text-terminal-foreground': direction === 'neutral'
          },
          flashClass
        )}
      >
        {data.value.toFixed(2)}
      </span>
      {size === 'lg' && (
        <div className={cn(
          'text-xs font-bold mt-1',
          {
            'text-terminal-success': direction === 'up',
            'text-terminal-danger': direction === 'down',
            'text-terminal-muted': direction === 'neutral'
          }
        )}>
          {direction === 'up' ? 'UP' : direction === 'down' ? 'DOWN' : 'FLAT'}
        </div>
      )}
    </div>
  )
}

interface ConnectionStatusProps {
  className?: string
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const { connectionStatus, isConnected, subscribedTickers } = useRealtimeData()

  const statusConfig = {
    connected: { 
      color: 'text-terminal-success', 
      bg: 'bg-terminal-success/20', 
      text: 'Connected',
      indicator: 'LIVE'
    },
    connecting: { 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-400/20', 
      text: 'Connecting...',
      indicator: 'WAIT'
    },
    disconnected: { 
      color: 'text-terminal-muted', 
      bg: 'bg-terminal-muted/20', 
      text: 'Disconnected',
      indicator: 'OFF'
    },
    error: { 
      color: 'text-terminal-danger', 
      bg: 'bg-terminal-danger/20', 
      text: 'Error',
      indicator: 'ERR'
    }
  }

  const config = statusConfig[connectionStatus]

  return (
    <div className={cn('flex items-center gap-2 text-xs', className)}>
      <div className={cn('flex items-center gap-1 px-2 py-1 rounded', config.bg)}>
        <span className={cn(config.color, 'font-bold text-xs')}>{config.indicator}</span>
        <span className={cn(config.color)}>{config.text}</span>
      </div>
      
      {subscribedTickers.length > 0 && (
        <span className="text-terminal-muted">
          {subscribedTickers.length} subscriptions
        </span>
      )}
    </div>
  )
}

interface TickerSubscriptionProps {
  ticker: string
  label?: string
  className?: string
}

export function TickerSubscription({ ticker, label, className }: TickerSubscriptionProps) {
  const { subscribeToTicker, unsubscribeFromTicker, subscribedTickers } = useRealtimeData()
  
  const isSubscribed = subscribedTickers.includes(ticker)
  
  const handleToggle = () => {
    if (isSubscribed) {
      unsubscribeFromTicker(ticker)
    } else {
      subscribeToTicker(ticker)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors',
        isSubscribed 
          ? 'bg-terminal-success/20 text-terminal-success border border-terminal-success/50' 
          : 'bg-terminal-panel/50 text-terminal-muted border border-terminal-border hover:border-terminal-success/50',
        className
      )}
    >
      <span className={cn('text-xs font-bold', isSubscribed ? 'text-terminal-success' : 'text-terminal-muted')}>
        {isSubscribed ? 'ON' : 'OFF'}
      </span>
      <span>{label || ticker}</span>
    </button>
  )
}