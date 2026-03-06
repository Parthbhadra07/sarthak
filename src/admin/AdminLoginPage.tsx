import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { adminLogin } from '../lib/api'
import { setAdminToken } from '../lib/adminAuth'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const from = (location.state as { from?: string } | null)?.from || '/admin/products'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await adminLogin(password)
      setAdminToken(res.token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ padding: '28px 0' }}>
      <div className="card" style={{ padding: 14, maxWidth: 520, margin: '0 auto' }}>
        <h2 style={{ marginTop: 0 }}>Admin login</h2>
        <div className="muted" style={{ marginTop: -8 }}>
          Enter the admin password to manage products and orders.
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <input
            className="input"
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <div style={{ color: 'var(--bad)' }}>
              <strong>Login failed:</strong> {error}
            </div>
          )}
          <button className="btn btnPrimary" disabled={!password.trim() || loading} type="submit">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="muted" style={{ marginTop: 12, fontSize: 12 }}>
          This is protected by a server-side password + short-lived token.
        </div>
      </div>
    </div>
  )
}

