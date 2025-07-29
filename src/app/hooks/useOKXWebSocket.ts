"use client"

import { useEffect, useRef, useState } from 'react'
import { useOrderBookStore } from '../store/orderBookStore'
import { normalizeOKX } from '../lib/utils/normalize'
import { fetchOKXOrderBook } from '../lib/api/okx'

type OrderBook = {
  bids: { price: number; amount: number }[]
  asks: { price: number; amount: number }[]
}

export function useOKXWebSocket(symbol = 'BTC-USDT') {
  const update = useOrderBookStore((s) => s.updateOrderBook)
  const pending = useRef<OrderBook | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [isPolling, setIsPolling] = useState(false)
  const maxReconnectAttempts = 5
  const reconnectDelay = 3000
  const pollingInterval = 2000 // Poll every 2 seconds when WebSocket fails

  const startPolling = () => {
    if (isPolling) return
    
    console.log('[OKX] Starting REST API polling as fallback')
    setIsPolling(true)
    
    const poll = async () => {
      try {
        const data = await fetchOKXOrderBook(symbol)
        if (data) {
          const normalizedData = normalizeOKX(data)
          update('OKX', normalizedData)
        }
      } catch (error) {
        console.error('[OKX Polling] Error:', error)
      }
    }

    // Initial poll
    poll()

    // Set up polling interval
    pollingIntervalRef.current = setInterval(poll, pollingInterval)
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setIsPolling(false)
    console.log('[OKX] Stopped polling')
  }

  const connect = () => {
    try {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        return
      }

      stopPolling()

      console.log('[OKX WS] Connecting...')
      const socket = new WebSocket('wss://ws.okx.com:8443/ws/v5/public')
      socketRef.current = socket

      const msg = {
        op: 'subscribe',
        args: [{ channel: 'books', instId: symbol }],
      }

      socket.onopen = () => {
        console.log('[OKX WS] Connected successfully')
        setReconnectAttempts(0)
        socket.send(JSON.stringify(msg))
      }

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (
            message?.arg?.channel === 'books' &&
            Array.isArray(message?.data) &&
            message.data.length > 0
          ) {
            pending.current = normalizeOKX(message.data[0])
          }
        } catch (error) {
          console.error('[OKX WS] Message parsing error:', error)
        }
      }

      socket.onerror = (error) => {
        console.error('[OKX WS] Error:', error)
      }

      socket.onclose = (event) => {
        console.log('[OKX WS] Disconnected:', event.code, event.reason)
        socketRef.current = null
        
        // Attempt reconnection if not manually closed
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          console.log(`[OKX WS] Reconnecting in ${reconnectDelay}ms... (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`)
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, reconnectDelay)
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.log('[OKX WS] Max reconnection attempts reached. Falling back to polling.')
          startPolling()
        }
      }
    } catch (error) {
      console.error('[OKX WS] Connection error:', error)
      // Start polling if WebSocket connection fails completely
      if (reconnectAttempts >= maxReconnectAttempts) {
        startPolling()
      }
    }
  }

  useEffect(() => {
    connect()

    // Update store with pending data (for WebSocket)
    const interval = setInterval(() => {
      if (pending.current && !isPolling) {
        update('OKX', pending.current)
        pending.current = null
      }
    }, 700)

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting')
      }
      stopPolling()
      clearInterval(interval)
      console.log('[OKX] Cleanup completed')
    }
  }, [symbol])

  // Return connection status for debugging
  return {
    isConnected: socketRef.current?.readyState === WebSocket.OPEN,
    isPolling,
    reconnectAttempts
  }
}
