import { useParams, Link, useNavigate } from 'react-router-dom'
import RentalModal from '../components/RentalModal'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useState } from 'react'
import { getCatalogPhone } from '../utils/catalogStore'
import { discountPercent, discountedDailyPrice, isRentToOwnEligible, getTotalDaysRented } from '../utils/pricing'
import { TIER_LABELS } from '../data/catalog'

export default function PhoneDetail() {
  const { id } = useParams<{ id: string }>()
  const [showModal, setShowModal] = useState(false)
  const { token } = useAuth()
  const { addItem, items } = useCart()
  const navigate = useNavigate()

  const phone = id ? getCatalogPhone(Number(id)) : undefined

  if (!phone) {
    return (
      <div className="section container">
        <div className="alert alert-error">Phone not found.</div>
        <Link to="/phones" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Phones
        </Link>
      </div>
    )
  }

  const inCart = items.some((i) => i.phone.id === phone.id)
  const totalDaysRented = getTotalDaysRented(phone.id)
  const discount = discountPercent(totalDaysRented)
  const effectivePrice = discountedDailyPrice(phone.perDayPrice, totalDaysRented)
  const eligible = isRentToOwnEligible(totalDaysRented)
  const daysToEligibility = Math.max(0, 365 - totalDaysRented)

  function handleRentClick() {
    if (!token) {
      navigate('/login', { state: { from: { pathname: `/phones/${phone!.id}` } } })
    } else {
      setShowModal(true)
    }
  }

  const tierClass = `tier-badge tier-${phone.tier}`

  return (
    <div className="phone-detail">
      <Link to="/phones" className="back-link">
        ← Back to phones
      </Link>

      <div className="phone-detail-grid">
        <div className="phone-detail-image-wrapper">
          <img
            className="phone-detail-image"
            src={phone.imagePath}
            alt={`${phone.brand} ${phone.model}`}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).src = '/assets/images/fallback.svg'
            }}
          />
        </div>

        <div className="phone-detail-info">
          <div className="phone-detail-top">
            <div className="phone-detail-brand">{phone.brand}</div>
            <span className={tierClass}>{TIER_LABELS[phone.tier]}</span>
          </div>
          <h1 className="phone-detail-model">{phone.model}</h1>

          <span className={`badge ${phone.available ? 'badge-available' : 'badge-unavailable'}`}>
            {phone.available ? 'Available' : 'Unavailable'}
          </span>

          {phone.premiumOnly && (
            <div className="premium-only-banner">
              ★ Premium Members Only — <Link to="/membership">Join Membership</Link>
            </div>
          )}

          <div className="phone-detail-specs-grid">
            <div className="spec-item">
              <span className="spec-label">RAM</span>
              <span className="spec-value">{phone.ram}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Storage</span>
              <span className="spec-value">{phone.storage}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">OS</span>
              <span className="spec-value">{phone.os}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Condition</span>
              <span className="spec-value">{phone.condition}</span>
            </div>
          </div>

          <div className="phone-detail-pricing">
            <div className="phone-detail-mrp">
              MRP: <span className="mrp-strike">₹{phone.mrp.toLocaleString('en-IN')}</span>
            </div>
            <div className="phone-detail-buy-price">
              Buy price: <strong>₹{phone.buyPrice.toLocaleString('en-IN')}</strong>
              <span className="condition-factor"> ({phone.condition} condition)</span>
            </div>
            <div className="phone-detail-deposit">
              Refundable Deposit: <strong>₹{phone.buyPrice.toLocaleString('en-IN')}</strong>
              <span className="deposit-note"> (Rental days deducted from deposit · Members save ₹9,000)</span>
            </div>
            <div className="phone-detail-terms-note">
              <small>🕐 24-hr billing · 🚚 Pickup & Drop ₹150 · ⚠️ Late return: 2× daily rate · Damage costs deducted from deposit</small>
            </div>
            <div className="phone-detail-price">
              {discount > 0 ? (
                <>
                  <span className="price-original">₹{phone.perDayPrice}</span>
                  <span className="price-discounted">₹{Math.round(effectivePrice)}</span>
                  <span className="price-unit">/ day</span>
                  <span className="price-discount-badge">-{discount}%</span>
                </>
              ) : (
                <>
                  <span className="price-main">₹{phone.perDayPrice}</span>
                  <span className="price-unit">/ day</span>
                </>
              )}
            </div>
          </div>

          {phone.description && (
            <p className="phone-detail-description">{phone.description}</p>
          )}

          {eligible ? (
            <div className="rent-to-own-badge eligible">
              🏠 Rent-to-Own Eligible! You can now purchase this phone.
            </div>
          ) : totalDaysRented > 0 ? (
            <div className="rent-to-own-progress">
              <div className="rto-progress-label">
                Rent-to-Own: {totalDaysRented}/365 days ({daysToEligibility} days remaining)
              </div>
              <div className="rto-progress-bar">
                <div
                  className="rto-progress-fill"
                  style={{ width: `${Math.min(100, (totalDaysRented / 365) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="rent-to-own-info">
              🏠 Rent for 365 days to become eligible for rent-to-own
            </div>
          )}

          <div className="phone-detail-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleRentClick}
              disabled={!phone.available}
            >
              {phone.available ? 'Rent Now' : 'Unavailable'}
            </button>
            {phone.available && (
              <button
                className={`btn btn-lg ${inCart ? 'btn-secondary' : 'btn-cart'}`}
                onClick={() => !inCart && addItem(phone)}
                disabled={inCart}
              >
                {inCart ? '✓ In Cart' : '🛒 Add to Cart'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <RentalModal
          phone={{ id: phone.id, brand: phone.brand, model: phone.model, perDayPrice: phone.perDayPrice }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
