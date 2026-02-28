import { useEffect, useState } from 'react'
import { getPhones } from '../api'
import type { Phone } from '../api'
import PhoneCard from '../components/PhoneCard'

export default function Phones() {
  const [phones, setPhones] = useState<Phone[]>([])
  const [loading, setLoading] = useState(true)
  const [availableOnly, setAvailableOnly] = useState(false)

  useEffect(() => {
    setLoading(true)
    getPhones(availableOnly)
      .then((res) => setPhones(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [availableOnly])

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Browse Phones</h1>
          <span style={{ color: 'var(--gray-600)', fontSize: '0.9375rem' }}>
            {phones.length} phone{phones.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div className="filter-bar">
          <label>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            Show available only
          </label>
        </div>

        {loading ? (
          <div className="loading">Loading phones…</div>
        ) : phones.length === 0 ? (
          <div className="empty-state">
            <h3>No phones found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="phone-grid">
            {phones.map((phone) => (
              <PhoneCard key={phone.id} phone={phone} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
