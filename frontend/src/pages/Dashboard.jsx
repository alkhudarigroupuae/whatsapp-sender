import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { Card } from '../components/Card.jsx'
import { Badge } from '../components/Badge.jsx'
import { Button } from '../components/Button.jsx'

function Stat({ label, value, hint }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  )
}

function Meter({ label, value, sub }) {
  return (
    <div className="dash-meter">
      <div className="dash-meter-label">{label}</div>
      <div className="dash-meter-value">{value}</div>
      {sub && <div className="dash-meter-sub">{sub}</div>}
    </div>
  )
}

export function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [contactsTotal, setContactsTotal] = useState(0)
  const [campaigns, setCampaigns] = useState([])
  const [waStatus, setWaStatus] = useState(null)
  const [billing, setBilling] = useState(null)
  const [publicCfg, setPublicCfg] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [contactsRes, campaignsRes, waRes, billingRes, cfgRes] = await Promise.all([
          apiFetch('/api/contacts?limit=1&skip=0'),
          apiFetch('/api/campaigns'),
          apiFetch('/api/whatsapp/status'),
          apiFetch('/api/billing/me'),
          apiFetch('/api/public/config'),
        ])
        if (cancelled) return
        setContactsTotal(contactsRes.total || 0)
        setCampaigns(campaignsRes.items || [])
        setWaStatus(waRes.status || null)
        setBilling(billingRes || null)
        setPublicCfg(cfgRes || null)
        setError(null)
      } catch (e) {
        if (cancelled) return
        setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const campaignBreakdown = useMemo(() => {
    const map = new Map()
    for (const c of campaigns) {
      map.set(c.status || 'draft', (map.get(c.status || 'draft') || 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [campaigns])

  const latestCampaigns = campaigns.slice(0, 5)
  const waValue = waStatus?.status || 'starting'
  const waMeta = waValue === 'ready' || waValue === 'authenticated'
  const hasContacts = contactsTotal > 0
  const hasCampaigns = campaigns.length > 0

  const quotaLimit = billing?.quota?.limit
  const quotaRemaining = billing?.quota?.remaining
  const quotaUsed =
    typeof quotaLimit === 'number' && typeof quotaRemaining === 'number' ? Math.max(0, quotaLimit - quotaRemaining) : null
  const quotaPercent =
    typeof quotaUsed === 'number' && typeof quotaLimit === 'number' && quotaLimit > 0
      ? Math.min(100, Math.round((quotaUsed / quotaLimit) * 100))
      : null

  return (
    <div className="dash">
      <div className="dash-hero">
        <div className="dash-hero-bg" aria-hidden="true" />

        <div className="dash-hero-main">
          <div className="dash-kicker">WhatsApp ads & sales sender</div>
          <h1 className="dash-title">Launch message blasts that convert</h1>
          <div className="dash-sub">
            Import your leads, write the offer once, and the system generates a personalized WhatsApp message for each contact — then
            sends safely with queue + limits.
          </div>

          <div className="dash-actions">
            <Button as={Link} to="/app/campaigns" variant="primary" className="dash-btn">
              Create a campaign
            </Button>
            <Button as={Link} to="/app/contacts" variant="ghost" className="dash-btn">
              Import leads
            </Button>
            <Button as={Link} to="/app/whatsapp" variant="ghost" className="dash-btn">
              Connect WhatsApp
            </Button>
          </div>

          {error && <div className="callout callout-danger">{error}</div>}
        </div>

        <div className="dash-hero-side">
          <Card
            className="dash-side-card"
            title="Today’s setup"
            subtitle="Make sure everything is ready before sending"
            right={<Badge value={waValue} />}
          >
            <div className="dash-side-grid">
              <div className={`dash-step${waMeta ? ' is-done' : ''}`}>
                <div className="dash-step-head">
                  <div className="dash-step-title">WhatsApp session</div>
                  <div className="dash-step-pill">{waMeta ? 'Connected' : 'Action required'}</div>
                </div>
                <div className="dash-step-sub">
                  {waMeta ? 'Session is active on the server.' : 'Go to WhatsApp tab and scan QR to link a device.'}
                </div>
                {!waMeta && (
                  <div className="dash-step-actions">
                    <Button as={Link} to="/app/whatsapp" variant="primary" size="sm">
                      Open WhatsApp
                    </Button>
                  </div>
                )}
              </div>

              <div className={`dash-step${hasContacts ? ' is-done' : ''}`}>
                <div className="dash-step-head">
                  <div className="dash-step-title">Lead list</div>
                  <div className="dash-step-pill">{hasContacts ? `${contactsTotal} leads` : 'No leads yet'}</div>
                </div>
                <div className="dash-step-sub">
                  Import CSV/Excel and keep contacts clean (phone normalization + duplicates blocked).
                </div>
                {!hasContacts && (
                  <div className="dash-step-actions">
                    <Button as={Link} to="/app/contacts" variant="primary" size="sm">
                      Import leads
                    </Button>
                  </div>
                )}
              </div>

              <div className={`dash-step${hasCampaigns ? ' is-done' : ''}`}>
                <div className="dash-step-head">
                  <div className="dash-step-title">Offer campaign</div>
                  <div className="dash-step-pill">{hasCampaigns ? `${campaigns.length} campaigns` : 'Create your first'}</div>
                </div>
                <div className="dash-step-sub">
                  Write the offer once — each contact gets a unique message for better deliverability.
                </div>
                {!hasCampaigns && (
                  <div className="dash-step-actions">
                    <Button as={Link} to="/app/campaigns" variant="primary" size="sm">
                      Create campaign
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="dash-row">
        <Card
          className="dash-card"
          title="Sending limits"
          subtitle={loading ? 'Loading…' : 'Protected with monthly quota + hourly cap'}
          right={<Button as={Link} to="/app/billing" variant="ghost" size="sm">Billing</Button>}
        >
          <div className="dash-usage">
            <div className="dash-usage-top">
              <Meter label="Monthly limit" value={typeof quotaLimit === 'number' ? quotaLimit : '—'} sub={billing?.quota?.paid ? 'Pro' : 'Free'} />
              <Meter label="Remaining" value={typeof quotaRemaining === 'number' ? quotaRemaining : '—'} sub="This month" />
              <Meter
                label="Hourly cap"
                value={publicCfg?.sending?.maxPerHour ? `${publicCfg.sending.maxPerHour}/h` : '—'}
                sub="Rate limit"
              />
            </div>
            <div className="dash-bar">
              <div className="dash-bar-track" aria-hidden="true">
                <div className="dash-bar-fill" style={{ width: quotaPercent != null ? `${quotaPercent}%` : '0%' }} />
              </div>
              <div className="dash-bar-meta">
                <span className="dash-bar-left">{quotaPercent != null ? `${quotaPercent}% used` : '—'}</span>
                <span className="dash-bar-right">
                  {publicCfg?.sending?.minDelaySeconds && publicCfg?.sending?.maxDelaySeconds
                    ? `Random delay ${publicCfg.sending.minDelaySeconds}–${publicCfg.sending.maxDelaySeconds}s`
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          className="dash-card"
          title="Campaign pipeline"
          subtitle={loading ? 'Loading…' : 'Track drafts, queued jobs, and completed sends'}
          right={<Button as={Link} to="/app/campaigns" variant="ghost" size="sm">Open</Button>}
        >
          <div className="dash-chips">
            {campaignBreakdown.length ? (
              campaignBreakdown.map(([status, count]) => (
                <div className="dash-chip" key={status}>
                  <Badge value={status} />
                  <span className="dash-chip-num">{count}</span>
                </div>
              ))
            ) : (
              <div className="muted">No campaigns yet.</div>
            )}
          </div>
          <div className="dash-mini">
            <Stat label="Leads" value={contactsTotal} hint="Your imported list" />
            <Stat label="Campaigns" value={campaigns.length} hint="All statuses" />
          </div>
        </Card>
      </div>

      <Card
        className="dash-card"
        title="Recent campaigns"
        subtitle={latestCampaigns.length ? 'Open a campaign to preview messages and start sending' : 'Create a campaign to start your first blast'}
        right={<Button as={Link} to="/app/campaigns" variant="primary" size="sm">Create</Button>}
      >
        <div className="dash-list">
          {latestCampaigns.length ? (
            latestCampaigns.map((c) => (
              <Link className="dash-list-row" key={c._id} to={`/app/campaigns/${c._id}`}>
                <div className="dash-list-main">
                  <div className="dash-list-title">{c.campaignIdea}</div>
                  <div className="dash-list-sub">{new Date(c.createdAt).toLocaleString()}</div>
                </div>
                <div className="dash-list-right">
                  <Badge value={c.status} />
                  <span className="dash-list-cta">Open</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="muted">No campaigns yet.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
