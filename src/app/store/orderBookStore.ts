import { create } from 'zustand'

export const venues = ['OKX', 'Bybit', 'Deribit'] as const
export type Venue = typeof venues[number]

type Order = { price: number; amount: number }
type OrderBook = { bids: Order[]; asks: Order[] }

type SimulatedOrder = {
  venue: Venue            // <-- was string
  symbol: string
  orderType: 'Market' | 'Limit'
  side: 'Buy' | 'Sell'
  price: number
  quantity: string
  delay: number
}

type Store = {
  venue: Venue                                // <-- was string
  orderBooks: Record<Venue, OrderBook>        // <-- keyed by Venue union
  simulatedOrder: SimulatedOrder | null
  setVenue: (venue: Venue) => void            // <-- was (string) => void
  updateOrderBook: (venue: Venue, data: OrderBook) => void // <-- was string
  setSimulatedOrder: (order: SimulatedOrder | null) => void
}

export const useOrderBookStore = create<Store>((set) => ({
  venue: 'OKX', // ✅ matches Venue
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
