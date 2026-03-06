import type { Handler } from '@netlify/functions'
import { getJson, setJson } from './lib/blobs'
import { verifyAdminTokenFromEvent } from './lib/auth'
import { badRequest, json, ok, serverError, unauthorized } from './lib/http'
import { newId } from './lib/ids'

type Product = {
  id: string
  name: string
  price: number
  imageUrl?: string
  description?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

const PRODUCTS_KEY = 'products.json'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {})
  if (!verifyAdminTokenFromEvent(event)) return unauthorized()

  try {
    if (event.httpMethod === 'GET') {
      const products = await getJson<Product[]>(PRODUCTS_KEY, [])
      return ok(products)
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? (JSON.parse(event.body) as Partial<Product>) : null
      if (!body?.name || !(Number(body.price) >= 0)) return badRequest('Missing name/price')

      const now = new Date().toISOString()
      const products = await getJson<Product[]>(PRODUCTS_KEY, [])
      const id = body.id || newId('prd')

      const existing = products.find((p) => p.id === id)
      const next: Product = {
        id,
        name: String(body.name),
        price: Number(body.price),
        imageUrl: body.imageUrl ? String(body.imageUrl) : undefined,
        description: body.description ? String(body.description) : undefined,
        active: body.active !== undefined ? Boolean(body.active) : true,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      }

      const updated = existing
        ? products.map((p) => (p.id === id ? next : p))
        : [next, ...products]

      await setJson(PRODUCTS_KEY, updated)
      return ok(next)
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id
      if (!id) return badRequest('Missing id')
      const products = await getJson<Product[]>(PRODUCTS_KEY, [])
      const updated = products.filter((p) => p.id !== id)
      await setJson(PRODUCTS_KEY, updated)
      return ok({ ok: true })
    }

    return badRequest('Unsupported method')
  } catch (e) {
    return serverError(e instanceof Error ? e.message : 'Failed')
  }
}

