import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button.jsx'
import { Card } from '../components/Card.jsx'
import { useAuth } from '../lib/auth.jsx'
import { apiFetch } from '../lib/api.js'

export function Landing() {
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

  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-head">
          <div className="landing-kicker">WhatsApp marketing, safer by design</div>
          <h1 className="landing-title">AI-personalized messages that don't look automated</h1>
          <div className="landing-sub">
            Upload your client list, generate unique messages per contact, and send through a queue with random delays and rate limits.
          </div>
          <div className="landing-actions">
            {user ? (
              <Button as={Link} to="/app" variant="primary">
                Open dashboard
              </Button>
            ) : (
              <>
                <Button as={Link} to="/register" variant="primary">
                  Create account
                </Button>
                <Button as={Link} to="/login" variant="ghost">
                  Sign in
                </Button>
              </>
            )}
            <Button as={Link} to="/pricing" variant="ghost">
              Pricing
            </Button>
          </div>
        </div>

        <div className="landing-panels">
          <Card title="Free plan" subtitle="Start with a safe quota">
            <div className="landing-points">
              <div className="landing-point">
                <div className="landing-point-title">
                  {cfg?.limits?.freeMonthly ? `${cfg.limits.freeMonthly} messages / month` : 'Monthly message limit'}
                </div>
                <div className="landing-point-sub">Perfect for testing and warm leads</div>
              </div>
              <div className="landing-point">
                <div className="landing-point-title">AI rewriting</div>
                <div className="landing-point-sub">Unique wording each time</div>
              </div>
              <div className="landing-point">
                <div className="landing-point-title">Smart sending</div>
                <div className="landing-point-sub">
                  {cfg?.sending?.maxPerHour ? `${cfg.sending.maxPerHour}/hour cap` : 'Rate limited'} +{' '}
                  {cfg?.sending?.minDelaySeconds && cfg?.sending?.maxDelaySeconds
                    ? `${cfg.sending.minDelaySeconds}–${cfg.sending.maxDelaySeconds}s random delay`
                    : 'random delays'}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Pro plan" subtitle="Unlock scale">
            <div className="landing-points">
              <div className="landing-point">
                <div className="landing-point-title">
                  {cfg?.limits?.proMonthly ? `${cfg.limits.proMonthly} messages / month` : 'Higher limits'}
                </div>
                <div className="landing-point-sub">Upgrade via subscription</div>
              </div>
              <div className="landing-point">
                <div className="landing-point-title">Media campaigns</div>
                <div className="landing-point-sub">Images, videos, PDFs + captions</div>
              </div>
              <div className="landing-point">
                <div className="landing-point-title">Monitoring</div>
                <div className="landing-point-sub">Logs, failures, retries, previews</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* How it works */}
      <div className="landing-section">
        <div className="landing-section-head">
          <div className="landing-section-kicker">How it works</div>
          <h2 className="landing-section-title">Three steps to your first campaign</h2>
        </div>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-num">1</div>
            <div className="landing-step-body">
              <div className="landing-step-title">Import your leads</div>
              <div className="landing-step-sub">
                Upload a CSV or Excel file with your contacts. Phone numbers are normalized and duplicates blocked automatically.
              </div>
            </div>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">2</div>
            <div className="landing-step-body">
              <div className="landing-step-title">Write your offer once</div>
              <div className="landing-step-sub">
                Describe your product, promotion, and campaign idea. AI generates a unique message per contact — no copy-paste blasts.
              </div>
            </div>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">3</div>
            <div className="landing-step-body">
              <div className="landing-step-title">Send safely</div>
              <div className="landing-step-sub">
                The queue sends messages with random delays and hourly caps so your WhatsApp account stays safe. Monitor progress in real time.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="landing-section">
        <div className="landing-section-head">
          <div className="landing-section-kicker">Features</div>
          <h2 className="landing-section-title">Everything you need for WhatsApp outreach</h2>
        </div>
        <div className="landing-features">
          <Card title="AI personalization" subtitle="OpenAI or Gemini">
            <div className="mkt-copy">
              Each contact receives a uniquely worded message. Choose GPT or Gemini as your AI engine.
            </div>
          </Card>
          <Card title="Smart queue" subtitle="Rate-limited sending">
            <div className="mkt-copy">
              Built-in hourly caps and random delays between messages protect your account from bans.
            </div>
          </Card>
          <Card title="Multi-auth" subtitle="Google, email, or phone">
            <div className="mkt-copy">
              Sign in with Google, email + password, or phone number with SMS verification code.
            </div>
          </Card>
          <Card title="Media support" subtitle="Images, video, PDF, voice">
            <div className="mkt-copy">
              Attach images, videos, PDFs, or record voice notes directly in the campaign builder.
            </div>
          </Card>
          <Card title="Stripe billing" subtitle="Free + Pro plans">
            <div className="mkt-copy">
              Start free with a monthly quota. Upgrade to Pro through Stripe for higher sending limits.
            </div>
          </Card>
          <Card title="Tenant isolation" subtitle="Your data, only yours">
            <div className="mkt-copy">
              Contacts, campaigns, and logs are scoped per user in PostgreSQL. Zero cross-account leakage.
            </div>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="landing-cta">
        <Card title="Ready to launch?" subtitle="Create your free account and send your first campaign today">
          <div className="landing-actions" style={{ marginTop: 8 }}>
            {user ? (
              <Button as={Link} to="/app" variant="primary">
                Open dashboard
              </Button>
            ) : (
              <>
                <Button as={Link} to="/register" variant="primary">
                  Get started free
                </Button>
                <Button as={Link} to="/pricing" variant="ghost">
                  See pricing
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
