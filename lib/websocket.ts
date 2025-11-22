// WebSocket data interfaces
export interface StockTrade {
  ev: "T"
  sym: string   // Symbol (e.g., "AAPL")
  p: number     // Price (The number to flash on screen)
  s: number     // Size (Volume of this specific trade)
  t: number     // Timestamp (Unix MS)
  x: number     // Exchange ID
}

export interface StockAgg {
  ev: "AM" | "A"
  sym: string
  v: number     // Volume in this bar
  av: number    // Accumulated Volume (Today's Total)
  op: number    // Official Open Price (Start of Day)
  o: number     // Open (This bar)
  c: number     // Close (Current price of this bar)
  h: number     // High
  l: number     // Low
}

export interface IndexValue {
  ev: "V"
  T: string     // Ticker (e.g., "I:SPX") - Note capital 'T'
  val: number   // Current Value (Use this, NOT 'p')
  t: number     // Timestamp
}

export type WebSocketMessage = StockTrade | StockAgg | IndexValue

// WebSocket connection manager
export class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  private isConnecting = false
  private messageHandlers: Set<(messages: WebSocketMessage[]) => void> = new Set()
  private connectionHandlers: Set<(connected: boolean) => void> = new Set()
  private subscribedTickers: Set<string> = new Set()

  constructor(url: string = 'ws://localhost:8080/ws') {
    this.url = url
  }

  connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return Promise.resolve()
    }

    this.isConnecting = true

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.notifyConnectionHandlers(true)
          
          // Re-subscribe to all tickers after reconnection
          this.subscribedTickers.forEach(ticker => {
            this.subscribe(ticker)
          })
          
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            // Backend sends array of messages
            const messages = Array.isArray(data) ? data : [data]
            this.notifyMessageHandlers(messages)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.isConnecting = false
          this.notifyConnectionHandlers(false)
          this.attemptReconnect()
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.isConnecting = false
          reject(error)
        }

      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      this.connect().catch(console.error)
    }, delay)
  }

  subscribe(ticker: string) {
    this.subscribedTickers.add(ticker)
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = { ticker }
      this.ws.send(JSON.stringify(message))
    //   console.log(`Subscribed to ${ticker}`)
    }
  }

  unsubscribe(ticker: string) {
    this.subscribedTickers.delete(ticker)
    // Note: The backend doesn't seem to support unsubscribe, 
    // so we rely on client-side filtering
  }

  onMessage(handler: (messages: WebSocketMessage[]) => void) {
    this.messageHandlers.add(handler)
    
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  onConnection(handler: (connected: boolean) => void) {
    this.connectionHandlers.add(handler)
    
    return () => {
      this.connectionHandlers.delete(handler)
    }
  }

  private notifyMessageHandlers(messages: WebSocketMessage[]) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(messages)
      } catch (error) {
        console.error('Error in message handler:', error)
      }
    })
  }

  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected)
      } catch (error) {
        console.error('Error in connection handler:', error)
      }
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscribedTickers.clear()
    this.reconnectAttempts = this.maxReconnectAttempts // Prevent auto-reconnect
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get getSubscribedTickers(): string[] {
    return Array.from(this.subscribedTickers)
  }
}

// Global instance
let wsManager: WebSocketManager | null = null

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager()
  }
  return wsManager
}