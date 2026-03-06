import React from 'react'
import { Link } from 'react-router-dom'

export function OrdersPage() {
  const [orderId, setOrderId] = React.useState('')

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div>
        <h2 style={{ margin: 0 }}>Orders</h2>
        <div className="muted">
          Enter your order id to view the receipt again.
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <strong>Find your receipt</strong>
        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="input"
            placeholder="Order ID (example: ord_...)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            style={{ flex: '1 1 260px' }}
          />
          <Link
            className="btn btnPrimary"
            to={orderId.trim() ? `/receipt/${encodeURIComponent(orderId.trim())}` : '#'}
            onClick={(e) => {
              if (!orderId.trim()) e.preventDefault()
            }}
          >
            View receipt
          </Link>
        </div>
        <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          Tip: Save your order id after checkout.
        </div>
      </div>
    </div>
  )
}

