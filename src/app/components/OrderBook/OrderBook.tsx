import { useOrderBookStore } from '@/app/store/orderBookStore'
import './OrderBook.css'
import { estimateFillPercentage, estimateImpact, estimateSlippage } from '../../lib/utils/normalize'
import { useEffect, useState } from 'react'
import DepthChart from '../DepthChart/DepthChart'
import ImbalanceIndicators from '../ImbalanceIndicators/ImbalanceIndicators'

export default function OrderBook() {
  const { venue, orderBooks, simulatedOrder } = useOrderBookStore()
  const { bids, asks } = orderBooks[venue]
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [showDepthChart, setShowDepthChart] = useState(true)
  const [maxVolume, setMaxVolume] = useState(0)

  useEffect(() => {
    if (bids.length > 0 || asks.length > 0) {
      setLastUpdate(new Date())
      
      // Calculate max volume for depth bars
      const allLevels = [...bids, ...asks]
      const max = Math.max(...allLevels.map(level => level.amount))
      setMaxVolume(max)
    }
  }, [bids, asks])

  const getMarketPrice = (side: 'Buy' | 'Sell') => {
    if (side === 'Buy') {
      return asks[0]?.price || 0
    } else {
      return bids[0]?.price || 0
    }
  }

  const getSimulatedOrderPrice = (order: any) => {
    if (order.orderType === 'Market') {
      return getMarketPrice(order.side)
    }
    return order.price
  }

  const getDepthBarWidth = (amount: number) => {
    return maxVolume > 0 ? (amount / maxVolume) * 100 : 0
  }

  const isConnectionActive = bids.length > 0 && asks.length > 0

  return (
    <div className="orderbook-container">
      <div className="orderbook">
        <div className="orderbook-header">
          <h3 className="orderbook-title">{venue} Order Book</h3>
          <div className="orderbook-controls">
            <button 
              className={`toggle-btn ${showDepthChart ? 'active' : ''}`}
              onClick={() => setShowDepthChart(!showDepthChart)}
            >
              📊 {showDepthChart ? 'Hide' : 'Show'} Depth
            </button>
            <div className="connection-status">
              <span className={`status-indicator ${isConnectionActive ? 'connected' : 'disconnected'}`}>
                {isConnectionActive ? '🟢' : '🔴'}
              </span>
              <span className="status-text">
                {isConnectionActive ? 'Live' : 'Disconnected'}
              </span>
              {lastUpdate && (
                <span className="last-update">
                  {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="book">
          <table className="table">
            <thead>
              <tr className="header">
                <th className="column price">Price</th>
                <th className="column amount">Amount</th>
                <th className="column depth">Depth</th>
              </tr>
            </thead>
            <tbody>
              {asks.slice().reverse().map((o, i) => {
                const isSimulated = simulatedOrder && 
                  simulatedOrder.side === 'Buy' && 
                  (simulatedOrder.orderType === 'Market' ? i === 0 : o.price === getSimulatedOrderPrice(simulatedOrder))
                
                return (
                  <tr
                    key={`ask-${i}`}
                    className={`row ask ${isSimulated ? 'simulated' : ''}`}
                  >
                    <td className="cell price">{o.price.toFixed(2)}</td>
                    <td className="cell amount">{o.amount.toFixed(4)}</td>
                    <td className="cell depth">
                      <div className="depth-bar-cell">
                        <div 
                          className="depth-bar ask-bar"
                          style={{ width: `${getDepthBarWidth(o.amount)}%` }}
                        />
                        <span className="depth-text">{getDepthBarWidth(o.amount).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}

              <tr><td colSpan={3} className="mid">
                {isConnectionActive && bids[0] && asks[0] ? 
                  `Spread: $${(asks[0].price - bids[0].price).toFixed(2)} (${(((asks[0].price - bids[0].price) / asks[0].price) * 100).toFixed(3)}%)` : 
                  '──'
                }
              </td></tr>
              
              {bids.map((o, i) => {
                const isSimulated = simulatedOrder && 
                  simulatedOrder.side === 'Sell' && 
                  (simulatedOrder.orderType === 'Market' ? i === 0 : o.price === getSimulatedOrderPrice(simulatedOrder))
                
                return (
                  <tr
                    key={`bid-${i}`}
                    className={`row bid ${isSimulated ? 'simulated' : ''}`}
                  >
                    <td className="cell price">{o.price.toFixed(2)}</td>
                    <td className="cell amount">{o.amount.toFixed(4)}</td>
                    <td className="cell depth">
                      <div className="depth-bar-cell">
                        <div 
                          className="depth-bar bid-bar"
                          style={{ width: `${getDepthBarWidth(o.amount)}%` }}
                        />
                        <span className="depth-text">{getDepthBarWidth(o.amount).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {simulatedOrder && simulatedOrder.venue === venue && isConnectionActive && (
            <div className="metrics">
              <h4>📊 Simulated Order Impact</h4>
              <div className="metrics-grid">
                <div className="metric">
                  <span className="metric-label">🧪 Fill %:</span>
                  <span className="metric-value">{estimateFillPercentage({ bids, asks }, simulatedOrder)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">📉 Slippage:</span>
                  <span className="metric-value">{estimateSlippage({ bids, asks }, simulatedOrder)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">📊 Market Impact:</span>
                  <span className="metric-value">{estimateImpact({ bids, asks }, simulatedOrder)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">💰 Est. Price:</span>
                  <span className="metric-value">${getSimulatedOrderPrice(simulatedOrder).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {!isConnectionActive && (
            <div className="no-data">
              <p>📡 Connecting to {venue}...</p>
              <p>Waiting for live data...</p>
            </div>
          )}
        </div>
      </div>

      {/* Market Imbalance Indicators */}
      <ImbalanceIndicators orderBook={{ bids, asks }} venue={venue} />

      {/* Depth Chart */}
      {showDepthChart && (
        <DepthChart orderBook={{ bids, asks }} venue={venue} />
      )}
    </div>
  )
}
