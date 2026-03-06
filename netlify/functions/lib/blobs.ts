import { getStore } from '@netlify/blobs'

const STORE_NAME = 'sstrders'

type Json = null | boolean | number | string | Json[] | { [k: string]: Json }

export function getSstrStore() {
  return getStore(STORE_NAME)
}

export async function getJson<T = unknown>(key: string, fallback: T): Promise<T> {
  const store = getSstrStore()
  const data = (await store.get(key, { type: 'json' })) as Json | null
  if (data === null || data === undefined) return fallback
  return data as unknown as T
}

export async function setJson(key: string, value: unknown) {
  const store = getSstrStore()
  await store.set(key, value)
}

