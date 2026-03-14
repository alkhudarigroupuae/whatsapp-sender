import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { useAuth } from '../lib/auth.jsx'

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    try {
      setBusy(true)
      setError(null)
      await register({ name, email, password })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <Card title="Create account" subtitle="Start with a safe monthly quota">
        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field">
            <div className="field-label">Name</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
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
              minLength={8}
            />
          </label>
          {error && <div className="callout callout-danger">{error}</div>}
          <div className="auth-actions">
            <Button variant="primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create'}
            </Button>
            <Button as={Link} to="/login" variant="ghost">
              Sign in
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
