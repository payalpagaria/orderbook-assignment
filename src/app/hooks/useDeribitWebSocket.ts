"use client"

import { useEffect, useRef } from 'react'
import { useOrderBookStore } from '../store/orderBookStore'
import { normalizeDeribit } from '../lib/utils/normalize'

// --- minimal local types ---
type Level = { price: number; amount: number }
type OrderBook = { bids: Level[]; asks: Level[] }

// If your normalizer may return null, make sure it’s typed as:
// declare function normalizeDeribit(data: unknown): OrderBook | null;

export function useDeribitWebSocket(symbol = 'BTC-PERPETUAL') {
  const update = useOrderBookStore((s) => s.updateOrderBook)
  const pending = useRef<OrderBook | null>(null) // <-- key change

  useEffect(() => {
    const socket = new WebSocket('wss://www.deribit.com/ws/api/v2')

    socket.onopen = () => {
      console.log('[Deribit WS] Connected')
      socket.send(JSON.stringify({
        jsonrpc: '2.0',
        id: 42,
        method: 'public/subscribe',
        params: { channels: [`book.${symbol}.none.10.100ms`] }
      }))
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      const data = message?.params?.data

      if (data?.bids && data?.asks) {
        const normalized = normalizeDeribit(data) as OrderBook | null
        if (normalized) pending.current = normalized
      }
    }

    const interval = setInterval(() => {
      if (pending.current) {
        // If your store types venue as a union, this also checks:
        // update('Deribit' as const, pending.current)
        update('Deribit', pending.current)
        // Optional: log here to see what you actually flushed:
        // console.log('Updating Deribit OrderBook', pending.current)
        pending.current = null
      }
    }, 700)

    return () => {
      socket.close()
      clearInterval(interval)
      console.log('[Deribit WS] Disconnected')
    }
  }, [symbol, update]) // include update to satisfy hooks lint rule
}
