"use client"

import { useEffect, useRef } from 'react'
import { useOrderBookStore } from '../store/orderBookStore'
import { normalizeOKX } from '../lib/utils/normalize'

export function useOKXWebSocket(symbol = 'BTC-USDT') {
  const update = useOrderBookStore((s) => s.updateOrderBook)
  const pending = useRef(null) // buffer for incoming data

  useEffect(() => {
    const socket = new WebSocket('wss://ws.okx.com:8443/ws/v5/public')

    const msg = {
      op: 'subscribe',
      args: [{ channel: 'books', instId: symbol }],
    }

    socket.onopen = () => {
      console.log('[OKX WS] Connected')
      socket.send(JSON.stringify(msg))
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (
        message?.arg?.channel === 'books' &&
        Array.isArray(message?.data) &&
        message.data.length > 0
      ) {
        pending.current = normalizeOKX(message.data[0]) // store latest data
      }
    }

    // Flush buffer to Zustand store every 1 second
    const interval = setInterval(() => {
      if (pending.current) {
        update('OKX', pending.current)
        pending.current = null
      }
    }, 700)

    return () => {
      socket.close()
      clearInterval(interval)
      console.log('[OKX WS] Disconnected')
    }
  }, [symbol])
}
