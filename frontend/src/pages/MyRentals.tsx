import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getMyRentals, cancelRental } from '../api'
import type { Rental } from '../api'

interface LocationState {
  success?: boolean
}

export default function MyRentals() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const location = useLocation()

  useEffect(() => {
    if ((location.state as LocationState)?.success) {
      setSuccessMsg('Your rental was successfully booked!')
      window.history.replaceState({}, '')
    }
  }, [location.state])

  useEffect(() => {
    fetchRentals()
  }, [])

  async function fetchRentals() {
    try {
      const res = await getMyRentals()
      setRentals(res.data)
    } catch {
      setError('Failed to load rentals.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(id: number) {
    if (!confirm('Are you sure you want to cancel this rental?')) return
    try {
      await cancelRental(id)
      setRentals((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
      )
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          'Failed to cancel rental.'
      )
    }
  }

  function statusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge badge-pending'
      case 'active': return 'badge badge-active'
      case 'completed': return 'badge badge-completed'
      case 'cancelled': return 'badge badge-cancelled'
      default: return 'badge'
    }
  }

  return (
    <div className="rentals-page">
      <div className="section-header">
        <h1 className="section-title">My Rentals</h1>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading rentals…</div>
      ) : rentals.length === 0 ? (
        <div className="empty-state">
          <h3>No rentals yet</h3>
          <p>Browse our phones and make your first rental!</p>
          <Link to="/phones" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse Phones
          </Link>
        </div>
      ) : (
        <div>
          {rentals.map((rental) => (
            <div key={rental.id} className="rental-card">
              <img
                className="rental-card-image"
                src={rental.image_url || 'https://placehold.co/140x120?text=Phone'}
                alt={`${rental.brand} ${rental.model}`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://placehold.co/140x120?text=Phone'
                }}
              />
              <div className="rental-card-body">
                <div className="rental-card-header">
                  <div>
                    <div className="rental-card-title">
                      {rental.brand} {rental.model}
                    </div>
                    <div className="rental-card-dates">
                      {rental.start_date} → {rental.end_date}
                    </div>
                  </div>
                  <span className={statusBadgeClass(rental.status)}>
                    {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                  </span>
                </div>
                <div className="rental-card-price">
                  Total: ${rental.total_price.toFixed(2)}
                </div>
                {rental.status !== 'cancelled' && rental.status !== 'completed' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(rental.id)}
                    >
                      Cancel Rental
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
