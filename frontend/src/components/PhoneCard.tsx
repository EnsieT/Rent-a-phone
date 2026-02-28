import { Link } from 'react-router-dom'
import type { CatalogPhone } from '../data/catalog'
import { TIER_LABELS } from '../data/catalog'
import { useCart } from '../context/CartContext'

interface Props {
  phone: CatalogPhone
}

export default function PhoneCard({ phone }: Props) {
  const tierClass = `tier-badge tier-${phone.tier}`
  const { addItem, items } = useCart()
  const inCart = items.some((i) => i.phone.id === phone.id)

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
        {phone.premiumOnly && <span className="premium-only-badge">★ Members Only</span>}
      </div>
      <div className="phone-card-body">
        <div className="phone-card-brand">{phone.brand}</div>
        <div className="phone-card-model">{phone.model}</div>
        <div className="phone-card-specs">
          <span>{phone.ram}</span>
          <span className="spec-sep">·</span>
          <span>{phone.storage}</span>
          <span className="spec-sep">·</span>
          <span>{phone.os}</span>
          <span className="spec-sep">·</span>
          <span>{phone.condition}</span>
        </div>
        <div className="phone-card-prices">
          <div className="phone-card-price">
            ₹{phone.perDayPrice} <span>/ day</span>
          </div>
          <div className="phone-card-buy-price">
            MRP: ₹{phone.mrp.toLocaleString('en-IN')}
          </div>
          <div className="phone-card-buy-price" style={{ color: 'var(--green-700)' }}>
            Buy: ₹{phone.buyPrice.toLocaleString('en-IN')}
          </div>
          <div className="phone-card-deposit">
            Deposit: ₹{phone.buyPrice.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
      <div className="phone-card-footer">
        <span className={`badge ${phone.available ? 'badge-available' : 'badge-unavailable'}`}>
          {phone.available ? 'Available' : 'Unavailable'}
        </span>
        <div className="phone-card-actions">
          {phone.available && (
            <button
              className={`btn btn-sm ${inCart ? 'btn-secondary' : 'btn-cart'}`}
              onClick={() => !inCart && addItem(phone)}
              disabled={inCart}
            >
              {inCart ? '✓ In Cart' : '+ Cart'}
            </button>
          )}
          <Link to={`/phones/${phone.id}`} className="btn btn-primary btn-sm">
            Details
          </Link>
        </div>
      </div>
    </div>
  )
}
