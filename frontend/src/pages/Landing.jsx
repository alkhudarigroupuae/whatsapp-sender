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
          <h1 className="landing-title">AI-personalized messages that don’t look automated</h1>
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
            <Button as={Link} to="/about" variant="ghost">
              About
            </Button>
            <Button as={Link} to="/contact" variant="ghost">
              Contact
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
    </div>
  )
}
