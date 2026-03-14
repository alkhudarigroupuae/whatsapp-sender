import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export function Topbar({ title }) {
  const { user, signOut } = useAuth()

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">{title}</div>
        <div className="topbar-kicker">WhatsApp ads & sales campaigns</div>
      </div>
      <div className="topbar-right">
        <div className="topbar-user">{user?.email}</div>
        <Link to="/app/billing" className="pill">
          Billing
          <span className="pill-ic" aria-hidden="true">
            ↗
          </span>
        </Link>
        <Link to="/app/whatsapp" className="pill">
          WhatsApp
          <span className="pill-ic" aria-hidden="true">
            ↗
          </span>
        </Link>
        <button type="button" className="pill pill-btn" onClick={signOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}
