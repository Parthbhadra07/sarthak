import type { Handler } from '@netlify/functions'
import { ok, json, serverError, badRequest } from './lib/http'
import { supabaseAdmin } from './lib/supabase'

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

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {})
  if (event.httpMethod !== 'GET') return badRequest('GET required')

  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb
      .from('products')
      .select('id,name,price,image_url,description,active,created_at,updated_at')
      .order('updated_at', { ascending: false })
    if (error) throw error

    type DbProduct = {
      id: string
      name: string
      price: number
      image_url: string | null
      description: string | null
      active: boolean
      created_at: string
      updated_at: string
    }
    const products: Product[] = ((data || []) as DbProduct[]).map((p) => ({
      id: String(p.id),
      name: String(p.name),
      price: Number(p.price),
      imageUrl: p.image_url ?? undefined,
      description: p.description ?? undefined,
      active: Boolean(p.active),
      createdAt: new Date(p.created_at).toISOString(),
      updatedAt: new Date(p.updated_at).toISOString(),
    }))

    return ok(products)
  } catch (e) {
    return serverError(e instanceof Error ? e.message : 'Failed to load products')
  }
}

