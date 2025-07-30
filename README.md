# Real-Time Orderbook Viewer with Order Simulation

A Next.js application that connects to real-time orderbook data from OKX, Bybit, and Deribit using WebSockets. Users can simulate order placements and see where their order would sit in the book, helping them understand market impact and timing.

---

## Features

* Real-time orderbooks from OKX, Bybit, and Deribit
* 15 levels of bids and asks
* WebSocket-based live updates
* Zustand for global state management
* Venue switcher with smooth UI
* Order simulation form with support for market and limit orders
* Visual indicator for simulated order position
* Market impact metrics: fill %, slippage, time to fill
* Responsive design for desktop and mobile

---

## Tech Stack

* Next.js 14 (App Router)
* TypeScript
* Zustand (global state)
* WebSockets (real-time data)
* CSS Modules (scoped styling)

---

## How to Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/payalpagaria/orderbook-assignment.git
cd orderbook-assignment

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Functional Overview

### 1. Multi-Venue Real-Time Orderbook

* Connects to OKX, Bybit, and Deribit APIs
* Shows 15 levels of orderbook depth (bids and asks)
* WebSocket connections used where available
* Switch between venues instantly

### 2. Order Simulation Form

* Venue: OKX / Bybit / Deribit
* Symbol (e.g., BTC-USDT)
* Order Type: Market / Limit
* Side: Buy / Sell
* Price (for Limit)
* Quantity
* Timing: Immediate / 5s / 10s / 30s delay
* Form validation included

### 3. Orderbook Visualization

* Highlights simulated order in the book
* Metrics shown:

  * Fill %
  * Slippage
  * Time to Fill
  * Market Impact

### 4. Responsive UI

* Mobile-friendly layout
* Works across screen sizes

---

## API References

* [OKX API Docs](https://www.okx.com/docs-v5/)
* [Bybit API Docs](https://bybit-exchange.github.io/docs/v5/intro)
* [Deribit API Docs](https://docs.deribit.com/)

---

