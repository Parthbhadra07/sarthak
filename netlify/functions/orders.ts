import type { Handler } from '@netlify/functions'
import { badRequest, json, notFound, ok, serverError, parseJsonBody } from './lib/http'
import { newId } from './lib/ids'
import { sendOrderNotificationToBusiness, sendReceiptToCustomer } from './lib/whatsapp'
import { supabaseAdmin } from './lib/supabase'
import { errorMessage } from './lib/errors'

type CartItem = {
  productId: string
  variant: 'unit' | 'box'
  name: string
  unitPrice: number
  taxPct: number
  qty: number
}
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

type OrderCreateBody = {
  items: CartItem[]
  totals: OrderTotals
  customer: { name: string; phone: string; address?: string }
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
}

function lineTax(i: CartItem) {
  const base = i.unitPrice * i.qty
  return (base * (i.taxPct || 0)) / 100
}

function lineTotal(i: CartItem) {
  return i.unitPrice * i.qty + lineTax(i)
}

function formatOrderMessage(order: Order, receiptUrl?: string) {
  const lines = [
    `New order: ${order.id}`,
    `Customer: ${order.customer.name} (${order.customer.phone})`,
    order.customer.address ? `Address: ${order.customer.address}` : null,
    '',
    'Items:',
    ...order.items.map(
      (i) =>
        `- ${i.name} (${i.variant.toUpperCase()}) — ${i.qty} × ${fmtMoney(i.unitPrice)} + Tax ${i.taxPct}% = ${fmtMoney(lineTotal(i))}`,
    ),
    '',
    `Subtotal: ${fmtMoney(order.totals.subtotal)}`,
    `Tax: ${fmtMoney(order.totals.tax)}`,
    `Total: ${fmtMoney(order.totals.total)}`,
    receiptUrl ? `Receipt: ${receiptUrl}` : null,
  ].filter(Boolean) as string[]
  return lines.join('\n')
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {})

  try {
    if (event.httpMethod === 'GET') {
      const id = event.queryStringParameters?.id
      if (!id) return badRequest('Missing id')
      const sb = supabaseAdmin()
      const { data, error } = await sb
        .from('orders')
        .select('id,items,totals,customer,status,created_at')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      if (!data) return notFound('Order not found')

      const row = data as unknown as DbOrder
      const order: Order = {
        id: String(row.id),
        items: row.items,
        totals: row.totals,
        customer: row.customer,
        status: String(row.status) as OrderStatus,
        createdAt: new Date(row.created_at).toISOString(),
      }
      return ok(order)
    }

    if (event.httpMethod === 'POST') {
      const body = parseJsonBody<OrderCreateBody>(event)
      if (!body?.items?.length) return badRequest('Missing items')
      if (!body.customer?.name || !body.customer?.phone) return badRequest('Missing customer')
      if (!body.totals) return badRequest('Missing totals')

      const now = new Date().toISOString()
      const order: Order = {
        id: newId('ord'),
        items: body.items.map((i) => ({
          productId: String(i.productId),
          name: String(i.name),
          price: Number(i.price),
          qty: Number(i.qty),
        })),
        totals: {
          subtotal: Number(body.totals.subtotal),
          discount: Number(body.totals.discount || 0),
          tax: Number(body.totals.tax || 0),
          total: Number(body.totals.total),
        },
        customer: {
          name: String(body.customer.name),
          phone: String(body.customer.phone),
          address: body.customer.address ? String(body.customer.address) : undefined,
        },
        status: 'new',
        createdAt: now,
      }

      const sb = supabaseAdmin()
      const { error } = await sb.from('orders').insert({
        id: order.id,
        items: order.items,
        totals: order.totals,
        customer: order.customer,
        status: order.status,
        created_at: order.createdAt,
      })
      if (error) throw error

      const siteUrl =
        process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL || ''
      const receiptUrl = siteUrl ? `${siteUrl}/receipt/${order.id}` : undefined

      // WhatsApp integration: best-effort. If env isn't set, we still place the order.
      try {
        await sendOrderNotificationToBusiness(formatOrderMessage(order, receiptUrl))
      } catch {
        // ignore
      }

      try {
        // Template variables order is up to your template. Default: name, orderId, total, receiptUrl
        await sendReceiptToCustomer({
          to: order.customer.phone,
          variables: [
            order.customer.name,
            order.id,
            fmtMoney(order.totals.total),
            receiptUrl || '',
          ],
        })
      } catch {
        // ignore
      }

      return ok({ id: order.id })
    }

    return badRequest('Unsupported method')
  } catch (e) {
    return serverError(errorMessage(e))
  }
}

