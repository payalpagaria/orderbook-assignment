import { create } from 'zustand'

export const useOrderBookStore = create((set) => ({
  venue: 'OKX',
  orderBooks: {
    OKX: { bids: [], asks: [] },
    Bybit: { bids: [], asks: [] },
    Deribit: { bids: [], asks: [] },
  },
  setVenue: (venue: string) => set({ venue }),
  updateOrderBook: (venue: string, data) =>
    set((state) => ({
      orderBooks: {
        ...state.orderBooks,
        [venue]: data,
      },
    })),
}))
