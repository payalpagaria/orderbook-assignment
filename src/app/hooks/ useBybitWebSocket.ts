"use client"

import { useEffect, useRef } from 'react'
import { useOrderBookStore } from '../store/orderBookStore'
import { normalizeBybit } from '../lib/utils/normalize'

export function useBybitWebSocket(symbol = 'BTCUSDT') {
  const update = useOrderBookStore((s) => s.updateOrderBook)
  const pending = useRef(null)

  useEffect(() => {
    const socket = new WebSocket('wss://stream.bybit.com/v5/public/spot')

    const msg = {
      op: 'subscribe',
      args: [`orderbook.50.${symbol}`]
    }

    socket.onopen = () => {
      console.log('[Bybit WS] Connected')
      socket.send(JSON.stringify(msg))
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message?.topic?.startsWith('orderbook') && message?.data) {
        pending.current = normalizeBybit(message.data)
      }
    }

    const interval = setInterval(() => {
      if (pending.current) {
        update('Bybit', pending.current)
        pending.current = null
      }
    }, 1000)

    return () => {
      socket.close()
      clearInterval(interval)
      console.log('[Bybit WS] Disconnected')
    }
  }, [symbol])
}
