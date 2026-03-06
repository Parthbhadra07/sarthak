import { customAlphabet } from 'nanoid'

const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12)

export function newId(prefix: string) {
  return `${prefix}_${nano()}`
}

