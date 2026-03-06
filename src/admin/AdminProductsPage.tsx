import React from 'react'
import type { Product } from '../types'
import { adminDeleteProduct, adminListCategories, adminListProducts, adminUpsertProduct, type Category } from '../lib/api'

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(n)
}

export function AdminProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const [editingId, setEditingId] = React.useState<string>('')
  const [category, setCategory] = React.useState('')
  const [name, setName] = React.useState('')
  const [unitPrice, setUnitPrice] = React.useState<number>(0)
  const [boxPrice, setBoxPrice] = React.useState<number>(0)
  const [taxPct, setTaxPct] = React.useState<number>(0)
  const [imageUrl, setImageUrl] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminListProducts()
      setProducts(data)
      setCategories(await adminListCategories())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const onAdd = async () => {
    setSaving(true)
    setError('')
    try {
      await adminUpsertProduct({
        id: editingId || undefined,
        category: category.trim() || undefined,
        name: name.trim(),
        unitPrice: Number(unitPrice) || undefined,
        boxPrice: Number(boxPrice) || undefined,
        taxPct: Number(taxPct) || 0,
        imageUrl: imageUrl.trim() || undefined,
        description: description.trim() || undefined,
        active: true,
      })
      onResetForm()
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const onResetForm = () => {
    setEditingId('')
    setCategory('')
    setName('')
    setUnitPrice(0)
    setBoxPrice(0)
    setTaxPct(0)
    setImageUrl('')
    setDescription('')
  }

  const onEdit = (p: Product) => {
    setEditingId(p.id)
    setCategory(p.category || '')
    setName(p.name)
    setUnitPrice(p.unitPrice || 0)
    setBoxPrice(p.boxPrice || 0)
    setTaxPct(p.taxPct || 0)
    setImageUrl(p.imageUrl || '')
    setDescription(p.description || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    setError('')
    try {
      await adminDeleteProduct(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete product')
    }
  }

  const priceWithTax = (price: number) => price + (price * (taxPct || 0)) / 100

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div>
        <h2 style={{ margin: 0 }}>Products</h2>
        <div className="muted">Add products shown in the public catalog.</div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <strong>{editingId ? 'Edit product' : 'Add product'}</strong>
          {editingId && (
            <button className="btn" onClick={onResetForm}>
              Cancel edit
            </button>
          )}
        </div>
        <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category (optional)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <input
              className="input"
              type="number"
              min={0}
              placeholder="Unit price (without tax), e.g. 50"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
            />
            <input
              className="input"
              type="number"
              min={0}
              placeholder="Box price (without tax), e.g. 500"
              value={boxPrice}
              onChange={(e) => setBoxPrice(Number(e.target.value))}
            />
            <input
              className="input"
              type="number"
              min={0}
              placeholder="Tax %, e.g. 5"
              value={taxPct}
              onChange={(e) => setTaxPct(Number(e.target.value))}
            />
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            Price with tax: {unitPrice > 0 ? `Unit ${formatMoney(priceWithTax(unitPrice))}` : ''}{' '}
            {boxPrice > 0 ? `Box ${formatMoney(priceWithTax(boxPrice))}` : ''}
          </div>
          <input
            className="input"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <textarea
            className="input"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <button
            className="btn btnPrimary"
            disabled={saving || !name.trim() || (!(Number(unitPrice) > 0) && !(Number(boxPrice) > 0))}
            onClick={onAdd}
          >
            {saving ? 'Saving…' : editingId ? 'Update product' : 'Add product'}
          </button>
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

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <strong>All products</strong>
          <span className="muted" style={{ fontSize: 13 }}>
            {products.length} total
          </span>
        </div>
        {loading ? (
          <div className="muted" style={{ marginTop: 10 }}>
            Loading…
          </div>
        ) : products.length === 0 ? (
          <div className="muted" style={{ marginTop: 10 }}>
            No products yet.
          </div>
        ) : (
          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 10,
                  background: 'rgba(255,255,255,0.04)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <strong>{p.name}</strong>
                    <span style={{ color: 'var(--good)' }}>
                      {p.unitPrice ? `Unit ${formatMoney(p.unitPrice)}` : ''}{' '}
                      {p.boxPrice ? `Box ${formatMoney(p.boxPrice)}` : ''}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                    {(p.category || 'Uncategorized')}{' '}
                    • Tax {p.taxPct}% • {p.active ? 'Active' : 'Inactive'} • Updated{' '}
                    {new Date(p.updatedAt).toLocaleString()}
                  </div>
                  {p.description && (
                    <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                      {p.description}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <button className="btn" onClick={() => onEdit(p)}>
                    Edit
                  </button>
                  <button className="btn" onClick={() => onDelete(p.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

