import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../state/cart'
import { createOrder } from '../lib/api'

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(n)
}

export function CartPage() {
  const cart = useCart()
  const navigate = useNavigate()
  const [customerName, setCustomerName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')

  const discount = 0
  const tax = cart.tax
  const total = cart.total - discount

  const canSubmit = cart.items.length > 0 && customerName.trim() && phone.trim()

  const onCheckout = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await createOrder({
        items: cart.items,
        totals: { subtotal: cart.subtotal, discount, tax, total },
        customer: { name: customerName.trim(), phone: phone.trim(), address: address.trim() || undefined },
      })
      cart.clear()
      navigate(`/receipt/${res.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div>
        <h2 style={{ margin: 0 }}>Cart</h2>
        <div className="muted">Review quantities and place your order.</div>
      </div>

      {cart.items.length === 0 ? (
        <div className="card" style={{ padding: 14 }}>
          <strong>Your cart is empty</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            Go back to the <Link to="/catalog">catalog</Link> to add items.
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong>Items</strong>
              <span className="muted" style={{ fontSize: 13 }}>
                {cart.items.length} line(s)
              </span>
            </div>

            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              {cart.items.map((i) => (
                <div
                  key={`${i.productId}:${i.variant}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 10,
                    padding: 10,
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong>{i.name}</strong>
                      <span className="muted">{formatMoney(i.unitPrice)}</span>
                    </div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                      {i.variant.toUpperCase()} • Tax {i.taxPct}% • Line total:{' '}
                      {formatMoney(i.unitPrice * i.qty + (i.unitPrice * i.qty * (i.taxPct || 0)) / 100)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <input
                      className="input"
                      type="number"
                      min={0}
                      value={i.qty}
                      onChange={(e) => cart.setQty(i.productId, i.variant, Number(e.target.value))}
                      style={{ width: 110 }}
                    />
                    <button className="btn" onClick={() => cart.remove(i.productId, i.variant)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid" style={{ gap: 14 }}>
            <div className="card" style={{ padding: 12 }}>
              <strong>Summary</strong>
              <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Subtotal</span>
                  <span>{formatMoney(cart.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Tax</span>
                  <span>{formatMoney(tax)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Discount</span>
                  <span>{formatMoney(discount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <strong>Total</strong>
                  <strong style={{ color: 'var(--good)' }}>{formatMoney(total)}</strong>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 12 }}>
              <strong>Customer details</strong>
              <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                <input
                  className="input"
                  placeholder="Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Phone (WhatsApp number)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <textarea
                  className="input"
                  placeholder="Address (optional)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                />
                {error && (
                  <div style={{ color: 'var(--bad)' }}>
                    <strong>Checkout failed:</strong> {error}
                  </div>
                )}
                <button
                  className="btn btnPrimary"
                  disabled={!canSubmit || submitting}
                  onClick={onCheckout}
                >
                  {submitting ? 'Placing order…' : 'Place order'}
                </button>
                <div className="muted" style={{ fontSize: 12 }}>
                  After placing the order, you’ll get a receipt and we’ll send details on WhatsApp.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

