import type { Handler } from '@netlify/functions'
import { getJson, setJson } from './lib/blobs'
import { verifyAdminTokenFromEvent } from './lib/auth'
import { badRequest, json, ok, serverError, unauthorized } from './lib/http'

type CartItem = { productId: string; name: string; price: number; qty: number }
type OrderTotals = { subtotal: number; discount: number; tax: number; total: number }
type OrderStatus = 'new' | 'confirmed' | 'packed' | 'delivered' | 'cancelled'

type Order = {
  id: string
  items: CartItem[]
  totals: OrderTotals
  customer: { name: string; phone: string; address?: string }
  status: OrderStatus
  createdAt: string
}

const ORDERS_KEY = 'orders.json'
const STATUSES: OrderStatus[] = ['new', 'confirmed', 'packed', 'delivered', 'cancelled']

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {})
  if (!verifyAdminTokenFromEvent(event)) return unauthorized()

  try {
    if (event.httpMethod === 'GET') {
      const orders = await getJson<Order[]>(ORDERS_KEY, [])
      return ok(orders)
    }

    if (event.httpMethod === 'PUT') {
      const body = event.body ? (JSON.parse(event.body) as { id?: string; status?: OrderStatus }) : null
      if (!body?.id || !body.status) return badRequest('Missing id/status')
      if (!STATUSES.includes(body.status)) return badRequest('Invalid status')

      const orders = await getJson<Order[]>(ORDERS_KEY, [])
      const updated = orders.map((o) => (o.id === body.id ? { ...o, status: body.status } : o))
      await setJson(ORDERS_KEY, updated)
      return ok({ ok: true })
    }

    return badRequest('Unsupported method')
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed'
    return serverError(
      msg.includes('not been configured to use Netlify Blobs')
        ? 'Netlify Blobs not configured for this deploy. Ensure Functions v2/Blobs are enabled for the site.'
        : msg,
    )
  }
}

