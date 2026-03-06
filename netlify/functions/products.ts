import type { Handler } from '@netlify/functions'
import { ok, json, serverError, badRequest } from './lib/http'
import { supabaseAdmin } from './lib/supabase'
import { errorMessage } from './lib/errors'

type Product = {
  id: string
  category?: string
  name: string
  unitPrice?: number
  boxPrice?: number
  taxPct: number
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
      .select('id,category,name,unit_price,box_price,tax_pct,image_url,description,active,created_at,updated_at')
      .order('updated_at', { ascending: false })
    if (error) throw error

    type DbProduct = {
      id: string
      category: string | null
      name: string
      unit_price: number | null
      box_price: number | null
      tax_pct: number | null
      image_url: string | null
      description: string | null
      active: boolean
      created_at: string
      updated_at: string
    }
    const products: Product[] = ((data || []) as DbProduct[]).map((p) => ({
      id: String(p.id),
      category: p.category ?? undefined,
      name: String(p.name),
      unitPrice: p.unit_price ?? undefined,
      boxPrice: p.box_price ?? undefined,
      taxPct: Number(p.tax_pct ?? 0),
      imageUrl: p.image_url ?? undefined,
      description: p.description ?? undefined,
      active: Boolean(p.active),
      createdAt: new Date(p.created_at).toISOString(),
      updatedAt: new Date(p.updated_at).toISOString(),
    }))

    return ok(products)
  } catch (e) {
    return serverError(errorMessage(e))
  }
}

