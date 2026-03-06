import type { Order, Product } from '../types'
import { getAdminToken } from './adminAuth'

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`/.netlify/functions${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return await res.json()
  return await res.text()
}

function adminHeaders() {
  const token = getAdminToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export async function listProducts(): Promise<Product[]> {
  return await apiFetch('/products')
}

export async function adminListProducts(): Promise<Product[]> {
  return await apiFetch('/admin-products', { headers: adminHeaders() })
}

export async function adminUpsertProduct(product: Partial<Product> & Pick<Product, 'name' | 'price'>) {
  return await apiFetch('/admin-products', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(product),
  })
}

export async function adminDeleteProduct(id: string) {
  return await apiFetch(`/admin-products?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  })
}

export async function createOrder(payload: Omit<Order, 'id' | 'createdAt' | 'status'> & { customer: Order['customer'] }) {
  return await apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getOrder(orderId: string): Promise<Order> {
  return await apiFetch(`/orders?id=${encodeURIComponent(orderId)}`)
}

export async function adminListOrders(): Promise<Order[]> {
  return await apiFetch('/admin-orders', { headers: adminHeaders() })
}

export async function adminUpdateOrderStatus(orderId: string, status: Order['status']) {
  return await apiFetch('/admin-orders', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ id: orderId, status }),
  })
}

export async function adminLogin(password: string): Promise<{ token: string }> {
  return await apiFetch('/admin-auth', { method: 'POST', body: JSON.stringify({ password }) })
}

