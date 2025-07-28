import { useOrderBookStore } from '@/app/store/orderBookStore'
import './OrderBook.css'
import { estimateFillPercentage, estimateImpact, estimateSlippage } from '../../lib/utils/normalize'
import { useEffect } from 'react'

export default function OrderBook() {

  const { venue, orderBooks,simulatedOrder } = useOrderBookStore()
  const { bids, asks } = orderBooks[venue]



  return (
    <div className="orderbook">
      <h3 className="orderbook-title">{venue} Order Book</h3>
      <div className="book">
        <table className="table">
          <thead>
            <tr className="header">
              <th className="column price">Price</th>
              <th className="column amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            {asks.map((o, i) => (
  <tr
    key={`ask-${i}`}
    className={`row ask ${simulatedOrder && simulatedOrder.side === 'Buy' && o.price === simulatedOrder.price ? 'simulated' : ''}`}
  >
    <td className="cell price">{o.price.toFixed(2)}</td>
    <td className="cell amount">{o.amount.toFixed(4)}</td>
  </tr>
))}

            <tr><td colSpan={2} className="mid">──</td></tr>
           {bids.map((o, i) => (
  <tr
    key={`bid-${i}`}
    className={`row bid ${simulatedOrder && simulatedOrder.side === 'Sell' && o.price === simulatedOrder.price ? 'simulated' : ''}`}
  >
    <td className="cell price">{o.price.toFixed(2)}</td>
    <td className="cell amount">{o.amount.toFixed(4)}</td>
  </tr>
))}

          </tbody>
        </table>

  {simulatedOrder && simulatedOrder.venue === venue && (
  <div className="metrics">
    <h4>📊 Simulated Order Impact</h4>
    <p>🧪 Fill %: {estimateFillPercentage({ bids, asks }, simulatedOrder)}%</p>
    <p>📉 Slippage: {
      (() => {
        const levels = simulatedOrder.side === 'Buy' ? asks : bids;
        const marketPrice = levels[0]?.price || simulatedOrder.price;
        if (!simulatedOrder.price || !marketPrice || isNaN(simulatedOrder.price) || isNaN(marketPrice)) {
          return '0.00';
        }
        const diff = Math.abs(Number(simulatedOrder.price) - marketPrice);
        return ((diff / marketPrice) * 100).toFixed(2);
      })()
    }%</p>
    <p>📊 Market Impact: {estimateImpact({ bids, asks }, simulatedOrder)}</p>
  </div>
)}

    

      </div>
      
    </div>
  )
}
