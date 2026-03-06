import React from 'react'
import { Link } from 'react-router-dom'
import { searchOrdersByPhone, type OrderLookup } from '../lib/api'

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(n)
}

export function OrdersPage() {
  const [phone, setPhone] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [results, setResults] = React.useState<OrderLookup[]>([])

  const onSearch = async () => {
    setLoading(true)
    setError('')
    try {
      const normalized = phone.trim()
      if (!normalized) {
        setResults([])
        setError('Enter your phone number')
        return
      }
      const data = await searchOrdersByPhone(normalized)
      setResults(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to search orders')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div>
        <h2 style={{ margin: 0 }}>Orders</h2>
        <div className="muted">
          Search your orders using your phone number (WhatsApp number).
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <strong>Find your receipts</strong>
        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="input"
            placeholder="Phone number (example: 919999999999)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ flex: '1 1 260px' }}
          />
          <button className="btn btnPrimary" onClick={onSearch} disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
        <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          Tip: Use the same number you entered at checkout.
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: 12, borderColor: 'rgba(251,113,133,0.5)' }}>
          <strong>Error</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            {error}
          </div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="card" style={{ padding: 12 }}>
          <strong>Results</strong>
          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {results.map((o) => (
              <div
                key={o.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 10,
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <strong>{o.id}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {new Date(o.createdAt).toLocaleString()} • Status: {o.status}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className="muted">Total</span>
                  <strong style={{ color: 'var(--good)' }}>{formatMoney(o.totals.total)}</strong>
                  <Link className="btn btnPrimary" to={`/receipt/${encodeURIComponent(o.id)}`}>
                    Open receipt
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && phone.trim() && results.length === 0 && !error && (
        <div className="card" style={{ padding: 12 }}>
          <strong>No orders found</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            Check the phone number and try again.
          </div>
        </div>
      )}
    </div>
  )
}

