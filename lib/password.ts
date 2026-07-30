import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const PREFIX = 'scrypt$'

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('base64url')
  const hash = scryptSync(password, salt, 64).toString('base64url')
  return `${PREFIX}${salt}$${hash}`
}

export function isHashedPassword(stored: string): boolean {
  return stored.startsWith(PREFIX)
}

/** Aceita hash scrypt ou plaintext legado (migração). */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false
  if (isHashedPassword(stored)) {
    const parts = stored.split('$')
    // scrypt$salt$hash
    if (parts.length !== 3) return false
    const salt = parts[1]
    const expected = parts[2]
    const actual = scryptSync(password, salt, 64).toString('base64url')
    const a = Buffer.from(actual)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  }
  // legado plaintext
  const a = Buffer.from(password)
  const b = Buffer.from(stored)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function needsRehash(stored: string): boolean {
  return !isHashedPassword(stored)
}
