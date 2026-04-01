import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { apiFetch } from '../lib/api.js'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    try {
      setBusy(true)
      setError(null)
      await apiFetch('/api/auth/forgot-password', { method: 'POST', body: { email } })
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <Card title="Reset password" subtitle="We'll send a reset link to your email">
        {sent ? (
          <div className="auth-form">
            <div className="callout">
              If an account exists for <strong>{email}</strong>, a password reset link has been sent.
              Check your inbox (and spam folder).
            </div>
            <div className="auth-actions">
              <Button as={Link} to="/login" variant="primary">
                Back to sign in
              </Button>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={onSubmit}>
            <label className="field">
              <div className="field-label">Email address</div>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoFocus
              />
            </label>
            {error && <div className="callout callout-danger">{error}</div>}
            <div className="auth-actions">
              <Button variant="primary" disabled={busy}>
                {busy ? 'Sending…' : 'Send reset link'}
              </Button>
              <Button as={Link} to="/login" variant="ghost">
                Back to sign in
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
