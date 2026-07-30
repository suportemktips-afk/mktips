import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_CHALLENGE_COOKIE,
  ADMIN_COOKIE,
  checkRateLimit,
  clientIp,
  cookieOptions,
  createAdminChallengeToken,
  createSignedToken,
  verifyAdminChallengeToken,
} from '@/lib/auth-server'
import { writeAuditLog } from '@/lib/audit-server'

export async function POST(req: NextRequest) {
  try {
    const { email, password, step, twoFactorCode } = await req.json()
    const ip = clientIp(req)

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const admin2fa = process.env.ADMIN_2FA_CODE || ''

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { ok: false, error: 'Admin não configurado no servidor.' },
        { status: 500 },
      )
    }

    const rl = checkRateLimit(`admin-login:${ip}`, 10, 15 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: `Muitas tentativas. Aguarde ${rl.retryAfterSec}s.` },
        { status: 429 },
      )
    }

    if (step === 'login') {
      if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        email.trim().toLowerCase() !== adminEmail.trim().toLowerCase() ||
        password !== adminPassword
      ) {
        await writeAuditLog({
          actor: String(email || 'unknown'),
          action: 'SECURITY',
          meta: 'Falha login admin',
          ip,
        })
        return NextResponse.json({ ok: false, error: 'Credenciais incorretas.' }, { status: 401 })
      }

      const challenge = createAdminChallengeToken(adminEmail)
      const res = NextResponse.json({ ok: true, next: '2fa' })
      res.cookies.set(ADMIN_CHALLENGE_COOKIE, challenge, cookieOptions(10 * 60))
      return res
    }

    if (step === '2fa') {
      if (!admin2fa) {
        return NextResponse.json(
          {
            ok: false,
            error: '2FA não configurado (ADMIN_2FA_CODE). Login admin bloqueado.',
          },
          { status: 503 },
        )
      }

      const code = String(twoFactorCode || '')
      if (code !== admin2fa) {
        await writeAuditLog({
          actor: adminEmail,
          action: 'SECURITY',
          meta: '2FA admin inválido',
          ip,
        })
        return NextResponse.json({ ok: false, error: 'Código 2FA inválido.' }, { status: 401 })
      }

      const challengeCookie = req.cookies.get(ADMIN_CHALLENGE_COOKIE)?.value
      if (!verifyAdminChallengeToken(challengeCookie, adminEmail)) {
        return NextResponse.json(
          { ok: false, error: 'Sessão de login expirada. Faça login novamente.' },
          { status: 401 },
        )
      }

      const token = createSignedToken(adminEmail.toLowerCase(), 'admin', 60 * 60 * 12)
      const res = NextResponse.json({ ok: true, next: 'dashboard' })
      res.cookies.set(ADMIN_COOKIE, token, cookieOptions(60 * 60 * 12))
      res.cookies.set(ADMIN_CHALLENGE_COOKIE, '', { ...cookieOptions(0), maxAge: 0 })
      await writeAuditLog({
        actor: adminEmail,
        action: 'LOGIN',
        meta: 'Admin login OK',
        ip,
      })
      return res
    }

    if (step === 'logout') {
      const res = NextResponse.json({ ok: true })
      res.cookies.set(ADMIN_COOKIE, '', { ...cookieOptions(0), maxAge: 0 })
      res.cookies.set(ADMIN_CHALLENGE_COOKIE, '', { ...cookieOptions(0), maxAge: 0 })
      await writeAuditLog({ actor: adminEmail, action: 'LOGOUT', meta: 'Admin logout', ip })
      return res
    }

    return NextResponse.json({ ok: false, error: 'Requisição inválida.' }, { status: 400 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Erro interno.' }, { status: 500 })
  }
}
