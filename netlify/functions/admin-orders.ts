import type { Handler } from '@netlify/functions'
import { verifyAdminTokenFromEvent } from './lib/auth'
import { badRequest, json, ok, serverError, unauthorized } from './lib/http'
import { supabaseAdmin } from './lib/supabase'

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

type DbOrder = {
  id: string
  items: CartItem[]
  totals: OrderTotals
  customer: Order['customer']
  status: string
  created_at: string
}

const STATUSES: OrderStatus[] = ['new', 'confirmed', 'packed', 'delivered', 'cancelled']

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {})
  if (!verifyAdminTokenFromEvent(event)) return unauthorized()

  try {
    if (event.httpMethod === 'GET') {
      const sb = supabaseAdmin()
      const { data, error } = await sb
        .from('orders')
        .select('id,items,totals,customer,status,created_at')
        .order('created_at', { ascending: false })
      if (error) throw error

      const orders: Order[] = ((data || []) as DbOrder[]).map((o) => ({
        id: String(o.id),
        items: o.items,
        totals: o.totals,
        customer: o.customer,
        status: String(o.status) as OrderStatus,
        createdAt: new Date(o.created_at).toISOString(),
      }))

      return ok(orders)
    }

    if (event.httpMethod === 'PUT') {
      const body = event.body ? (JSON.parse(event.body) as { id?: string; status?: OrderStatus }) : null
      if (!body?.id || !body.status) return badRequest('Missing id/status')
      if (!STATUSES.includes(body.status)) return badRequest('Invalid status')

      const sb = supabaseAdmin()
      const { error } = await sb.from('orders').update({ status: body.status }).eq('id', body.id)
      if (error) throw error
      return ok({ ok: true })
    }

    return badRequest('Unsupported method')
  } catch (e) {
    return serverError(e instanceof Error ? e.message : 'Failed')
  }
}

