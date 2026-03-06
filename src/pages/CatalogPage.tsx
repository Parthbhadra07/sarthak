import React from 'react'
import type { Product } from '../types'
import { listProducts } from '../lib/api'
import { useCart } from '../state/cart'

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(n)
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="btn"
      onClick={onClick}
      style={{
        background: active ? 'rgba(255,255,255,0.12)' : undefined,
        borderColor: active ? 'rgba(255,255,255,0.28)' : undefined,
      }}
    >
      {label}
    </button>
  )
}

function priceWithTax(price: number, taxPct: number) {
  return price + (price * (taxPct || 0)) / 100
}

function ProductCard({
  p,
  onAdd,
}: {
  p: Product
  onAdd: (variant: 'unit' | 'box') => void
}) {
  const [variant, setVariant] = React.useState<'unit' | 'box'>(
    p.unitPrice !== undefined ? 'unit' : 'box',
  )
  const unitPrice = variant === 'unit' ? p.unitPrice : p.boxPrice
  const canBuy = typeof unitPrice === 'number' && unitPrice > 0

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ height: 140, borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(135deg, rgba(124,92,255,0.35), rgba(45,212,191,0.12))',
            }}
          />
        )}
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.name}
          </strong>
          <span style={{ color: 'var(--good)' }}>
            {canBuy ? formatMoney(priceWithTax(unitPrice!, p.taxPct)) : '—'}
          </span>
        </div>
        <div className="muted" style={{ marginTop: 4, fontSize: 12 }}>
          {p.category ? `Category: ${p.category}` : ' '}
        </div>
        {p.description && (
          <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
            {p.description}
          </div>
        )}
        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {p.unitPrice !== undefined && (
            <button className="btn" onClick={() => setVariant('unit')} style={{ opacity: variant === 'unit' ? 1 : 0.75 }}>
              Unit {formatMoney(priceWithTax(p.unitPrice, p.taxPct))}
            </button>
          )}
          {p.boxPrice !== undefined && (
            <button className="btn" onClick={() => setVariant('box')} style={{ opacity: variant === 'box' ? 1 : 0.75 }}>
              Box {formatMoney(priceWithTax(p.boxPrice, p.taxPct))}
            </button>
          )}
          <span className="muted" style={{ alignSelf: 'center', fontSize: 12 }}>
            Tax: {p.taxPct}%
          </span>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
          <button className="btn btnPrimary" onClick={() => onAdd(variant)} style={{ flex: 1 }} disabled={!canBuy}>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  )
}

export function CatalogPage() {
  const cart = useCart()
  const [loading, setLoading] = React.useState(true)
  const [products, setProducts] = React.useState<Product[]>([])
  const [error, setError] = React.useState<string>('')
  const [category, setCategory] = React.useState<string>('All')

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const data = await listProducts()
        if (mounted) setProducts(data.filter((p) => p.active))
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load products')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div>
        <h2 style={{ margin: 0 }}>Catalog</h2>
        <div className="muted">Browse products and add them to your cart.</div>
      </div>

      {!loading && !error && products.length > 0 && (
        <div className="card" style={{ padding: 12 }}>
          <strong>Categories</strong>
          <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(() => {
              const cats = Array.from(
                new Set(products.map((p) => p.category).filter(Boolean) as string[]),
              ).sort((a, b) => a.localeCompare(b))
              const all = ['All', ...cats]
              return all.map((c) => (
                <TabButton key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
              ))
            })()}
          </div>
        </div>
      )}

      {loading && <div className="muted">Loading products…</div>}
      {error && (
        <div className="card" style={{ padding: 12, borderColor: 'rgba(251,113,133,0.5)' }}>
          <strong>Could not load products</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            {error}
          </div>
          <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
            If this is your first run, login to Admin and add products.
          </div>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="card" style={{ padding: 14 }}>
          <strong>No products yet</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            Admin can add products from the Admin page.
          </div>
        </div>
      )}

      <div className="grid gridProducts">
        {products
          .filter((p) => category === 'All' || (p.category || '') === category)
          .map((p) => (
            <ProductCard key={p.id} p={p} onAdd={(variant) => cart.add(p, variant, 1)} />
          ))}
      </div>
    </div>
  )
}

