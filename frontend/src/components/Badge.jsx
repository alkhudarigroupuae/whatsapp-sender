const MAP = {
  ready: { label: 'Ready', tone: 'ok' },
  qr: { label: 'Scan QR', tone: 'warn' },
  authenticated: { label: 'Authenticated', tone: 'ok' },
  disconnected: { label: 'Disconnected', tone: 'danger' },
  auth_failure: { label: 'Auth Failure', tone: 'danger' },
  error: { label: 'Error', tone: 'danger' },
  queued: { label: 'Queued', tone: 'warn' },
  retrying: { label: 'Retrying', tone: 'warn' },
  sent: { label: 'Sent', tone: 'ok' },
  failed: { label: 'Failed', tone: 'danger' },
  draft: { label: 'Draft', tone: 'muted' },
  sending: { label: 'Sending', tone: 'warn' },
  done: { label: 'Done', tone: 'ok' },
}

export function Badge({ value }) {
  const meta = MAP[value] || { label: String(value || ''), tone: 'muted' }
  return <span className={`badge badge-${meta.tone}`}>{meta.label}</span>
}

