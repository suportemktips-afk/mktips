import { createHmac, randomBytes, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  USER_COOKIE,
  sessionSecret,
  type TokenPayload,
} from '@/lib/auth-edge'

export {
  ADMIN_CHALLENGE_COOKIE,
  ADMIN_COOKIE,
  USER_COOKIE,
  isSessionSecretConfigured,
  sessionSecret,
  verifySignedTokenEdge,
} from '@/lib/auth-edge'

export type { TokenPayload } from '@/lib/auth-edge'

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

function signRaw(data: string): string {
  return createHmac('sha256', sessionSecret()).update(data).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

export function createSignedToken(sub: string, role: 'admin' | 'user', maxAgeSec: number): string {
  if (!sessionSecret()) {
    throw new Error('SESSION_SECRET não configurado.')
  }
  const now = Math.floor(Date.now() / 1000)
  const payload: TokenPayload = { sub, role, iat: now, exp: now + maxAgeSec }
  const body = b64url(JSON.stringify(payload))
  return `${body}.${signRaw(body)}`
}

export function createPaymentStatusToken(transactionId: string): string {
  return createSignedToken(`pay:${transactionId}`, 'user', 60 * 60)
}

export function verifyPaymentStatusToken(
  token: string | undefined | null,
  transactionId: string,
): boolean {
  const payload = verifySignedToken(token, 'user')
  return Boolean(payload && payload.sub === `pay:${transactionId}`)
}

export function verifySignedToken(
  token: string | undefined | null,
  expectedRole?: 'admin' | 'user',
): TokenPayload | null {
  if (!sessionSecret()) return null
  if (!token || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  if (!safeEqual(sig, signRaw(body))) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload
    if (!payload?.sub || !payload?.exp || !payload?.role) return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    if (expectedRole && payload.role !== expectedRole) return null
    return payload
  } catch {
    return null
  }
}

export function createAdminChallengeToken(email: string): string {
  return createSignedToken(`challenge:${email.toLowerCase()}`, 'admin', 10 * 60)
}

export function verifyAdminChallengeToken(token: string | undefined | null, email: string): boolean {
  const payload = verifySignedToken(token, 'admin')
  if (!payload) return false
  return payload.sub === `challenge:${email.trim().toLowerCase()}`
}

export function cookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSec,
  }
}

export function hasValidAdminSession(req: NextRequest): boolean {
  return Boolean(verifySignedToken(req.cookies.get(ADMIN_COOKIE)?.value, 'admin'))
}

export function hasValidUserSession(req: NextRequest): boolean {
  return Boolean(verifySignedToken(req.cookies.get(USER_COOKIE)?.value, 'user'))
}

export function getUserSessionId(req: NextRequest): string | null {
  return verifySignedToken(req.cookies.get(USER_COOKIE)?.value, 'user')?.sub ?? null
}

export function getCronSecretFromRequest(req: NextRequest): string {
  return (
    req.headers.get('x-auto-import-secret') ||
    req.headers.get('x-cron-secret') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    ''
  )
}

export function hasValidCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.AUTO_IMPORT_SECRET || ''
  if (!secret) return false
  const provided = getCronSecretFromRequest(req)
  return Boolean(provided) && safeEqual(provided, secret)
}

export function hasValidWebhookSecret(req: NextRequest): boolean {
  const secret = process.env.VELANA_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET || ''
  if (!secret) return false
  const provided =
    req.headers.get('x-webhook-secret') ||
    req.headers.get('x-velana-signature') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    ''
  return Boolean(provided) && safeEqual(provided, secret)
}

export function authorizeAdminOrCron(req: NextRequest): boolean {
  return hasValidAdminSession(req) || hasValidCronSecret(req)
}

export function unauthorizedJson(message = 'Não autorizado.'): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status: 401 })
}

const attempts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now()
  const row = attempts.get(key)
  if (!row || row.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSec: 0 }
  }
  if (row.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((row.resetAt - now) / 1000) }
  }
  row.count += 1
  return { ok: true, retryAfterSec: 0 }
}

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

