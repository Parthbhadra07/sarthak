import React from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Order } from '../types'
import { getOrder } from '../lib/api'

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(n)
}

export function ReceiptPage() {
  const { orderId = '' } = useParams()
  const [order, setOrder] = React.useState<Order | null>(null)
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getOrder(orderId)
        if (mounted) setOrder(data)
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load receipt')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [orderId])

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div>
        <h2 style={{ margin: 0 }}>Receipt</h2>
        <div className="muted">Order ID: {orderId}</div>
      </div>

      {loading && <div className="muted">Loading receipt…</div>}
      {error && (
        <div className="card" style={{ padding: 12, borderColor: 'rgba(251,113,133,0.5)' }}>
          <strong>Could not load receipt</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            {error}
          </div>
          <div style={{ marginTop: 10 }}>
            <Link className="btn" to="/orders">
              Back to Orders
            </Link>
          </div>
        </div>
      )}

      {order && (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <strong>SSTR Traders</strong>
              <div className="muted" style={{ fontSize: 13 }}>
                Status: {order.status}
              </div>
              <div className="muted" style={{ fontSize: 13 }}>
                Date: {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" onClick={() => window.print()}>
                Print / Save PDF
              </button>
              <Link className="btn btnPrimary" to="/catalog">
                Continue shopping
              </Link>
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <strong>Customer</strong>
              <div className="muted" style={{ fontSize: 13 }}>
                {order.customer.name} — {order.customer.phone}
              </div>
              {order.customer.address && (
                <div className="muted" style={{ fontSize: 13 }}>
                  {order.customer.address}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <strong>Items</strong>
              <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                {order.items.map((i) => (
                  <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <strong>{i.name}</strong>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {i.qty} × {formatMoney(i.price)}
                      </div>
                    </div>
                    <div>{formatMoney(i.price * i.qty)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <div style={{ display: 'grid', gap: 6, maxWidth: 420, marginLeft: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Subtotal</span>
                  <span>{formatMoney(order.totals.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Tax</span>
                  <span>{formatMoney(order.totals.tax)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Discount</span>
                  <span>{formatMoney(order.totals.discount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <strong>Total</strong>
                  <strong style={{ color: 'var(--good)' }}>{formatMoney(order.totals.total)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

