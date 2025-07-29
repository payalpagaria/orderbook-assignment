"use client"

import { useState } from 'react'
import './OrderSimulationForm.css'
import { useOrderBookStore } from '@/app/store/orderBookStore'
const venues = ['OKX', 'Bybit', 'Deribit']
const orderTypes = ['Market', 'Limit']
const sides = ['Buy', 'Sell']
const delays = ['Immediate', '5s', '10s', '30s']

export default function OrderSimulationForm() {
const venue = useOrderBookStore(s => s.venue)
const setVenue = useOrderBookStore(s => s.setVenue)
const orderBooks = useOrderBookStore(s => s.orderBooks)
  const [symbol, setSymbol] = useState('BTC-USDT')
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market')
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [timing, setTiming] = useState('Immediate')
  const [isSubmitting, setIsSubmitting] = useState(false)
const setSimulatedOrder = useOrderBookStore((s) => s.setSimulatedOrder)

  const getCurrentMarketPrice = () => {
    const currentBook = orderBooks[venue]
    if (side === 'Buy') {
      return currentBook.asks[0]?.price || 0
    } else {
      return currentBook.bids[0]?.price || 0
    }
  }

  const validateForm = () => {
    if (!symbol.trim()) {
      alert('Symbol is required')
      return false
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Quantity must be greater than 0')
      return false
    }
    if (orderType === 'Limit') {
      if (!price || parseFloat(price) <= 0) {
        alert('Price must be greater than 0 for limit orders')
        return false
      }
    }
    const currentBook = orderBooks[venue]
    if (currentBook.bids.length === 0 && currentBook.asks.length === 0) {
      alert(`No orderbook data available for ${venue}. Please wait for connection.`)
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    const delayMs = timing === 'Immediate' ? 0 : parseInt(timing.replace('s', '')) * 1000
    const orderPrice = orderType === 'Market' ? getCurrentMarketPrice() : parseFloat(price)
    
    const payload = {
      venue, 
      symbol: symbol.trim().toUpperCase(), 
      orderType, 
      side,
      price: orderPrice,
      quantity,
      delay: delayMs / 1000,
    }

    // Simulate timing delay
    if (delayMs > 0) {
      setTimeout(() => {
        setSimulatedOrder(payload)
        setIsSubmitting(false)
      }, delayMs)
    } else {
      setSimulatedOrder(payload)
      setIsSubmitting(false)
    }
  }

  const handleClearSimulation = () => {
    setSimulatedOrder(null)
  }

  const simulatedOrder = useOrderBookStore(s => s.simulatedOrder)

  return (
    <div className="order-form-container">
      <form className="order-form" onSubmit={handleSubmit}>
        <h4>🎯 Simulate Order</h4>

        <label>Venue</label>
        <select value={venue} onChange={e => setVenue(e.target.value)}>
          {venues.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <label>Symbol</label>
        <input 
          type="text" 
          value={symbol} 
          onChange={e => setSymbol(e.target.value)} 
          placeholder="e.g. BTC-USDT"
          required 
        />

        <label>Order Type</label>
        <select value={orderType} onChange={e => setOrderType(e.target.value as 'Market' | 'Limit')}>
          {orderTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label>Side</label>
        <select value={side} onChange={e => setSide(e.target.value as 'Buy' | 'Sell')}>
          {sides.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {orderType === 'Limit' && (
          <>
            <label>Price</label>
            <input 
              type="number" 
              step="0.01" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              placeholder="Enter limit price"
              required 
            />
          </>
        )}

        {orderType === 'Market' && (
          <div className="market-price-info">
            <label>Market Price</label>
            <div className="price-display">
              ${getCurrentMarketPrice().toFixed(2)}
              <span className="price-note">Current best {side.toLowerCase()} price</span>
            </div>
          </div>
        )}

        <label>Quantity</label>
        <input 
          type="number" 
          step="0.0001" 
          value={quantity} 
          onChange={e => setQuantity(e.target.value)} 
          placeholder="Enter quantity"
          required 
        />

        <label>Timing Simulation</label>
        <select value={timing} onChange={e => setTiming(e.target.value)}>
          {delays.map(t => (
            <option key={t} value={t}>
              {t} {t !== 'Immediate' ? 'delay' : ''}
            </option>
          ))}
        </select>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={isSubmitting ? 'submitting' : ''}
          >
            {isSubmitting ? '⏳ Simulating...' : '🚀 Simulate Order'}
          </button>
          
          {simulatedOrder && (
            <button 
              type="button" 
              onClick={handleClearSimulation}
              className="clear-btn"
            >
              🗑️ Clear
            </button>
          )}
        </div>

        {timing !== 'Immediate' && (
          <div className="timing-note">
            💡 Order will be simulated with {timing} delay to show market movement impact
          </div>
        )}
      </form>
    </div>
  )
}
