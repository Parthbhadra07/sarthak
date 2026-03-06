import React from 'react'
import type { Product } from '../types'
import { listProducts } from '../lib/api'
import { useCart } from '../state/cart'

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(n)
}

function ProductCard({ p, onAdd }: { p: Product; onAdd: () => void }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div
        style={{
          height: 140,
          borderBottom: '1px solid var(--border)',
          background: p.imageUrl
            ? `center/cover no-repeat url(${p.imageUrl})`
            : 'linear-gradient(135deg, rgba(124,92,255,0.35), rgba(45,212,191,0.12))',
        }}
      />
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.name}
          </strong>
          <span style={{ color: 'var(--good)' }}>{formatMoney(p.price)}</span>
        </div>
        {p.description && (
          <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
            {p.description}
          </div>
        )}
        <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
          <button className="btn btnPrimary" onClick={onAdd} style={{ flex: 1 }}>
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
        {products.map((p) => (
          <ProductCard key={p.id} p={p} onAdd={() => cart.add(p, 1)} />
        ))}
      </div>
    </div>
  )
}

