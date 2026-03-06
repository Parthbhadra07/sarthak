import type { Handler } from '@netlify/functions'
import { getJson } from './lib/blobs'
import { ok, json, serverError, badRequest } from './lib/http'

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
  if (event.httpMethod !== 'GET') return badRequest('GET required')

  try {
    const products = await getJson<Product[]>(PRODUCTS_KEY, [])
    return ok(products)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to load products'
    return serverError(
      msg.includes('not been configured to use Netlify Blobs')
        ? 'Netlify Blobs not configured for this deploy. Ensure Functions v2/Blobs are enabled for the site.'
        : msg,
    )
  }
}

