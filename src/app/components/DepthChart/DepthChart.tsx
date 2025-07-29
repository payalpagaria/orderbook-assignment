import React from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import './DepthChart.css'

type OrderLevel = {
  price: number
  amount: number
}

type OrderBook = {
  bids: OrderLevel[]
  asks: OrderLevel[]
}

interface DepthChartProps {
  orderBook: OrderBook
  venue: string
}

interface DepthData {
  price: number
  bidDepth: number
  askDepth: number
  side: 'bid' | 'ask'
}

const DepthChart: React.FC<DepthChartProps> = ({ orderBook, venue }) => {
  const { bids, asks } = orderBook

  const calculateDepthData = (): DepthData[] => {
    if (!bids.length || !asks.length) return []

    const bidData: DepthData[] = []
    let bidCumulative = 0
    
    const sortedBids = [...bids].sort((a, b) => b.price - a.price)
    sortedBids.forEach((bid) => {
      bidCumulative += bid.amount
      bidData.push({
        price: bid.price,
        bidDepth: bidCumulative,
        askDepth: 0,
        side: 'bid'
      })
    })
    const askData: DepthData[] = []
    let askCumulative = 0
    
    const sortedAsks = [...asks].sort((a, b) => a.price - b.price)
    sortedAsks.forEach((ask) => {
      askCumulative += ask.amount
      askData.push({
        price: ask.price,
        bidDepth: 0,
        askDepth: askCumulative,
        side: 'ask'
      })
    })

    return [...bidData, ...askData].sort((a, b) => a.price - b.price)
  }

  const depthData = calculateDepthData()
  
  
  const maxDepth = Math.max(
    ...depthData.map(d => Math.max(d.bidDepth, d.askDepth))
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="depth-tooltip">
          <p className="tooltip-label">Price: ${Number(label).toFixed(2)}</p>
          {data.bidDepth > 0 && (
            <p className="tooltip-bid">
              Bid Depth: {data.bidDepth.toFixed(4)}
            </p>
          )}
          {data.askDepth > 0 && (
            <p className="tooltip-ask">
              Ask Depth: {data.askDepth.toFixed(4)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const midPrice = bids.length && asks.length 
    ? (bids[0].price + asks[0].price) / 2 
    : 0

  if (!depthData.length) {
    return (
      <div className="depth-chart">
        <h4> Market Depth - {venue}</h4>
        <div className="no-data">
          <p> Waiting for orderbook data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="depth-chart">
      <div className="depth-header">
        <h4>📊 Market Depth - {venue}</h4>
        <div className="depth-info">
          <span className="mid-price">Mid: ${midPrice.toFixed(2)}</span>
          <span className="max-depth">Max Depth: {maxDepth.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={depthData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00c076" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00c076" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="askGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4b4b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ff4b4b" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="price" 
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 10, fill: '#aaa' }}
              tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
            />
            <YAxis 
              domain={[0, maxDepth * 1.1]}
              tick={{ fontSize: 10, fill: '#aaa' }}
              tickFormatter={(value) => Number(value).toFixed(1)}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="stepAfter"
              dataKey="bidDepth"
              stroke="#00c076"
              strokeWidth={2}
              fill="url(#bidGradient)"
              connectNulls={false}
            />
            <Area
              type="stepBefore"
              dataKey="askDepth"
              stroke="#ff4b4b"
              strokeWidth={2}
              fill="url(#askGradient)"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="depth-legend">
        <div className="legend-item">
          <div className="legend-color bid"></div>
          <span>Bid Depth</span>
        </div>
        <div className="legend-item">
          <div className="legend-color ask"></div>
          <span>Ask Depth</span>
        </div>
      </div>
    </div>
  )
}

export default DepthChart 