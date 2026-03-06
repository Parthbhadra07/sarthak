import type { Handler } from '@netlify/functions'
import { verifyAdminTokenFromEvent } from './lib/auth'
import { badRequest, json, ok, serverError, unauthorized } from './lib/http'
import { newId } from './lib/ids'
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

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {})
  if (!verifyAdminTokenFromEvent(event)) return unauthorized()

  try {
    if (event.httpMethod === 'GET') {
      const sb = supabaseAdmin()
      const { data, error } = await sb
        .from('products')
        .select('id,name,price,image_url,description,active,created_at,updated_at')
        .order('updated_at', { ascending: false })
      if (error) throw error

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
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? (JSON.parse(event.body) as Partial<Product>) : null
      if (!body?.name || !(Number(body.price) >= 0)) return badRequest('Missing name/price')

      const now = new Date().toISOString()
      const id = body.id || newId('prd')

      const sb = supabaseAdmin()
      const payload = {
        id,
        name: String(body.name),
        price: Number(body.price),
        image_url: body.imageUrl ? String(body.imageUrl) : null,
        description: body.description ? String(body.description) : null,
        active: body.active !== undefined ? Boolean(body.active) : true,
        created_at: now,
        updated_at: now,
      }

      // Upsert: if id exists, update; if not, insert. Preserve created_at on update.
      // We do it in two steps to avoid overwriting created_at.
      const { data: existing, error: exErr } = await sb
        .from('products')
        .select('created_at')
        .eq('id', id)
        .maybeSingle()
      if (exErr) throw exErr

      const finalPayload = existing?.created_at
        ? { ...payload, created_at: existing.created_at }
        : payload

      const { data, error } = await sb
        .from('products')
        .upsert(finalPayload, { onConflict: 'id' })
        .select('id,name,price,image_url,description,active,created_at,updated_at')
        .single()
      if (error) throw error

      const row = data as unknown as DbProduct
      const next: Product = {
        id: String(row.id),
        name: String(row.name),
        price: Number(row.price),
        imageUrl: row.image_url ?? undefined,
        description: row.description ?? undefined,
        active: Boolean(row.active),
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
      }

      return ok(next)
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id
      if (!id) return badRequest('Missing id')
      const sb = supabaseAdmin()
      const { error } = await sb.from('products').delete().eq('id', id)
      if (error) throw error
      return ok({ ok: true })
    }

    return badRequest('Unsupported method')
  } catch (e) {
    return serverError(e instanceof Error ? e.message : 'Failed')
  }
}

