const venues = ['OKX', 'Bybit', 'Deribit'] as const

type Venue = typeof venues[number]

interface VenueTabsProps {
  active: Venue
  onChange: (venue: Venue) => void
}

export default function VenueTabs({ active, onChange }: VenueTabsProps) {
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
