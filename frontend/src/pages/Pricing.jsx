import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { useAuth } from '../lib/auth.jsx'
import { apiFetch } from '../lib/api.js'

export function Pricing() {
  const { user } = useAuth()
  const [cfg, setCfg] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiFetch('/api/public/config')
      .then((data) => {
        if (!cancelled) setCfg(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const freeLimit = cfg?.limits?.freeMonthly || 200
  const proLimit = cfg?.limits?.proMonthly || 5000

  return (
    <div className="mkt-page">
      <div className="mkt-hero">
        <div className="mkt-hero-kicker">Pricing</div>
        <h1 className="mkt-hero-title">Simple plans. No hidden fees.</h1>
        <div className="mkt-hero-sub">
          Start free and upgrade when you need more volume. Both plans include AI rewriting, queue management, and rate limiting.
        </div>
      </div>

      <div className="pricing-grid">
        <Card title="Free" subtitle="Perfect for testing and warm leads">
          <div className="pricing-price">
            <span className="pricing-amount">$0</span>
            <span className="pricing-period">/ month</span>
          </div>
          <div className="pricing-features">
            <div className="pricing-feature">
              <span className="pricing-check" aria-hidden="true" />
              <span>{freeLimit} messages per month</span>
            </div>
            <div className="pricing-feature">
              <span className="pricing-check" aria-hidden="true" />
              <span>AI-personalized messages</span>
            </div>
            <div className="pricing-feature">
              <span className="pricing-check" aria-hidden="true" />
              <span>Smart queue with random delays</span>
            </div>
            <div className="pricing-feature">
              <span className="pricing-check" aria-hidden="true" />
              <span>CSV / Excel contact import</span>
            </div>
            <div className="pricing-feature">
              <span className="pricing-check" aria-hidden="true" />
              <span>Campaign tracking and logs</span>
            </div>
            <div className="pricing-feature">
              <span className="pricing-check" aria-hidden="true" />
              <span>Google, email, or phone sign-in</span>
            </div>
          </div>
          <div className="pricing-cta">
            {user ? (
              <Button as={Link} to="/app" variant="ghost" style={{ width: '100%' }}>
                Open dashboard
              </Button>
            ) : (
              <Button as={Link} to="/register" variant="ghost" style={{ width: '100%' }}>
                Get started free
              </Button>
            )}
          </div>
        </Card>

        <Card title="Pro" subtitle="Unlock scale for serious campaigns" className="pricing-highlight">
          <div className="pricing-price">
            <span className="pricing-amount">Pro</span>
            <span className="pricing-period">/ month</span>
          </div>
          <div className="pricing-features">
            <div className="pricing-feature">
              <span className="pricing-check is-pro" aria-hidden="true" />
              <span><strong>{proLimit.toLocaleString()}</strong> messages per month</span>
            </div>
            <div className="pricing-feature">
              <span className="pricing-check is-pro" aria-hidden="true" />
              <span>Everything in Free</span>
            </div>
            <div className="pricing-feature">
              <span className="pricing-check is-pro" aria-hidden="true" />
              <span>Media campaigns (images, video, PDF)</span>
            </div>
            <div className="pricing-feature">
              <span className="pricing-check is-pro" aria-hidden="true" />
              <span>Voice note attachments</span>
            </div>
            <div className="pricing-feature">
              <span className="pricing-check is-pro" aria-hidden="true" />
              <span>Priority sending queue</span>
            </div>
            <div className="pricing-feature">
              <span className="pricing-check is-pro" aria-hidden="true" />
              <span>Failure retries and monitoring</span>
            </div>
          </div>
          <div className="pricing-cta">
            {user ? (
              <Button as={Link} to="/app/billing" variant="primary" style={{ width: '100%' }}>
                Upgrade now
              </Button>
            ) : (
              <Button as={Link} to="/register" variant="primary" style={{ width: '100%' }}>
                Start free, upgrade later
              </Button>
            )}
          </div>
        </Card>
      </div>

      <div className="pricing-faq">
        <Card title="Frequently asked questions" subtitle="Everything you need to know">
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-q">How does the free plan work?</div>
              <div className="faq-a">
                You get {freeLimit} messages per month with all core features. No credit card required.
                When you hit the limit, sending pauses until the next billing cycle.
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-q">Can I cancel anytime?</div>
              <div className="faq-a">
                Yes. Subscriptions are managed through Stripe. Cancel from the Billing page and you'll keep Pro access until the end of your billing period.
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-q">Do I need my own WhatsApp number?</div>
              <div className="faq-a">
                Yes. You connect your WhatsApp account by scanning a QR code. Messages are sent from your number so they look personal and authentic.
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-q">Is my data safe?</div>
              <div className="faq-a">
                Each account is fully isolated in the database. Your contacts, campaigns, and messages are never visible to other users.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
