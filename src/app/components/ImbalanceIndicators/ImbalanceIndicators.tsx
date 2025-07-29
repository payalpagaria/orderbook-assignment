import React from 'react'
import './ImbalanceIndicators.css'

type OrderLevel = {
  price: number
  amount: number
}

type OrderBook = {
  bids: OrderLevel[]
  asks: OrderLevel[]
}

interface ImbalanceIndicatorsProps {
  orderBook: OrderBook
  venue: string
}

interface ImbalanceData {
  bidVolume: number
  askVolume: number
  totalVolume: number
  bidRatio: number
  askRatio: number
  imbalanceRatio: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  spreadPercentage: number
  midPrice: number
}

const ImbalanceIndicators: React.FC<ImbalanceIndicatorsProps> = ({ orderBook, venue }) => {
  const { bids, asks } = orderBook

  const calculateImbalance = (): ImbalanceData => {
    if (!bids.length || !asks.length) {
      return {
        bidVolume: 0,
        askVolume: 0,
        totalVolume: 0,
        bidRatio: 50,
        askRatio: 50,
        imbalanceRatio: 0,
        sentiment: 'neutral',
        spreadPercentage: 0,
        midPrice: 0
      }
    }

    // Calculate total volumes (top 10 levels for more accurate representation)
    const topBids = bids.slice(0, 10)
    const topAsks = asks.slice(0, 10)
    
    const bidVolume = topBids.reduce((sum, bid) => sum + bid.amount, 0)
    const askVolume = topAsks.reduce((sum, ask) => sum + ask.amount, 0)
    const totalVolume = bidVolume + askVolume

    // Calculate ratios
    const bidRatio = totalVolume > 0 ? (bidVolume / totalVolume) * 100 : 50
    const askRatio = totalVolume > 0 ? (askVolume / totalVolume) * 100 : 50

    // Calculate imbalance ratio (-100 to +100, negative = bearish, positive = bullish)
    const imbalanceRatio = bidRatio - askRatio

    // Determine sentiment
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (imbalanceRatio > 10) sentiment = 'bullish'
    else if (imbalanceRatio < -10) sentiment = 'bearish'

    // Calculate spread
    const bestBid = bids[0]?.price || 0
    const bestAsk = asks[0]?.price || 0
    const midPrice = (bestBid + bestAsk) / 2
    const spreadPercentage = midPrice > 0 ? ((bestAsk - bestBid) / midPrice) * 100 : 0

    return {
      bidVolume,
      askVolume,
      totalVolume,
      bidRatio,
      askRatio,
      imbalanceRatio,
      sentiment,
      spreadPercentage,
      midPrice
    }
  }

  const imbalanceData = calculateImbalance()

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return '🐂'
      case 'bearish': return '🐻'
      default: return '⚖️'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return '#00c076'
      case 'bearish': return '#ff4b4b'
      default: return '#ffc107'
    }
  }

  if (!bids.length || !asks.length) {
    return (
      <div className="imbalance-indicators">
        <h4>📊 Market Imbalance - {venue}</h4>
        <div className="no-data">
          <p>📡 Waiting for orderbook data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="imbalance-indicators">
      <div className="imbalance-header">
        <h4>📊 Market Imbalance - {venue}</h4>
        <div className="sentiment-indicator" style={{ color: getSentimentColor(imbalanceData.sentiment) }}>
          {getSentimentIcon(imbalanceData.sentiment)} {imbalanceData.sentiment.toUpperCase()}
        </div>
      </div>

      <div className="imbalance-metrics">
        <div className="metric-row">
          <div className="metric">
            <span className="metric-label">Bid Volume</span>
            <span className="metric-value bid">{imbalanceData.bidVolume.toFixed(4)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Ask Volume</span>
            <span className="metric-value ask">{imbalanceData.askVolume.toFixed(4)}</span>
          </div>
        </div>

        <div className="volume-bar">
          <div className="volume-bar-container">
            <div 
              className="volume-bar-bid" 
              style={{ width: `${imbalanceData.bidRatio}%` }}
            >
              <span className="volume-percentage">{imbalanceData.bidRatio.toFixed(1)}%</span>
            </div>
            <div 
              className="volume-bar-ask" 
              style={{ width: `${imbalanceData.askRatio}%` }}
            >
              <span className="volume-percentage">{imbalanceData.askRatio.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric">
            <span className="metric-label">Imbalance Ratio</span>
            <span 
              className={`metric-value ${imbalanceData.imbalanceRatio > 0 ? 'positive' : imbalanceData.imbalanceRatio < 0 ? 'negative' : 'neutral'}`}
            >
              {imbalanceData.imbalanceRatio > 0 ? '+' : ''}{imbalanceData.imbalanceRatio.toFixed(1)}%
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Spread</span>
            <span className="metric-value neutral">{imbalanceData.spreadPercentage.toFixed(3)}%</span>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric full-width">
            <span className="metric-label">Mid Price</span>
            <span className="metric-value price">${imbalanceData.midPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="imbalance-interpretation">
        <div className="interpretation-item">
          <div className="interpretation-icon">💡</div>
          <div className="interpretation-text">
            {imbalanceData.sentiment === 'bullish' && (
              <span>Strong buying pressure detected. Bid volume dominates the orderbook.</span>
            )}
            {imbalanceData.sentiment === 'bearish' && (
              <span>Strong selling pressure detected. Ask volume dominates the orderbook.</span>
            )}
            {imbalanceData.sentiment === 'neutral' && (
              <span>Balanced orderbook. No significant buying or selling pressure.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImbalanceIndicators 