import { useState } from 'react'
import { createRental } from '../api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { discountPercent, discountedDailyPrice, recordRentalDays } from '../utils/pricing'

interface RentalPhone {
  id: number
  brand: string
  model: string
  perDayPrice: number
}

interface Props {
  phone: RentalPhone
  onClose: () => void
}

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0]
}

export default function RentalModal({ phone, onClose }: Props) {
  const { token } = useAuth()
  const navigate = useNavigate()

  const today = toDateString(new Date())
  const tomorrow = toDateString(new Date(Date.now() + 86400000))

  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(tomorrow)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const basePrice = phone.perDayPrice

  function calcDays(): number {
    const ms = new Date(endDate).getTime() - new Date(startDate).getTime()
    return Math.max(0, Math.ceil(ms / 86400000))
  }

  const days = calcDays()
  const discount = discountPercent(days)
  const effectivePrice = discountedDailyPrice(basePrice, days)
  const total = effectivePrice * days
  const savings = (basePrice - effectivePrice) * days

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      navigate('/login')
      return
    }
    if (days <= 0) {
      setError('End date must be after start date.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await createRental(phone.id, startDate, endDate)
      recordRentalDays(phone.id, days)
      onClose()
      navigate('/rentals', { state: { success: true } })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (err instanceof Error ? err.message : 'Failed to create rental')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Rent {phone.brand} {phone.model}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="start-date">Start Date</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end-date">End Date</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              min={startDate || today}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {days > 0 && (
            <div className="price-summary">
              <div className="price-summary-row">
                <span>Base price per day</span>
                <span>₹{basePrice}</span>
              </div>
              {discount > 0 && (
                <>
                  <div className="price-summary-row discount-row">
                    <span>Discount ({discount}%)</span>
                    <span>-₹{Math.round(savings)}</span>
                  </div>
                  <div className="price-summary-row">
                    <span>Effective price per day</span>
                    <span>₹{Math.round(effectivePrice)}</span>
                  </div>
                </>
              )}
              <div className="price-summary-row">
                <span>Number of days</span>
                <span>{days}</span>
              </div>
              <div className="price-summary-total">
                <span>Total</span>
                <span>₹{Math.round(total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || days <= 0}
            >
              {loading ? 'Booking…' : 'Confirm Rental'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
