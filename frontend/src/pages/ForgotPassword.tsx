import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword, resetPassword } from '../api'

type Step = 'email' | 'otp' | 'success'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [demoOtp, setDemoOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await forgotPassword(email)
      // In demo mode, show the OTP
      if (res.data._demo_otp) {
        setDemoOtp(res.data._demo_otp)
      }
      setStep('otp')
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          'Failed to send OTP. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email, otp, newPassword)
      setStep('success')
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          'Failed to reset password. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="form-page">
        <div className="form-card">
          <div className="forgot-success">
            <div className="success-icon-sm">✓</div>
            <h1>Password Reset!</h1>
            <p>Your password has been updated successfully. You can now log in with your new password.</p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Forgot Password</h1>

        {step === 'email' && (
          <>
            <p>Enter your registered email. We'll send you a one-time password (OTP) to reset it.</p>

            <form onSubmit={handleSendOtp}>
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="fp-email">Email</label>
                <input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <p>Enter the 6-digit OTP sent to <strong>{email}</strong> and choose a new password.</p>

            {demoOtp && (
              <div className="alert alert-success otp-demo-alert">
                <strong>Demo OTP:</strong> {demoOtp}
                <br />
                <small>(In production, this would be sent via email/SMS)</small>
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="fp-otp">OTP Code</label>
                <input
                  id="fp-otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  className="otp-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fp-new-pwd">New Password</label>
                <input
                  id="fp-new-pwd"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fp-confirm-pwd">Confirm Password</label>
                <input
                  id="fp-confirm-pwd"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>

              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '0.5rem' }}
                onClick={() => { setStep('email'); setError(''); setDemoOtp('') }}
              >
                ← Back
              </button>
            </form>
          </>
        )}

        <div className="form-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
