import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getPhone } from '../api'
import type { Phone } from '../api'
import RentalModal from '../components/RentalModal'
import { useAuth } from '../context/AuthContext'

export default function PhoneDetail() {
  const { id } = useParams<{ id: string }>()
  const [phone, setPhone] = useState<Phone | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
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

  function handleRentClick() {
    if (!token) {
      navigate('/login', { state: { from: { pathname: `/phones/${phone!.id}` } } })
    } else {
      setShowModal(true)
    }
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
            ${phone.price_per_day.toFixed(2)} <span>/ day</span>
          </div>

          {phone.description && (
            <p className="phone-detail-description">{phone.description}</p>
          )}

          <button
            className="btn btn-primary btn-lg"
            onClick={handleRentClick}
            disabled={!isAvailable}
            style={{ marginTop: '0.5rem' }}
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
