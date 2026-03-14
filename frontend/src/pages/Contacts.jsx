import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api.js'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'

function formatPhone(phone) {
  const s = String(phone || '')
  if (s.length <= 6) return s
  return `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6)}`
}

export function Contacts() {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const [contacts, setContacts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)

  const limit = 50
  const skip = page * limit

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await apiFetch(`/api/contacts?limit=${limit}&skip=${skip}`)
        if (cancelled) return
        setContacts(res.items || [])
        setTotal(res.total || 0)
      } catch (e) {
        if (cancelled) return
        setError(e.message)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [skip])

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total])

  async function onImport() {
    if (!file) return
    try {
      setBusy(true)
      setError(null)
      const form = new FormData()
      form.append('file', file)
      const res = await apiFetch('/api/contacts/import', { method: 'POST', body: form })
      setResult(res)
      const refreshed = await apiFetch(`/api/contacts?limit=${limit}&skip=${skip}`)
      setContacts(refreshed.items || [])
      setTotal(refreshed.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <Card
        title="Import leads"
        subtitle="Upload CSV or Excel with columns: name, phone, company, notes"
        right={
          <Button onClick={onImport} disabled={!file || busy} variant="primary" size="sm">
            {busy ? 'Importing…' : 'Import'}
          </Button>
        }
      >
        <div className="form-row">
          <input
            className="file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="muted">
            Phones should include country code. Digits only recommended.
          </div>
        </div>
        {result && (
          <div className="callout">
            Imported {result.imported} new, updated {result.updated}, total processed {result.total}.
          </div>
        )}
        {error && <div className="callout callout-danger">{error}</div>}
      </Card>

      <Card
        title="Leads"
        subtitle={`${total} total`}
        right={
          <div className="pager">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0}
            >
              Prev
            </Button>
            <div className="pager-meta">
              Page {page + 1} / {pageCount}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page + 1 >= pageCount}
            >
              Next
            </Button>
          </div>
        }
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c._id}>
                  <td className="cell-strong">{c.name || '—'}</td>
                  <td className="mono">{formatPhone(c.phone)}</td>
                  <td>{c.company || '—'}</td>
                  <td className="cell-muted">{c.notes || '—'}</td>
                </tr>
              ))}
              {!contacts.length && (
                <tr>
                  <td colSpan={4} className="cell-muted">
                    No contacts. Import a CSV/Excel to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
