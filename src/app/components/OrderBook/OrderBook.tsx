import { useOrderBookStore } from '@/app/store/orderBookStore'
import './OrderBook.css'

export default function OrderBook() {
  const { venue, orderBooks } = useOrderBookStore()
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
              <tr key={`ask-${i}`} className="row ask">
                <td className="cell price">{o.price.toFixed(2)}</td>
                <td className="cell amount">{o.amount.toFixed(4)}</td>
              </tr>
            ))}
            <tr><td colSpan={2} className="mid">──</td></tr>
            {bids.map((o, i) => (
              <tr key={`bid-${i}`} className="row bid">
                <td className="cell price">{o.price.toFixed(2)}</td>
                <td className="cell amount">{o.amount.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
