import { Link } from 'react-router-dom'
import type { Phone } from '../api'

interface Props {
  phone: Phone
}

export default function PhoneCard({ phone }: Props) {
  const isAvailable = phone.available === 1

  return (
    <div className="phone-card">
      <img
        className="phone-card-image"
        src={phone.image_url || 'https://placehold.co/300x300?text=Phone'}
        alt={`${phone.brand} ${phone.model}`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            'https://placehold.co/300x300?text=Phone'
        }}
      />
      <div className="phone-card-body">
        <div className="phone-card-brand">{phone.brand}</div>
        <div className="phone-card-model">{phone.model}</div>
        <div className="phone-card-price">
          ${phone.price_per_day.toFixed(2)} <span>/ day</span>
        </div>
      </div>
      <div className="phone-card-footer">
        <span className={`badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>
        <Link to={`/phones/${phone.id}`} className="btn btn-primary btn-sm">
          View Details
        </Link>
      </div>
    </div>
  )
}
