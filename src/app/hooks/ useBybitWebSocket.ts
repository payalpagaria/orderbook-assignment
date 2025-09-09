"use client"

import { useEffect, useRef } from 'react'
import { useOrderBookStore } from '../store/orderBookStore'
import { normalizeBybit } from '../lib/utils/normalize'

// --- minimal types used locally ---
type Level = { price: number; amount: number }
type OrderBook = { bids: Level[]; asks: Level[] }

// If your normalizer can return null for bad payloads, type it like this:
// declare function normalizeBybit(data: unknown): OrderBook | null;

export function useBybitWebSocket(symbol = 'BTCUSDT') {
  const update = useOrderBookStore((s) => s.updateOrderBook)
  const pending = useRef<OrderBook | null>(null) // <-- key change

  useEffect(() => {
    const socket = new WebSocket('wss://stream.bybit.com/v5/public/spot')

    const msg = {
      op: 'subscribe',
      args: [`orderbook.50.${symbol}`],
    }

    socket.onopen = () => {
      console.log('[Bybit WS] Connected')
      socket.send(JSON.stringify(msg))
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message?.topic?.startsWith('orderbook') && message?.data) {
        const normalized = normalizeBybit(message.data) as OrderBook | null
        if (normalized) pending.current = normalized
      }
    }

    const interval = setInterval(() => {
      if (pending.current) {
        // If your store types venue as a union, this will typecheck:
        // update('Bybit' as const, pending.current)
        update('Bybit', pending.current)
        pending.current = null
      }
    }, 1000)

    return () => {
      socket.close()
      clearInterval(interval)
      console.log('[Bybit WS] Disconnected')
    }
  }, [symbol, update])
}
