import React from 'react'
import type { Order, OrderStatus } from '../types'
import { adminListOrders, adminUpdateOrderStatus } from '../lib/api'

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(n)
}

const STATUSES: OrderStatus[] = ['new', 'confirmed', 'packed', 'delivered', 'cancelled']

export function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const load = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminListOrders()
      setOrders(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const onUpdateStatus = async (id: string, status: OrderStatus) => {
    setError('')
    try {
      await adminUpdateOrderStatus(id, status)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update order')
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div>
        <h2 style={{ margin: 0 }}>Orders</h2>
        <div className="muted">View and manage orders.</div>
      </div>

      {error && (
        <div className="card" style={{ padding: 12, borderColor: 'rgba(251,113,133,0.5)' }}>
          <strong>Error</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            {error}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <strong>All orders</strong>
          <button className="btn" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="muted" style={{ marginTop: 10 }}>
            Loading…
          </div>
        ) : orders.length === 0 ? (
          <div className="muted" style={{ marginTop: 10 }}>
            No orders yet.
          </div>
        ) : (
          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {orders.map((o) => (
              <div
                key={o.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 10,
                  background: 'rgba(255,255,255,0.04)',
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong>{o.id}</strong>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {new Date(o.createdAt).toLocaleString()} • {o.customer.name} • {o.customer.phone}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="muted">Total</span>
                    <strong style={{ color: 'var(--good)' }}>{formatMoney(o.totals.total)}</strong>
                    <select
                      className="input"
                      value={o.status}
                      onChange={(e) => onUpdateStatus(o.id, e.target.value as OrderStatus)}
                      style={{ width: 170 }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 6 }}>
                  {o.items.map((i) => (
                    <div key={`${i.productId}:${i.variant}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <strong>{i.name}</strong>{' '}
                        <span className="muted" style={{ fontSize: 12 }}>
                          ({i.variant.toUpperCase()} • {i.qty} × {formatMoney(i.unitPrice)} • Tax {i.taxPct}%)
                        </span>
                      </div>
                      <div className="muted">
                        {formatMoney(i.qty * i.unitPrice + (i.qty * i.unitPrice * (i.taxPct || 0)) / 100)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

