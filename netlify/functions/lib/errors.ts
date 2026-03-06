export function errorMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message

  if (typeof e === 'object' && e) {
    const anyE = e as Record<string, unknown>
    const message = typeof anyE.message === 'string' ? anyE.message : ''
    const details = typeof anyE.details === 'string' ? anyE.details : ''
    const hint = typeof anyE.hint === 'string' ? anyE.hint : ''
    const code = typeof anyE.code === 'string' ? anyE.code : ''

    const parts = [message, details, hint].filter(Boolean)
    if (parts.length) {
      return code ? `[${code}] ${parts.join(' | ')}` : parts.join(' | ')
    }
  }

  try {
    return JSON.stringify(e)
  } catch {
    return String(e)
  }
}

