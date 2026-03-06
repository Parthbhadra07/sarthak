import type { HandlerEvent, HandlerResponse } from '@netlify/functions'

export function json(statusCode: number, body: unknown): HandlerResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  }
}

export function text(statusCode: number, body: string): HandlerResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body,
  }
}

export function ok(body: unknown) {
  return json(200, body)
}

export function badRequest(message: string) {
  return json(400, { error: message })
}

export function unauthorized(message: string = 'Unauthorized') {
  return json(401, { error: message })
}

export function notFound(message: string = 'Not found') {
  return json(404, { error: message })
}

export function serverError(message: string = 'Server error') {
  return json(500, { error: message })
}

export function parseJsonBody<T>(event: HandlerEvent): T | null {
  if (!event.body) return null
  try {
    return JSON.parse(event.body) as T
  } catch {
    return null
  }
}

