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
  const [symbol, setSymbol] = useState('BTC-USDT')
  const [orderType, setOrderType] = useState('Market')
  const [side, setSide] = useState('Buy')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [timing, setTiming] = useState('Immediate')
const setSimulatedOrder = useOrderBookStore((s) => s.setSimulatedOrder)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!symbol || !quantity || (orderType === 'Limit' && !price)) {
      alert('Please fill all required fields')
      return
    }

    const delay = timing === 'Immediate' ? 0 : parseInt(timing)
    const payload = {
      venue, symbol, orderType, side,
price: orderType === 'Limit' ? Number(price) : 0,
      quantity,
      delay,
    }
setSimulatedOrder(payload)
useOrderBookStore.getState().setVenue(venue)
    
  }

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <h4>Simulate Order</h4>

      <label>Venue</label>
      <select value={venue} onChange={e => setVenue(e.target.value)}>
        {venues.map(v => <option key={v}>{v}</option>)}
      </select>

      <label>Symbol</label>
      <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} required />

      <label>Order Type</label>
      <select value={orderType} onChange={e => setOrderType(e.target.value)}>
        {orderTypes.map(t => <option key={t}>{t}</option>)}
      </select>

      <label>Side</label>
      <select value={side} onChange={e => setSide(e.target.value)}>
        {sides.map(s => <option key={s}>{s}</option>)}
      </select>

      {orderType === 'Limit' && (
        <>
          <label>Price</label>
          <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
        </>
      )}

      <label>Quantity</label>
      <input type="number" step="0.0001" value={quantity} onChange={e => setQuantity(e.target.value)} required />

      <label>Timing</label>
      <select value={timing} onChange={e => setTiming(e.target.value)}>
        {delays.map(t => <option key={t} value={t === 'Immediate' ? '0' : t.replace('s', '')}>{t}</option>)}
      </select>

      <button type="submit">Simulate Order</button>
    </form>
  )
}
