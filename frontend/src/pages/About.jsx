import { Card } from '../components/Card.jsx'

export function About() {
  return (
    <div className="mkt-page">
      <div className="mkt-hero">
        <div className="mkt-hero-kicker">About</div>
        <h1 className="mkt-hero-title">Built for outreach that doesn’t get you blocked.</h1>
        <div className="mkt-hero-sub">
          Sender Studio is a WhatsApp campaign tool designed around real-world deliverability: pacing, uniqueness, and visibility. It’s not a
          “blast everyone” toy.
        </div>
      </div>

      <div className="mkt-grid">
        <Card title="Human-first sending" subtitle="Queue + random delay + hourly caps">
          <div className="mkt-copy">
            Campaigns go through a job queue so sending is controlled. You can scale up safely without turning your account into a spam machine.
          </div>
        </Card>
        <Card title="AI rewrite per contact" subtitle="Avoid identical templates">
          <div className="mkt-copy">
            Use AI to vary wording and keep messages natural. Provider is configurable (OpenAI or Gemini).
          </div>
        </Card>
        <Card title="Tenant-safe data" subtitle="Each customer isolated">
          <div className="mkt-copy">
            Accounts, contacts, campaigns, logs, and jobs are scoped per user in PostgreSQL. No cross-client leakage.
          </div>
        </Card>
        <Card title="Subscription upgrades" subtitle="Limits enforced by plan">
          <div className="mkt-copy">
            Stripe handles subscriptions and the backend enforces monthly quotas while sending.
          </div>
        </Card>
      </div>
    </div>
  )
}
