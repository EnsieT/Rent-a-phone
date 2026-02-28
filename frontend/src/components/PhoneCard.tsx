import { Link } from 'react-router-dom'
import type { CatalogPhone } from '../data/catalog'
import { TIER_LABELS } from '../data/catalog'

interface Props {
  phone: CatalogPhone
}

export default function PhoneCard({ phone }: Props) {
  const tierClass = `tier-badge tier-${phone.tier}`

  return (
    <div className="phone-card">
      <div className="phone-card-image-wrapper">
        <img
          className="phone-card-image"
          src={phone.imagePath}
          alt={`${phone.brand} ${phone.model}`}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = '/assets/images/fallback.svg'
          }}
        />
        <span className={tierClass}>{TIER_LABELS[phone.tier]}</span>
      </div>
      <div className="phone-card-body">
        <div className="phone-card-brand">{phone.brand}</div>
        <div className="phone-card-model">{phone.model}</div>
        <div className="phone-card-specs">
          <span>{phone.ram}</span>
          <span className="spec-sep">·</span>
          <span>{phone.storage}</span>
          <span className="spec-sep">·</span>
          <span>{phone.condition}</span>
        </div>
        <div className="phone-card-prices">
          <div className="phone-card-price">
            ${phone.perDayPrice.toFixed(2)} <span>/ day</span>
          </div>
          <div className="phone-card-buy-price">
            Buy: ${phone.buyPrice.toFixed(0)}
          </div>
        </div>
      </div>
      <div className="phone-card-footer">
        <span className={`badge ${phone.available ? 'badge-available' : 'badge-unavailable'}`}>
          {phone.available ? 'Available' : 'Unavailable'}
        </span>
        <Link to={`/phones/${phone.id}`} className="btn btn-primary btn-sm">
          View Details
        </Link>
      </div>
    </div>
  )
}
