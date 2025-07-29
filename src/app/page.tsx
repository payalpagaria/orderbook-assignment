"use client";

import VenueTabs from './components/VenuTabs/VenueTabs'
import OrderBook from './components/OrderBook/OrderBook'
import OrderSimulationForm from './components/OrderSimulationForm/OrderSimulationForm';
import { useOKXWebSocket } from './hooks/useOKXWebSocket'
import { useOrderBookStore } from './store/orderBookStore'
import { useDeribitWebSocket } from './hooks/useDeribitWebSocket';
import { useBybitWebSocket } from './hooks/ useBybitWebSocket';

export default function Home() {
  const okxStatus = useOKXWebSocket() 
  useDeribitWebSocket()
  useBybitWebSocket()
  const venue = useOrderBookStore((s) => s.venue)
  const setVenue = useOrderBookStore((s) => s.setVenue)

  return (
    <main className="main-container">
      <header className="app-header">
        <h1 className="app-title">📈 Orderbook Simulator</h1>
        <p className="app-subtitle">Real-time multi-venue orderbook with order simulation</p>
        
        {venue === 'OKX' && (
          <div className="connection-info">
            {okxStatus.isConnected ? (
              <span className="status-badge websocket">🟢 WebSocket Connected</span>
            ) : okxStatus.isPolling ? (
              <span className="status-badge polling">🟡 REST API Polling</span>
            ) : (
              <span className="status-badge disconnected">🔴 Connecting...</span>
            )}
          </div>
        )}
      </header>
      
      <div className="content-wrapper">
        <div className="controls-section">
          <VenueTabs active={venue} onChange={setVenue} />
        </div>
        
        <div className="main-content">
          <div className="content-sections">
            <div className="orderbook-section">
              <OrderBook />
            </div>
            
            <div className="simulation-section">
              <OrderSimulationForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

