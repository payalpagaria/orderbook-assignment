"use client"

import { useEffect, useRef } from 'react'
import { useOrderBookStore } from '../store/orderBookStore'
import { normalizeDeribit } from '../lib/utils/normalize'

export function useDeribitWebSocket(symbol = 'BTC-PERPETUAL') {
  const update = useOrderBookStore((s) => s.updateOrderBook)
  const pending = useRef(null)

  useEffect(() => {
    const socket = new WebSocket('wss://www.deribit.com/ws/api/v2')

    socket.onopen = () => {
      console.log('[Deribit WS] Connected')
      socket.send(JSON.stringify({
        jsonrpc: '2.0',
        id: 42,
        method: 'public/subscribe',
        params: {
          channels: [`book.${symbol}.none.10.100ms`]
        }
      }))
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      const data = message?.params?.data

      if (data?.bids && data?.asks) {
        
        pending.current = normalizeDeribit(data)
      }
    }
console.log('Updating Deribit OrderBook', pending.current)

    const interval = setInterval(() => {
      if (pending.current) {
        update('Deribit', pending.current)
      
        pending.current = null
      }
    }, 700)

    return () => {
      socket.close()
      clearInterval(interval)
      console.log('[Deribit WS] Disconnected')
    }
  }, [symbol])
  
}
