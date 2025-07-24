import VenueTabs from '../components/VenuTabs/VenueTabs'
import OrderBook from '../components/OrderBook/OrderBook'
import { useOKXWebSocket } from '../hooks/useOKXWebSocket'
import { useOrderBookStore } from '../store/orderBookStore'

export default function Home() {
  useOKXWebSocket() 

  const venue = useOrderBookStore((s) => s.venue)
  const setVenue = useOrderBookStore((s) => s.setVenue)

  return (
    <main className="container">
      <h1>📈 Orderbook Simulator</h1>
      <VenueTabs active={venue} onChange={setVenue} />
      <OrderBook />
      {/* OrderForm + Metrics will come next */}
    </main>
  )
}
