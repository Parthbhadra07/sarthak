import React from 'react'
import { adminDeleteCategory, adminListCategories, adminUpsertCategory, type Category } from '../lib/api'

export function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [name, setName] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setCategories(await adminListCategories())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories')
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
      await adminUpsertCategory(name.trim())
      setName('')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    setError('')
    try {
      await adminDeleteCategory(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete category')
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div>
        <h2 style={{ margin: 0 }}>Categories</h2>
        <div className="muted">Create categories you can assign to products.</div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <strong>Add category</strong>
        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="input"
            placeholder="Example: Grocery"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: '1 1 260px' }}
          />
          <button className="btn btnPrimary" disabled={!name.trim() || saving} onClick={onAdd}>
            {saving ? 'Saving…' : 'Add'}
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
          <strong>All categories</strong>
          <button className="btn" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="muted" style={{ marginTop: 10 }}>
            Loading…
          </div>
        ) : categories.length === 0 ? (
          <div className="muted" style={{ marginTop: 10 }}>
            No categories yet.
          </div>
        ) : (
          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {categories.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  padding: 10,
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                <div>
                  <strong>{c.name}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                </div>
                <button className="btn" onClick={() => onDelete(c.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

