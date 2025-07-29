import { create } from 'zustand'

type Order = { price: number; amount: number }
type OrderBook = { bids: Order[]; asks: Order[] }
type SimulatedOrder = {
  venue: string
  symbol: string
  orderType: 'Market' | 'Limit'
  side: 'Buy' | 'Sell'
  price: number
  quantity: string
  delay: number
}
type Store = {
  venue: string
  orderBooks: Record<string, OrderBook>
  simulatedOrder: SimulatedOrder | null
  setVenue: (venue: string) => void
  updateOrderBook: (venue: string, data: OrderBook) => void
  setSimulatedOrder: (order: SimulatedOrder | null) => void
}

export const useOrderBookStore = create<Store>((set) => ({
  venue: 'OKX',
  orderBooks: {
    OKX: { bids: [], asks: [] },
    Bybit: { bids: [], asks: [] },
    Deribit: { bids: [], asks: [] },
  },
  simulatedOrder: null,
  setVenue: (venue) => set({ venue }),
  updateOrderBook: (venue, data) =>
    set((state) => ({
      orderBooks: { ...state.orderBooks, [venue]: data },
    })),
  setSimulatedOrder: (order) => set({ simulatedOrder: order }),
}))
