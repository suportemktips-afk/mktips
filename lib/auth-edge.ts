export const ADMIN_COOKIE = 'mktips_admin_session'
export const USER_COOKIE = 'mktips_user_session'
export const ADMIN_CHALLENGE_COOKIE = 'mktips_admin_challenge'

export type TokenPayload = {
  sub: string
  role: 'admin' | 'user'
  exp: number
  iat: number
}

export function sessionSecret(): string {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    ''
  if (secret.length >= 16) return secret
  if (process.env.NODE_ENV === 'production') {
    // Fail-closed: tokens nunca validam sem secret dedicado
    return ''
  }
  return 'dev-only-session-secret-change-me'
}

export function isSessionSecretConfigured(): boolean {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || ''
  return secret.length >= 16 || process.env.NODE_ENV !== 'production'
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ''
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]!)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!
  return diff === 0
}

/** Edge-compatible HMAC verify (middleware). */
export async function verifySignedTokenEdge(
  token: string | undefined | null,
  expectedRole?: 'admin' | 'user',
): Promise<TokenPayload | null> {
  if (!sessionSecret()) return null
  if (!token || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const secret = sessionSecret()
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  const expected = bytesToBase64Url(mac)
  const sigBytes = new TextEncoder().encode(sig)
  const expectedBytes = new TextEncoder().encode(expected)
  if (!timingSafeEqualBytes(sigBytes, expectedBytes)) return null
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(body))
    const payload = JSON.parse(json) as TokenPayload
    if (!payload?.sub || !payload?.exp || !payload?.role) return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    if (expectedRole && payload.role !== expectedRole) return null
    return payload
  } catch {
    return null
  }
}
