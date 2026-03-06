import type { Handler } from '@netlify/functions'
import { verifyAdminTokenFromEvent } from './lib/auth'
import { badRequest, json, ok, serverError, unauthorized } from './lib/http'
import { newId } from './lib/ids'
import { supabaseAdmin } from './lib/supabase'
import { errorMessage } from './lib/errors'

type Category = { id: string; name: string; createdAt: string }
type DbCategory = { id: string; name: string; created_at: string }

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {})
  if (!verifyAdminTokenFromEvent(event)) return unauthorized()

  try {
    const sb = supabaseAdmin()

    if (event.httpMethod === 'GET') {
      const { data, error } = await sb
        .from('categories')
        .select('id,name,created_at')
        .order('name', { ascending: true })
      if (error) throw error
      const categories: Category[] = ((data || []) as DbCategory[]).map((c) => ({
        id: String(c.id),
        name: String(c.name),
        createdAt: new Date(c.created_at).toISOString(),
      }))
      return ok(categories)
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? (JSON.parse(event.body) as { name?: string; id?: string }) : null
      const name = body?.name?.trim()
      if (!name) return badRequest('Missing name')
      const id = body?.id || newId('cat')

      const { data, error } = await sb
        .from('categories')
        .upsert({ id, name }, { onConflict: 'id' })
        .select('id,name,created_at')
        .single()
      if (error) throw error
      const row = data as unknown as DbCategory
      return ok({ id: row.id, name: row.name, createdAt: new Date(row.created_at).toISOString() })
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id
      if (!id) return badRequest('Missing id')
      const { error } = await sb.from('categories').delete().eq('id', id)
      if (error) throw error
      return ok({ ok: true })
    }

    return badRequest('Unsupported method')
  } catch (e) {
    return serverError(errorMessage(e))
  }
}

