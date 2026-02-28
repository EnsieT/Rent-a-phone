import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createRental } from '../api'
import { recordRentalDays } from '../utils/pricing'

type Step = 'review' | 'payment' | 'processing' | 'success'
type PaymentMethod = 'upi' | 'card' | 'netbanking'

const PICKUP_DROP_CHARGE = 150

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('review')
  const [payMethod, setPayMethod] = useState<PaymentMethod>('upi')
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [upiId, setUpiId] = useState('')
  const [selectedBank, setSelectedBank] = useState('')
  const [error, setError] = useState('')
  const [pickupDrop, setPickupDrop] = useState(false)

  const isMember = user?.isMember ?? false
  const depositDiscount = isMember ? 9000 : 0

  // Dynamic deposit: deposit = buy_price (- member discount) - rental amount
  // The rental is deducted from the deposit, so final deposit = max(0, deposit - rental)
  const itemBreakdowns = items.map(({ phone, days }) => {
    const baseDeposit = Math.max(0, phone.buyPrice - depositDiscount)
    const rental = phone.perDayPrice * days
    const finalDeposit = Math.max(0, baseDeposit - rental)
    return { phone, days, baseDeposit, rental, finalDeposit }
  })

  const totalRental = totalPrice
  const totalBaseDeposit = itemBreakdowns.reduce((s, b) => s + b.baseDeposit, 0)
  const totalFinalDeposit = itemBreakdowns.reduce((s, b) => s + b.finalDeposit, 0)
  const totalRentalDeducted = totalBaseDeposit - totalFinalDeposit
  const pickupDropTotal = pickupDrop ? items.length * PICKUP_DROP_CHARGE : 0
  // Grand total = rental + final deposit (after rental deducted) + pickup/drop
  const grandTotal = totalRental + totalFinalDeposit + pickupDropTotal

  if (items.length === 0 && step !== 'success') {
    navigate('/cart')
    return null
  }

  function formatCard(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  function validatePayment(): boolean {
    if (payMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g., name@upi)')
        return false
      }
    } else if (payMethod === 'card') {
      if (!cardName || cardNumber.replace(/\s/g, '').length < 16 || cardExpiry.length < 5 || cardCvv.length < 3) {
        setError('Please fill all card details correctly.')
        return false
      }
    } else if (payMethod === 'netbanking') {
      if (!selectedBank) {
        setError('Please select a bank.')
        return false
      }
    }
    return true
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!validatePayment()) return
    setError('')
    setStep('processing')

    await new Promise((r) => setTimeout(r, 2500))

    const today = new Date()
    try {
      for (const { phone, days } of items) {
        const startDate = today.toISOString().split('T')[0]
        const endDate = new Date(today.getTime() + days * 86400000).toISOString().split('T')[0]
        await createRental(phone.id, startDate, endDate, pickupDrop)
        recordRentalDays(phone.id, days)
      }
      clearCart()
      setStep('success')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Payment failed. Please try again.'
      setError(msg)
      setStep('payment')
    }
  }

  if (step === 'processing') {
    return (
      <div className="section container">
        <div className="checkout-processing">
          <div className="spinner" />
          <h2>Processing Payment...</h2>
          <p>
            {payMethod === 'upi' && 'Waiting for UPI confirmation...'}
            {payMethod === 'card' && 'Verifying card details...'}
            {payMethod === 'netbanking' && 'Redirecting to bank portal...'}
          </p>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="section container">
        <div className="checkout-success">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Your phones have been rented successfully. You can view your rentals below.</p>
          <div className="checkout-success-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/rentals')}>
              View My Rentals
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/phones')}>
              Browse More Phones
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section container">
      <h1 className="section-title">Checkout</h1>

      <div className="checkout-layout">
        <div className="checkout-form-section">
          {step === 'review' && (
            <>
              <h3>Order Review</h3>
              <div className="checkout-items">
                {itemBreakdowns.map(({ phone, days, baseDeposit, rental, finalDeposit }) => (
                  <div key={phone.id} className="checkout-item checkout-item-detailed">
                    <img src={phone.imagePath} alt={phone.model} className="checkout-item-img" />
                    <div className="checkout-item-body">
                      <div className="checkout-item-name">
                        {phone.brand} {phone.model}
                        {phone.premiumOnly && <span className="premium-only-badge-sm">★</span>}
                      </div>
                      <div className="checkout-item-detail">
                        {days} day{days > 1 ? 's' : ''} × ₹{phone.perDayPrice}/day = <strong>₹{rental.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="checkout-deposit-breakdown">
                        <div className="deposit-line">
                          Deposit: ₹{baseDeposit.toLocaleString('en-IN')}
                          {isMember && <span className="member-discount-tag"> (₹9,000 member discount)</span>}
                        </div>
                        <div className="deposit-line deposit-deduction">
                          Rental deducted: −₹{Math.min(rental, baseDeposit).toLocaleString('en-IN')}
                        </div>
                        <div className="deposit-line deposit-final">
                          Final deposit: <strong>₹{finalDeposit.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="checkout-item-price">
                      ₹{rental.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pickup & Drop option */}
              <div className="checkout-option-card">
                <label className="checkout-option-label">
                  <input
                    type="checkbox"
                    checked={pickupDrop}
                    onChange={(e) => setPickupDrop(e.target.checked)}
                  />
                  <div>
                    <strong>🚚 Pickup & Drop Service</strong>
                    <span className="option-price">₹{PICKUP_DROP_CHARGE}/device</span>
                  </div>
                </label>
                <p className="option-description">
                  We'll pick up the phone from your doorstep and collect it back after the rental period.
                </p>
              </div>

              {/* Terms & Conditions */}
              <div className="checkout-terms">
                <h4>📋 Rental Terms</h4>
                <ul>
                  <li>
                    <strong>24-hour billing:</strong> Rentals are charged on a 24-hour basis from the start time.
                  </li>
                  <li>
                    <strong>Late return penalty:</strong> For every day of delay beyond the end date, <strong>2× the daily rental rate</strong> will be deducted from your deposit.
                  </li>
                  <li>
                    <strong>Damage policy:</strong> Any damage to the phone (scratches, screen cracks, water damage, etc.) will be assessed and the repair/replacement cost will be deducted from your refundable deposit.
                  </li>
                  <li>
                    <strong>Deposit refund:</strong> Your deposit (minus rental and any applicable deductions) will be refunded within 3-5 business days after the phone is returned in acceptable condition.
                  </li>
                </ul>
              </div>

              <button className="btn btn-primary btn-lg" onClick={() => setStep('payment')} style={{ width: '100%', marginTop: '1.5rem' }}>
                Continue to Payment
              </button>
            </>
          )}

          {step === 'payment' && (
            <div className="razorpay-payment-section">
              <div className="razorpay-header">
                <div className="razorpay-logo">
                  <span className="rp-icon">💳</span>
                  <span className="rp-title">Secure Payment</span>
                </div>
                <div className="razorpay-amount">₹{grandTotal.toLocaleString('en-IN')}</div>
              </div>

              <div className="payment-method-tabs">
                <button
                  className={`payment-tab ${payMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => { setPayMethod('upi'); setError('') }}
                >
                  <span className="tab-icon">📱</span> UPI
                </button>
                <button
                  className={`payment-tab ${payMethod === 'card' ? 'active' : ''}`}
                  onClick={() => { setPayMethod('card'); setError('') }}
                >
                  <span className="tab-icon">💳</span> Card
                </button>
                <button
                  className={`payment-tab ${payMethod === 'netbanking' ? 'active' : ''}`}
                  onClick={() => { setPayMethod('netbanking'); setError('') }}
                >
                  <span className="tab-icon">🏦</span> Net Banking
                </button>
              </div>

              <form onSubmit={handlePay} className="payment-form">
                <p className="payment-notice">This is a mock payment — no real charges will be made.</p>

                {error && <div className="alert alert-error">{error}</div>}

                {payMethod === 'upi' && (
                  <div className="upi-payment-section">
                    <div className="upi-qr-placeholder">
                      <div className="qr-box">
                        <div className="qr-pattern">
                          {Array.from({ length: 49 }).map((_, i) => (
                            <div key={i} className={`qr-cell ${Math.random() > 0.5 ? 'dark' : ''}`} />
                          ))}
                        </div>
                        <p className="qr-label">Scan to Pay</p>
                      </div>
                    </div>
                    <div className="upi-or">OR</div>
                    <div className="form-group">
                      <label htmlFor="upi-id">Enter UPI ID</label>
                      <input
                        id="upi-id"
                        type="text"
                        placeholder="yourname@paytm / yourname@gpay"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="upi-apps">
                      <span className="upi-app-badge" onClick={() => setUpiId('user@gpay')}>Google Pay</span>
                      <span className="upi-app-badge" onClick={() => setUpiId('user@paytm')}>Paytm</span>
                      <span className="upi-app-badge" onClick={() => setUpiId('user@phonepe')}>PhonePe</span>
                      <span className="upi-app-badge" onClick={() => setUpiId('user@ybl')}>BHIM</span>
                    </div>
                  </div>
                )}

                {payMethod === 'card' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="card-name">Name on Card</label>
                      <input
                        id="card-name"
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="card-number">Card Number</label>
                      <input
                        id="card-number"
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCard(e.target.value))}
                        maxLength={19}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="card-expiry">Expiry</label>
                        <input
                          id="card-expiry"
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="card-cvv">CVV</label>
                        <input
                          id="card-cvv"
                          type="password"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {payMethod === 'netbanking' && (
                  <div className="netbanking-section">
                    <div className="form-group">
                      <label>Select Bank</label>
                      <div className="bank-grid">
                        {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            className={`bank-option ${selectedBank === bank ? 'selected' : ''}`}
                            onClick={() => setSelectedBank(bank)}
                          >
                            🏦 {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-lg razorpay-pay-btn">
                  Pay ₹{grandTotal.toLocaleString('en-IN')}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setStep('review')} style={{ width: '100%', marginTop: '0.5rem' }}>
                  Back to Review
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="checkout-summary">
          <h3>Summary</h3>
          {itemBreakdowns.map(({ phone, days, rental }) => (
            <div key={phone.id} className="cart-summary-row">
              <span>{phone.brand} {phone.model} × {days}d</span>
              <span>₹{rental.toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="cart-summary-subtotal">
            <span>Rental</span>
            <span>₹{totalRental.toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-subtotal">
            <span>Deposit (before rental)</span>
            <span>₹{totalBaseDeposit.toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-discount">
            <span>Rental deducted from deposit</span>
            <span>−₹{totalRentalDeducted.toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary-subtotal">
            <span>Refundable Deposit</span>
            <span>₹{totalFinalDeposit.toLocaleString('en-IN')}</span>
          </div>
          {isMember && (
            <div className="cart-summary-discount">
              <span>Member Deposit Discount</span>
              <span>−₹{(items.length * 9000).toLocaleString('en-IN')}</span>
            </div>
          )}
          {pickupDrop && (
            <div className="cart-summary-subtotal">
              <span>Pickup & Drop ({items.length}×₹{PICKUP_DROP_CHARGE})</span>
              <span>₹{pickupDropTotal.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="cart-summary-total">
            <span>You Pay Today</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="checkout-summary-note">
            <small>⚠️ Late returns: 2× daily rate/day deducted from deposit. Damage costs recovered from deposit.</small>
          </div>
        </div>
      </div>
    </div>
  )
}
