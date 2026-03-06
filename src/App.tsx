import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { CartProvider } from './state/cart'
import { AppLayout } from './components/AppLayout'
import { CatalogPage } from './pages/CatalogPage'
import { CartPage } from './pages/CartPage'
import { OrdersPage } from './pages/OrdersPage'
import { ReceiptPage } from './pages/ReceiptPage'
import { AdminLoginPage } from './admin/AdminLoginPage'
import { AdminProductsPage } from './admin/AdminProductsPage'
import { AdminOrdersPage } from './admin/AdminOrdersPage'
import { RequireAdmin } from './admin/RequireAdmin'

function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

export default function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/catalog" replace />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/receipt/:orderId" element={<ReceiptPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AppLayout admin />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/catalog" replace />} />
      </Routes>
    </CartProvider>
  )
}
