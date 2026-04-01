import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { useAuth } from '../lib/auth.jsx'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export function ResetPassword() {
  const navigate = useNavigate()
  const query = useQuery()
  const { resetPassword } = useAuth()
  const token = query.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  if (!token) {
    return (
      <div className="auth">
        <Card title="Invalid link" subtitle="This reset link is missing or malformed">
          <div className="auth-form">
            <div className="callout callout-danger">No reset token found in the URL.</div>
            <div className="auth-actions">
              <Button as={Link} to="/forgot-password" variant="primary">
                Request a new link
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    try {
      setBusy(true)
      setError(null)
      await resetPassword(token, password)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <Card title="Set new password" subtitle="Choose a strong password (min 8 characters)">
        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field">
            <div className="field-label">New password</div>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={8}
              autoFocus
            />
          </label>
          <label className="field">
            <div className="field-label">Confirm password</div>
            <input
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              required
              minLength={8}
            />
          </label>
          {error && <div className="callout callout-danger">{error}</div>}
          <div className="auth-actions">
            <Button variant="primary" disabled={busy}>
              {busy ? 'Saving…' : 'Reset password'}
            </Button>
            <Button as={Link} to="/login" variant="ghost">
              Back to sign in
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
