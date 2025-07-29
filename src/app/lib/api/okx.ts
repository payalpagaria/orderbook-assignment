const OKX_REST_BASE = 'https://www.okx.com/api/v5/market'

export interface OKXOrderBookResponse {
  code: string
  msg: string
  data: Array<{
    asks: string[][]
    bids: string[][]
    ts: string
  }>
}

export async function fetchOKXOrderBook(symbol: string = 'BTC-USDT'): Promise<OKXOrderBookResponse['data'][0] | null> {
  try {
    const response = await fetch(`${OKX_REST_BASE}/books?instId=${symbol}&sz=15`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: OKXOrderBookResponse = await response.json()
    
    if (data.code !== '0') {
      throw new Error(`OKX API error: ${data.msg}`)
    }

    if (!data.data || data.data.length === 0) {
      throw new Error('No orderbook data received')
    }

    return data.data[0]
  } catch (error) {
    console.error('[OKX REST API] Error fetching orderbook:', error)
    return null
  }
}
