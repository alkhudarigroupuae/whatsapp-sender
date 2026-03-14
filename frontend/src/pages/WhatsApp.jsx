import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { apiFetch } from '../lib/api.js'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { Badge } from '../components/Badge.jsx'

export function WhatsApp() {
  const [status, setStatus] = useState(null)
  const [qr, setQr] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const statusValue = status?.status || 'starting'
  const lastEvent = status?.lastEventAt ? new Date(status.lastEventAt).toLocaleString() : '—'

  const canShowQr = useMemo(() => statusValue === 'qr' && qr, [statusValue, qr])

  useEffect(() => {
    let cancelled = false
    async function tick() {
      try {
        const [s, q] = await Promise.all([apiFetch('/api/whatsapp/status'), apiFetch('/api/whatsapp/qr')])
        if (cancelled) return
        setStatus(s.status)
        setQr(q.qr || null)
        setError(null)
      } catch (e) {
        if (cancelled) return
        setError(e.message)
      }
    }

    tick()
    const id = setInterval(tick, 2500)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  async function onReconnect() {
    try {
      setBusy(true)
      setError(null)
      await apiFetch('/api/whatsapp/reconnect', { method: 'POST', body: {} })
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function onLogout() {
    try {
      setBusy(true)
      setError(null)
      await apiFetch('/api/whatsapp/logout', { method: 'POST', body: {} })
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <Card
        title="Connection"
        subtitle="Scan QR once, session is stored locally on the server"
        right={
          <div className="row">
            <Badge value={statusValue} />
            <Button onClick={onReconnect} variant="ghost" size="sm" disabled={busy}>
              Reconnect
            </Button>
            <Button onClick={onLogout} variant="danger" size="sm" disabled={busy}>
              Logout
            </Button>
          </div>
        }
      >
        <div className="grid-2">
          <div className="panel">
            <div className="panel-title">Status</div>
            <div className="panel-row">
              <div className="panel-k">Current</div>
              <div className="panel-v">
                <Badge value={statusValue} />
              </div>
            </div>
            <div className="panel-row">
              <div className="panel-k">Last event</div>
              <div className="panel-v">{lastEvent}</div>
            </div>
            {status?.lastError && (
              <div className="callout callout-danger">
                {status.lastError}
              </div>
            )}
            {error && <div className="callout callout-danger">{error}</div>}
          </div>

          <div className="panel">
            <div className="panel-title">QR code</div>
            {canShowQr ? (
              <div className="qr">
                <QRCodeSVG value={qr} size={240} bgColor="transparent" fgColor="rgba(255,255,255,0.92)" />
                <div className="muted">Open WhatsApp on your phone → Linked devices → Link a device.</div>
              </div>
            ) : (
              <div className="muted">
                QR appears when the server requests login. If you are already connected, you won’t see a QR.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

