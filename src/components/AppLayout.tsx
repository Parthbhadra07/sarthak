import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useCart } from '../state/cart'
import { getAdminToken, clearAdminToken } from '../lib/adminAuth'

function TabLink({
  to,
  label,
  badge,
}: {
  to: string
  label: string
  badge?: string | number
}) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: '10px 12px',
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
        display: 'inline-flex',
        gap: 8,
        alignItems: 'center',
      })}
    >
      <span>{label}</span>
      {badge !== undefined && (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 999,
            border: '1px solid var(--border)',
            background: 'rgba(0,0,0,0.2)',
            fontSize: 12,
          }}
        >
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export function AppLayout({ admin = false }: { admin?: boolean }) {
  const cart = useCart()
  const navigate = useNavigate()
  const isAdmin = admin || Boolean(getAdminToken())

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div
          style={{
            borderBottom: '1px solid var(--border)',
            background: 'rgba(11,18,32,0.75)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 0',
              gap: 12,
            }}
          >
            <Link to={isAdmin ? '/admin/products' : '/catalog'}>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <strong style={{ letterSpacing: 0.2 }}>SSTR Traders</strong>
                <span className="muted" style={{ fontSize: 12 }}>
                  {isAdmin ? 'Admin' : 'Catalog'}
                </span>
              </div>
            </Link>

            <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {!isAdmin && (
                <>
                  <TabLink to="/catalog" label="Catalog" />
                  <TabLink to="/cart" label="Cart" badge={cart.count} />
                  <TabLink to="/orders" label="Orders" />
                </>
              )}
              {isAdmin && (
                <>
                  <TabLink to="/admin/products" label="Products" />
                  <TabLink to="/admin/categories" label="Categories" />
                  <TabLink to="/admin/orders" label="Orders" />
                  <button
                    className="btn"
                    onClick={() => {
                      clearAdminToken()
                      navigate('/admin/login')
                    }}
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, padding: '18px 0 40px' }}>
        <Outlet />
      </main>

      <footer style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: '18px 0', color: 'var(--muted)' }}>
          <small>
            Powered by Netlify Functions + WhatsApp.{' '}
            {!isAdmin && (
              <Link to="/admin/login" style={{ textDecoration: 'underline' }}>
                Admin
              </Link>
            )}
          </small>
        </div>
      </footer>
    </div>
  )
}

