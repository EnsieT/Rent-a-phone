import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getPhone } from '../api'
import type { Phone } from '../api'
import RentalModal from '../components/RentalModal'
import { useAuth } from '../context/AuthContext'
import { calcQuote } from '../lib/quote'

export default function PhoneDetail() {
  const { id } = useParams<{ id: string }>()
  const [phone, setPhone] = useState<Phone | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [days, setDays] = useState(1)
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    getPhone(Number(id))
      .then((res) => setPhone(res.data))
      .catch(() => setError('Phone not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">Loading…</div>
  if (error || !phone)
    return (
      <div className="section container">
        <div className="alert alert-error">{error || 'Phone not found.'}</div>
        <Link to="/phones" className="btn btn-secondary">
          Back to Phones
        </Link>
      </div>
    )

  const isAvailable = phone.available === 1
  const quote = calcQuote(phone.current_price_inr, days)

  function handleRentClick() {
    if (!token) {
      navigate('/login', { state: { from: { pathname: `/phones/${phone!.id}` } } })
    } else {
      setShowModal(true)
    }
  }

  function handleDaysChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(100, Math.max(1, Math.round(Number(e.target.value))))
    setDays(v)
  }

  return (
    <div className="phone-detail">
      <Link to="/phones" className="back-link">
        ← Back to phones
      </Link>

      <div className="phone-detail-grid">
        <img
          className="phone-detail-image"
          src={phone.image_url || 'https://placehold.co/400x400?text=Phone'}
          alt={`${phone.brand} ${phone.model}`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://placehold.co/400x400?text=Phone'
          }}
        />

        <div className="phone-detail-info">
          <div className="phone-detail-brand">{phone.brand}</div>
          <h1 className="phone-detail-model">{phone.model}</h1>

          <span className={`badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>

          <div className="phone-detail-price">
            ₹{phone.current_price_inr.toLocaleString('en-IN')}
            <span> (current value)</span>
          </div>
          <div className="phone-detail-daily">
            Base daily rate: <strong>₹{quote.baseDailyInr.toFixed(2)}/day</strong>
          </div>

          {phone.description && (
            <p className="phone-detail-description">{phone.description}</p>
          )}

          {/* Live quote calculator */}
          <div className="quote-calculator">
            <div className="quote-days-row">
              <label htmlFor="quote-days">Rental days (1–100)</label>
              <input
                id="quote-days"
                type="number"
                min={1}
                max={100}
                value={days}
                onChange={handleDaysChange}
              />
            </div>
            <div className="price-summary">
              <div className="price-summary-row">
                <span>Base daily rate</span>
                <span>₹{quote.baseDailyInr.toFixed(2)}</span>
              </div>
              <div className="price-summary-row">
                <span>Discount ({(quote.discountPct * 100).toFixed(0)}%)</span>
                <span>−₹{(quote.baseDailyInr * quote.discountPct).toFixed(2)}/day</span>
              </div>
              <div className="price-summary-row">
                <span>Effective daily rate</span>
                <span>₹{quote.effectiveDailyInr.toFixed(2)}</span>
              </div>
              <div className="price-summary-row">
                <span>Rental total ({days} day{days !== 1 ? 's' : ''})</span>
                <span>₹{quote.rentTotalInr.toFixed(2)}</span>
              </div>
              <div className="price-summary-row">
                <span>Refundable deposit</span>
                <span>₹{quote.depositInr.toLocaleString('en-IN')}</span>
              </div>
              <div className="price-summary-total">
                <span>Grand total</span>
                <span>₹{quote.grandTotalInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleRentClick}
            disabled={!isAvailable}
            style={{ marginTop: '1rem' }}
          >
            {isAvailable ? 'Rent Now' : 'Unavailable'}
          </button>
        </div>
      </div>

      {showModal && (
        <RentalModal phone={phone} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
