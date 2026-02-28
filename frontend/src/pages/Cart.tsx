import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { items, removeItem, updateDays, totalPrice, totalItems } = useCart()
  const { token } = useAuth()
  const navigate = useNavigate()

  if (totalItems === 0) {
    return (
      <div className="section container">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Browse our collection and add phones to rent.</p>
          <Link to="/phones" className="btn btn-primary btn-lg">
            Browse Phones
          </Link>
        </div>
      </div>
    )
  }

  function handleCheckout() {
    if (!token) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
    } else {
      navigate('/checkout')
    }
  }

  return (
    <div className="section container">
      <div className="section-header">
        <h1 className="section-title">Your Cart ({totalItems})</h1>
        <Link to="/phones" className="btn btn-outline btn-sm">
          Continue Browsing
        </Link>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map(({ phone, days }) => (
            <div key={phone.id} className="cart-item">
              <img
                src={phone.imagePath}
                alt={`${phone.brand} ${phone.model}`}
                className="cart-item-img"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = '/assets/images/fallback.svg'
                }}
              />
              <div className="cart-item-info">
                <div className="cart-item-name">
                  {phone.brand} {phone.model}
                </div>
                <div className="cart-item-meta">
                  {phone.ram} · {phone.storage} · {phone.condition}
                </div>
                <div className="cart-item-price-per-day">₹{phone.perDayPrice}/day</div>
                <div className="cart-item-deposit">Deposit: ₹{phone.buyPrice.toLocaleString('en-IN')}</div>
              </div>
              <div className="cart-item-days">
                <label>Days</label>
                <div className="days-stepper">
                  <button
                    className="stepper-btn"
                    onClick={() => updateDays(phone.id, days - 1)}
                    disabled={days <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={days}
                    onChange={(e) => updateDays(phone.id, parseInt(e.target.value) || 1)}
                    className="stepper-input"
                  />
                  <button className="stepper-btn" onClick={() => updateDays(phone.id, days + 1)}>
                    +
                  </button>
                </div>
              </div>
              <div className="cart-item-total">
                ₹{(phone.perDayPrice * days).toLocaleString('en-IN')}
              </div>
              <button
                className="cart-item-remove"
                onClick={() => removeItem(phone.id)}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-rows">
            {items.map(({ phone, days }) => {
              const rental = phone.perDayPrice * days
              return (
                <div key={phone.id} className="cart-summary-row">
                  <span>
                    {phone.brand} {phone.model} × {days}d
                  </span>
                  <span>₹{rental.toLocaleString('en-IN')}</span>
                </div>
              )
            })}
          </div>
          <div className="cart-summary-total">
            <span>Rental Total</span>
            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-deposit">
            <span>Total Deposit</span>
            <span>₹{items.reduce((s, i) => s + i.phone.buyPrice, 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-discount">
            <span>Rental deducted from deposit</span>
            <span>−₹{items.reduce((s, { phone, days }) => s + Math.min(phone.perDayPrice * days, phone.buyPrice), 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-deposit">
            <span>Refundable Deposit</span>
            <span>₹{items.reduce((s, { phone, days }) => s + Math.max(0, phone.buyPrice - phone.perDayPrice * days), 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-grand">
            <span>You'll Pay</span>
            <span>₹{(totalPrice + items.reduce((s, { phone, days }) => s + Math.max(0, phone.buyPrice - phone.perDayPrice * days), 0)).toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-terms-note">
            <small>🚚 Pickup & Drop available at ₹150/device · ⚠️ Late return: 2× daily rate/day · Damage costs deducted from deposit</small>
          </div>
          <button className="btn btn-primary btn-lg cart-checkout-btn" onClick={handleCheckout}>
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  )
}
