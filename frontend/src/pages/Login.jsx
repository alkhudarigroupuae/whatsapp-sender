import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { GoogleSignInButton } from '../components/GoogleSignInButton.jsx'
import { useAuth } from '../lib/auth.jsx'

export function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    try {
      setBusy(true)
      setError(null)
      await signIn({ email, password })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <Card title="Sign in" subtitle="Welcome back">
        <GoogleSignInButton />
        <div className="field-hint" style={{ textAlign: 'center', margin: '4px 0 14px' }}>
          or sign in with email
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field">
            <div className="field-label">Email</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label className="field">
            <div className="field-label">Password</div>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>
          {error && <div className="callout callout-danger">{error}</div>}
          <div className="auth-actions">
            <Button variant="primary" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
            <Button as={Link} to="/register" variant="ghost">
              Create account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

