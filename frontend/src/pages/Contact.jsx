import { useState } from 'react'
import { Button } from '../components/Button.jsx'
import { Card } from '../components/Card.jsx'
import { apiFetch } from '../lib/api.js'

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    try {
      setBusy(true)
      setError(null)
      setOk(false)
      await apiFetch('/api/contact', { method: 'POST', body: { name, email, message } })
      setOk(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mkt-page">
      <div className="mkt-hero">
        <div className="mkt-hero-kicker">Contact</div>
        <h1 className="mkt-hero-title">Tell us what you’re deploying.</h1>
        <div className="mkt-hero-sub">We can help with domain, VPS, Stripe, and WhatsApp session stability.</div>
      </div>

      <div className="mkt-grid mkt-grid-contact">
        <Card title="Send a message" subtitle="We reply to the email you provide">
          <form className="auth-form" onSubmit={onSubmit}>
            <label className="field">
              <div className="field-label">Name</div>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
            </label>
            <label className="field">
              <div className="field-label">Email</div>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" maxLength={200} />
            </label>
            <label className="field">
              <div className="field-label">Message</div>
              <textarea className="input" value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} maxLength={4000} />
            </label>
            {ok && <div className="callout">Message received. Check your inbox soon.</div>}
            {error && <div className="callout callout-danger">{error}</div>}
            <div className="auth-actions">
              <Button variant="primary" disabled={busy}>
                {busy ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Direct" subtitle="Fastest way to reach us">
          <div className="mkt-copy">
            Email: <a className="link" href="mailto:support@senderstudio.local">support@senderstudio.local</a>
          </div>
          <div className="mkt-copy">
            If you want “real deploy”, send your domain + VPS provider and I’ll set the exact production config.
          </div>
        </Card>
      </div>
    </div>
  )
}

