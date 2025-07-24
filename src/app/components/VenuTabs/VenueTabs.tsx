const venues = ['OKX', 'Bybit', 'Deribit']
import './VenueTabs.css'

export default function VenueTabs({ active, onChange }) {
  return (
    <div className="venueSelector" data-active={active}>
      {venues.map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={v === active ? 'active' : ''}
        >
          {v}
        </button>
      ))}
    </div>
  )
}
