import { getStore } from '@netlify/blobs'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const STORE_NAME = 'sstrders'

type Json = null | boolean | number | string | Json[] | { [k: string]: Json }

let storeMode: 'netlify' | 'fallback' | null = null
let netlifyStore: ReturnType<typeof getStore> | null = null
const FALLBACK_DIR = join(process.cwd(), '.netlify', 'blobs-fallback')

function isBlobsNotConfigured(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /not been configured|MissingBlobsEnvironment/i.test(msg)
}

function isNetlifyRuntime() {
  return Boolean(process.env.NETLIFY)
}

function getStoreOrFallback(): ReturnType<typeof getStore> | 'fallback' {
  if (storeMode === 'fallback') return 'fallback'
  if (storeMode === 'netlify' && netlifyStore) return netlifyStore
  try {
    netlifyStore = getStore(STORE_NAME)
    storeMode = 'netlify'
    return netlifyStore
  } catch (err) {
    if (isBlobsNotConfigured(err)) {
      // In real Netlify runtime, Blobs should be configured; do NOT fallback to filesystem.
      // (Netlify function filesystem is read-only; fallback would crash or be non-persistent.)
      if (isNetlifyRuntime()) throw err
      storeMode = 'fallback'
      return 'fallback'
    }
    throw err
  }
}

function fallbackPath(key: string) {
  const safe = key.replace(/[^a-zA-Z0-9_.-]/g, '_')
  return join(FALLBACK_DIR, `${safe}.json`)
}

export async function getJson<T = unknown>(key: string, fallback: T): Promise<T> {
  const store = getStoreOrFallback()
  if (store === 'fallback') {
    try {
      const path = fallbackPath(key)
      const raw = await readFile(path, 'utf-8')
      const data = JSON.parse(raw) as Json
      return (data === null || data === undefined ? fallback : data) as unknown as T
    } catch {
      return fallback
    }
  }
  try {
    const data = (await store.get(key, { type: 'json' })) as Json | null
    if (data === null || data === undefined) return fallback
    return data as unknown as T
  } catch (err) {
    if (isBlobsNotConfigured(err)) {
      if (isNetlifyRuntime()) throw err
      storeMode = 'fallback'
      netlifyStore = null
      return getJson(key, fallback)
    }
    throw err
  }
}

export async function setJson(key: string, value: unknown): Promise<void> {
  const store = getStoreOrFallback()
  if (store === 'fallback') {
    await mkdir(FALLBACK_DIR, { recursive: true })
    const path = fallbackPath(key)
    await writeFile(path, JSON.stringify(value), 'utf-8')
    return
  }
  try {
    await store.set(key, value)
  } catch (err) {
    if (isBlobsNotConfigured(err)) {
      if (isNetlifyRuntime()) throw err
      storeMode = 'fallback'
      netlifyStore = null
      return setJson(key, value)
    }
    throw err
  }
}

