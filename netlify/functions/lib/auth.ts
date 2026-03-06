import jwt from 'jsonwebtoken'
import type { HandlerEvent } from '@netlify/functions'

const TOKEN_TTL_SECONDS = 60 * 60 * 8 // 8 hours

export function requireEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

export function signAdminToken() {
  const secret = requireEnv('JWT_SECRET')
  return jwt.sign({ role: 'admin' }, secret, { expiresIn: TOKEN_TTL_SECONDS })
}

export function verifyAdminTokenFromEvent(event: HandlerEvent) {
  const secret = requireEnv('JWT_SECRET')
  const header = event.headers.authorization || event.headers.Authorization || ''
  const m = header.match(/^Bearer\s+(.+)$/i)
  if (!m) return false
  try {
    const decoded = jwt.verify(m[1], secret) as { role?: string }
    return decoded?.role === 'admin'
  } catch {
    return false
  }
}

