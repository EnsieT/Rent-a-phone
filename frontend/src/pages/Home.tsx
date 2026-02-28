import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPhones } from '../api'
import type { Phone } from '../api'
import PhoneCard from '../components/PhoneCard'

export default function Home() {
  const [phones, setPhones] = useState<Phone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPhones()
      .then((res) => setPhones(res.data.slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Rent a Phone Today</h1>
          <p>
            Access the latest smartphones without the commitment. Flexible rentals,
            transparent pricing, and hassle-free experience.
          </p>
          <Link to="/phones" className="btn btn-lg" style={{ background: 'white', color: 'var(--blue-600)' }}>
            Browse Phones
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Phones</h2>
            <Link to="/phones" className="btn btn-outline">
              View All Phones
            </Link>
          </div>

          {loading ? (
            <div className="loading">Loading phones…</div>
          ) : phones.length === 0 ? (
            <div className="empty-state">
              <h3>No phones available</h3>
              <p>Check back soon!</p>
            </div>
          ) : (
            <div className="phone-grid">
              {phones.map((phone) => (
                <PhoneCard key={phone.id} phone={phone} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
