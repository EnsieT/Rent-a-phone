import { Link } from 'react-router-dom'
import { loadCatalog } from '../utils/catalogStore'
import type { CatalogPhone, Tier } from '../data/catalog'
import { TIER_LABELS, TIER_ORDER } from '../data/catalog'
import PhoneCard from '../components/PhoneCard'

function getTierDescription(tier: Tier): string {
  switch (tier) {
    case 'budget': return 'Great performance at an affordable price'
    case 'mid-tier': return 'Balanced features for everyday use'
    case 'premium': return 'Top-of-the-line flagship experience'
  }
}

export default function Home() {
  const catalog = loadCatalog()

  const featured = TIER_ORDER.flatMap((tier) =>
    catalog.filter((p) => p.tier === tier).slice(0, 2)
  )

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Rent a Phone Today</h1>
          <p>
            Access the latest smartphones without the commitment. Flexible rentals,
            transparent pricing, and hassle-free experience.
          </p>
          <div className="hero-actions">
            <Link to="/phones" className="btn btn-lg hero-btn-primary">
              Browse Phones
            </Link>
            <Link to="/membership" className="btn btn-lg hero-btn-secondary">
              ⭐ Join Membership
            </Link>
          </div>
        </div>
      </section>

      {/* Marketing Scenarios */}
      <section className="section marketing-section">
        <div className="container">
          <div className="marketing-grid">
            <div className="marketing-card marketing-card-repair">
              <div className="marketing-icon">🔧</div>
              <h3>Phone Damaged? Repair Taking Days?</h3>
              <p>Don't stay disconnected. Pick up a rental in minutes and stay connected while your phone gets fixed. No contracts, no fuss — just the phone you need, when you need it.</p>
              <Link to="/phones" className="btn btn-outline btn-sm">Get a Rental Now →</Link>
            </div>
            <div className="marketing-card marketing-card-try">
              <div className="marketing-icon">🔍</div>
              <h3>Want to Buy a Phone? Try It First!</h3>
              <p>Not sure if it's the right fit? Rent it for a week before committing. Test the camera, battery, performance — everything. Make a confident purchase decision.</p>
              <Link to="/phones" className="btn btn-outline btn-sm">Try Before You Buy →</Link>
            </div>
            <div className="marketing-card marketing-card-travel">
              <div className="marketing-icon">✈️</div>
              <h3>Travelling? Need a Temporary Phone?</h3>
              <p>Keep your primary phone safe while travelling. Rent a budget-friendly device for your trip — perfect for navigation, calls, and photos without the worry.</p>
              <Link to="/phones" className="btn btn-outline btn-sm">Rent for Travel →</Link>
            </div>
            <div className="marketing-card marketing-card-gift">
              <div className="marketing-icon">🎁</div>
              <h3>Gift a Phone Experience</h3>
              <p>Surprise someone special with a premium phone rental. Let them experience the latest iPhone or Galaxy without the full price tag. It's the perfect tech gift.</p>
              <Link to="/phones" className="btn btn-outline btn-sm">Browse Premium →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Promo */}
      <section className="section membership-promo-section">
        <div className="container">
          <div className="membership-promo">
            <div className="membership-promo-content">
              <h2>⭐ Premium Membership</h2>
              <p className="promo-price">₹10,000<span>/year</span> — Fully Refundable</p>
              <ul className="promo-benefits">
                <li>🔓 Access exclusive premium-only phones</li>
                <li>💰 Save ₹9,000 on every rental deposit</li>
                <li>⚡ Priority support &amp; faster delivery</li>
                <li>🔄 100% refundable if you cancel</li>
              </ul>
              <Link to="/membership" className="btn btn-primary btn-lg">Join Now</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section tier-overview-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Choose Your Tier</h2>
          </div>
          <div className="tier-overview-grid">
            {TIER_ORDER.map((tier) => {
              const count = catalog.filter((p) => p.tier === tier).length
              return (
                <Link key={tier} to="/phones" className={`tier-overview-card tier-card-${tier}`}>
                  <div className={`tier-overview-badge tier-badge-large tier-${tier}`}>
                    {TIER_LABELS[tier]}
                  </div>
                  <p className="tier-overview-desc">{getTierDescription(tier)}</p>
                  <p className="tier-overview-count">{count} phone{count !== 1 ? 's' : ''} available</p>
                </Link>
              )
            })}
          </div>
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
          <div className="phone-grid">
            {featured.map((phone: CatalogPhone) => (
              <PhoneCard key={phone.id} phone={phone} />
            ))}
          </div>
        </div>
      </section>

      <section className="section info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">📅</div>
              <h3>Flexible Rentals</h3>
              <p>Rent for as short as 1 day or as long as you need. No long-term commitments.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">💰</div>
              <h3>Volume Discounts</h3>
              <p>Rent longer and save more. Discounts increase every 30 days, up to 30% off.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🏠</div>
              <h3>Rent-to-Own</h3>
              <p>Rent for 365 days and become eligible to purchase the phone at a special price.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
