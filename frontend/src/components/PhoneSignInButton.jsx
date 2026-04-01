import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './Button.jsx'
import { useAuth } from '../lib/auth.jsx'
import { apiFetch } from '../lib/api.js'

export function PhoneSignInButton() {
  const navigate = useNavigate()
  const { signInWithPhone } = useAuth()
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [smsConfigured, setSmsConfigured] = useState(null)

  useState(() => {
    apiFetch('/api/auth/sms-status')
      .then((r) => setSmsConfigured(r.configured))
      .catch(() => setSmsConfigured(false))
  })

  if (smsConfigured === false) {
    return (
      <div className="field-hint">
        SMS sign-in: set <span className="mono">TWILIO_ACCOUNT_SID</span>,{' '}
        <span className="mono">TWILIO_AUTH_TOKEN</span>, and{' '}
        <span className="mono">TWILIO_PHONE_NUMBER</span> on the backend.
      </div>
    )
  }

  if (smsConfigured === null) return null

  async function onSendOtp(e) {
    e.preventDefault()
    try {
      setBusy(true)
      setErr(null)
      await apiFetch('/api/auth/phone/send-otp', { method: 'POST', body: { phone } })
      setStep('otp')
    } catch (error) {
      setErr(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function onVerifyOtp(e) {
    e.preventDefault()
    try {
      setBusy(true)
      setErr(null)
      await signInWithPhone(phone, code)
      navigate('/app', { replace: true })
    } catch (error) {
      setErr(error.message)
    } finally {
      setBusy(false)
    }
  }

  if (step === 'otp') {
    return (
      <form className="phone-otp-form" onSubmit={onVerifyOtp}>
        <div className="field-hint" style={{ textAlign: 'center', marginBottom: 8 }}>
          Enter the 6-digit code sent to <strong>{phone}</strong>
        </div>
        <label className="field">
          <div className="field-label">Verification code</div>
          <input
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            inputMode="numeric"
            maxLength={6}
            required
            autoFocus
          />
        </label>
        {err && <div className="callout callout-danger">{err}</div>}
        <div className="auth-actions">
          <Button variant="primary" disabled={busy || code.length < 6}>
            {busy ? 'Verifying…' : 'Verify'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setStep('phone')
              setCode('')
              setErr(null)
            }}
          >
            Change number
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form className="phone-otp-form" onSubmit={onSendOtp}>
      <label className="field">
        <div className="field-label">Phone number</div>
        <input
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+971501234567"
          type="tel"
          required
        />
      </label>
      {err && <div className="callout callout-danger">{err}</div>}
      <div className="auth-actions">
        <Button variant="primary" disabled={busy || phone.length < 8}>
          {busy ? 'Sending…' : 'Send code'}
        </Button>
      </div>
    </form>
  )
}
