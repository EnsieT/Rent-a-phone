import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getMembershipStatus, subscribeMembership } from '../api'

export default function Membership() {
  const { user, token, login } = useAuth()
  const navigate = useNavigate()
  const [isMember, setIsMember] = useState(false)
  const [expiryDate, setExpiryDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getMembershipStatus()
      .then((res) => {
        setIsMember(res.data.isMember)
        setExpiryDate(res.data.expiryDate)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  async function handleSubscribe() {
    if (!token) {
      navigate('/login', { state: { from: { pathname: '/membership' } } })
      return
    }
    setProcessing(true)
    setError('')
    try {
      await new Promise((r) => setTimeout(r, 1500)) // simulate payment
      const res = await subscribeMembership()
      setIsMember(true)
      setExpiryDate(res.data.expiryDate)
      setSuccess(true)
      // Update auth context with membership status
      if (user && token) {
        login(token, { ...user, isMember: true, membershipExpiry: res.data.expiryDate })
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Subscription failed. Please try again.'
      setError(msg)
    } finally {
      setProcessing(false)
    }
  }

  if (processing) {
    return (
      <div className="section container">
        <div className="checkout-processing">
          <div className="spinner" />
          <h2>Processing Membership...</h2>
          <p>Setting up your premium membership.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="section container">
        <div className="checkout-success">
          <div className="success-icon">✓</div>
          <h2>Welcome to Premium!</h2>
          <p>Your membership is active until {expiryDate ? new Date(expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}.</p>
          <div className="checkout-success-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/phones')}>
              Browse Premium Phones
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section container">
      <div className="membership-page">
        <div className="membership-hero">
          <h1>⭐ Premium Membership</h1>
          <p className="membership-tagline">Unlock exclusive phones, massive deposit savings, and premium perks.</p>
        </div>

        {isMember && (
          <div className="membership-status-card active">
            <div className="membership-status-icon">✓</div>
            <div>
              <h3>Active Membership</h3>
              <p>Valid until {expiryDate ? new Date(expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p>
            </div>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <div className="membership-benefits-grid">
          <div className="membership-benefit-card">
            <div className="benefit-icon">🔓</div>
            <h3>Premium Phone Access</h3>
            <p>Rent exclusive flagship devices like iPhone 15 Pro Max, Galaxy S24 Ultra, and Galaxy Z Fold 5 — available only to members.</p>
          </div>
          <div className="membership-benefit-card">
            <div className="benefit-icon">💰</div>
            <h3>₹9,000 Off Deposit</h3>
            <p>Save ₹9,000 on every rental deposit. This alone can pay for the membership in a single rental!</p>
          </div>
          <div className="membership-benefit-card">
            <div className="benefit-icon">🔄</div>
            <h3>Fully Refundable</h3>
            <p>The entire ₹10,000 membership fee is fully refundable if you cancel within the year. Zero risk.</p>
          </div>
          <div className="membership-benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>Priority Support</h3>
            <p>Get dedicated support, faster delivery, and priority access to newly added phones in our collection.</p>
          </div>
        </div>

        <div className="membership-pricing-card">
          <div className="membership-price-tag">
            <span className="price-amount">₹10,000</span>
            <span className="price-period">/ year</span>
          </div>
          <ul className="membership-features-list">
            <li>✓ Access to 4+ premium-only phones</li>
            <li>✓ ₹9,000 off every rental deposit</li>
            <li>✓ 100% refundable membership fee</li>
            <li>✓ Priority customer support</li>
            <li>✓ Early access to new inventory</li>
          </ul>
          {!isMember && (
            <button
              className="btn btn-primary btn-lg membership-subscribe-btn"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {token ? 'Subscribe Now — ₹10,000/year' : 'Login to Subscribe'}
            </button>
          )}
          {isMember && (
            <div className="membership-active-note">
              You're already a premium member! Enjoy your benefits.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
