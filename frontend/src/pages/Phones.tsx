import { useState } from 'react'
import { loadCatalog } from '../utils/catalogStore'
import type { CatalogPhone, Tier } from '../data/catalog'
import { TIER_LABELS, TIER_ORDER } from '../data/catalog'
import PhoneCard from '../components/PhoneCard'

export default function Phones() {
  const [availableOnly, setAvailableOnly] = useState(false)

  const catalog = loadCatalog()
  const phones = availableOnly ? catalog.filter((p) => p.available) : catalog

  const grouped = TIER_ORDER.reduce<Record<Tier, CatalogPhone[]>>(
    (acc, tier) => {
      acc[tier] = phones.filter((p) => p.tier === tier)
      return acc
    },
    { budget: [], 'mid-tier': [], premium: [] }
  )

  const totalShown = phones.length

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Browse Phones</h1>
          <span style={{ color: 'var(--gray-600)', fontSize: '0.9375rem' }}>
            {totalShown} phone{totalShown !== 1 ? 's' : ''} found
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

        {totalShown === 0 ? (
          <div className="empty-state">
            <h3>No phones found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          TIER_ORDER.map((tier) =>
            grouped[tier].length === 0 ? null : (
              <section key={tier} className="tier-section">
                <div className="tier-section-header">
                  <h2 className={`tier-section-title tier-title-${tier}`}>
                    {TIER_LABELS[tier]}
                  </h2>
                  <span className="tier-section-count">
                    {grouped[tier].length} phone{grouped[tier].length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="phone-grid">
                  {grouped[tier].map((phone) => (
                    <PhoneCard key={phone.id} phone={phone} />
                  ))}
                </div>
              </section>
            )
          )
        )}
      </div>
    </div>
  )
}
