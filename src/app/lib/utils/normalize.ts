type OrderLevel = {
  price: number
  amount: number
}

type OrderBook = {
  bids: OrderLevel[]
  asks: OrderLevel[]
}

type SimulatedOrder = {
  price: number
  quantity: string
  side: 'Buy' | 'Sell'
  orderType?: 'Market' | 'Limit'
}

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



export function estimateFillPercentage(book: OrderBook, order: SimulatedOrder): string {
  const side = order.side === 'Buy' ? book.asks : book.bids
  let filled = 0, needed = Number(order.quantity)

  for (const level of side) {
    const fill = Math.min(level.amount, needed)
    filled += fill
    needed -= fill
    if (needed <= 0) break
  }

  return ((filled / Number(order.quantity)) * 100).toFixed(2)
}

export function estimateSlippage(book: OrderBook, order: SimulatedOrder): string {
  const levels = order.side === 'Buy' ? book.asks : book.bids;
  const marketPrice = levels[0]?.price;

  if (!marketPrice || isNaN(marketPrice)) return '0.00';

  const orderPrice = order.orderType === 'Market'
    ? marketPrice
    : Number(order.price);

  const diff = Math.abs(orderPrice - marketPrice);
  return ((diff / marketPrice) * 100).toFixed(2);
}



export function estimateImpact(book: OrderBook, order: SimulatedOrder): string {
  const levels = order.side === 'Buy' ? book.asks : book.bids
  let totalQty = 0, impactedLevels = 0

  for (const level of levels) {
    totalQty += level.amount
    impactedLevels++
    if (totalQty >= Number(order.quantity)) break
  }

  return `${impactedLevels} levels`
}