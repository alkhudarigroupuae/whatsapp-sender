import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { Badge } from '../components/Badge.jsx'
import { apiFetch } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export function Billing() {
  const { user, refresh } = useAuth()
  const query = useQuery()
  const [me, setMe] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await apiFetch('/api/billing/me')
        if (cancelled) return
        setMe(res)
      } catch (e) {
        if (cancelled) return
        setError(e.message)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (query.get('success')) refresh()
  }, [query, refresh])

  async function onUpgrade() {
    try {
      setBusy(true)
      setError(null)
      const res = await apiFetch('/api/billing/checkout', { method: 'POST', body: {} })
      window.location.href = res.url
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  async function onPortal() {
    try {
      setBusy(true)
      setError(null)
      const res = await apiFetch('/api/billing/portal', { method: 'POST', body: {} })
      window.location.href = res.url
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <Card
        title="Billing"
        subtitle="Manage subscription and sending limits"
        right={
          <div className="row">
            <Badge value={user?.plan || 'free'} />
            <Button onClick={onPortal} variant="ghost" size="sm" disabled={busy}>
              Manage
            </Button>
            <Button onClick={onUpgrade} variant="primary" size="sm" disabled={busy}>
              Upgrade
            </Button>
          </div>
        }
      >
        {query.get('success') && <div className="callout">Payment successful. Pro features will activate shortly.</div>}
        {query.get('canceled') && <div className="callout">Checkout canceled.</div>}
        {error && <div className="callout callout-danger">{error}</div>}

        <div className="grid-2">
          <div className="panel">
            <div className="panel-title">Plan</div>
            <div className="panel-row">
              <div className="panel-k">Current</div>
              <div className="panel-v">{me?.user?.plan || '—'}</div>
            </div>
            <div className="panel-row">
              <div className="panel-k">Subscription</div>
              <div className="panel-v">{me?.user?.stripeSubscriptionStatus || 'none'}</div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">Quota</div>
            <div className="panel-row">
              <div className="panel-k">Monthly limit</div>
              <div className="panel-v">{me?.quota?.limit ?? '—'}</div>
            </div>
            <div className="panel-row">
              <div className="panel-k">Remaining</div>
              <div className="panel-v">{me?.quota?.remaining ?? '—'}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

