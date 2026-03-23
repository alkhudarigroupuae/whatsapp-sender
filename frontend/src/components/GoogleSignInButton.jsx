import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function GoogleSignInButton() {
  const navigate = useNavigate()
  const { signInWithGoogle } = useAuth()
  const ref = useRef(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!clientId || !ref.current) return undefined

    let cancelled = false

    function init() {
      if (cancelled || !ref.current || !window.google?.accounts?.id) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            setErr(null)
            await signInWithGoogle(response.credential)
            navigate('/app', { replace: true })
          } catch (e) {
            setErr(e?.message || 'Google sign-in failed')
          }
        },
      })
      window.google.accounts.id.renderButton(ref.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: Math.min(400, ref.current.offsetWidth || 320),
      })
    }

    if (window.google?.accounts?.id) {
      init()
    } else {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.defer = true
      s.onload = init
      document.body.appendChild(s)
    }

    return () => {
      cancelled = true
    }
  }, [clientId, navigate, signInWithGoogle])

  if (!clientId) {
    return (
      <div className="field-hint">
        Google sign-in: set the same OAuth Client ID as <span className="mono">VITE_GOOGLE_CLIENT_ID</span> (frontend) and{' '}
        <span className="mono">GOOGLE_CLIENT_ID</span> (backend), and add your site URL under Google Cloud → OAuth client → Authorized
        JavaScript origins.
      </div>
    )
  }

  return (
    <div className="field">
      <div ref={ref} />
      {err ? <div className="callout callout-danger" style={{ marginTop: 10 }}>{err}</div> : null}
    </div>
  )
}
