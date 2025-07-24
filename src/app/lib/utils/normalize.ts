export function normalizeOKX(data: any) {
  return {
    bids: [...Array(15)].map((_, i) => {
      const [price, size] = data.bids?.[i] || ['0', '0']
      return { price: parseFloat(price), amount: parseFloat(size) }
    }),
    asks: [...Array(15)].map((_, i) => {
      const [price, size] = data.asks?.[i] || ['0', '0']
      return { price: parseFloat(price), amount: parseFloat(size) }
    }),
  }
}

export function normalizeBybit(data: any) {
  return {
    bids: [...Array(15)].map((_, i) => {
      const [price, amount] = data.b?.[i] || ['0', '0']
      return { price: parseFloat(price), amount: parseFloat(amount) }
    }),
    asks: [...Array(15)].map((_, i) => {
      const [price, amount] = data.a?.[i] || ['0', '0']
      return { price: parseFloat(price), amount: parseFloat(amount) }
    }),
  }
}

export function normalizeDeribit(data: any) {
  return {
    bids: [...Array(15)].map((_, i) => {
      const [price, amount] = data.bids?.[i] || [0, 0]
      return { price, amount }
    }),
    asks: [...Array(15)].map((_, i) => {
      const [price, amount] = data.asks?.[i] || [0, 0]
      return { price, amount }
    }),
  }
}


