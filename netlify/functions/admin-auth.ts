import type { Handler } from '@netlify/functions'
import { badRequest, ok, unauthorized, parseJsonBody, json } from './lib/http'
import { requireEnv, signAdminToken } from './lib/auth'

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {})
  if (event.httpMethod !== 'POST') return badRequest('POST required')

  const body = parseJsonBody<{ password?: string }>(event)
  if (!body?.password) return badRequest('Missing password')

  const expected = requireEnv('ADMIN_PASSWORD')
  if (body.password !== expected) return unauthorized('Invalid password')

  const token = signAdminToken()
  return ok({ token })
}

