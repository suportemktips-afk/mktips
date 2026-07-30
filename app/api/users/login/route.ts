import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  USER_COOKIE,
  checkRateLimit,
  clientIp,
  cookieOptions,
  createSignedToken,
} from '@/lib/auth-server'
import { hashPassword, needsRehash, verifyPassword } from '@/lib/password'
import { writeAuditLog } from '@/lib/audit-server'

function publicUser(user: Record<string, any>) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    plan: user.plan,
    role: user.role,
    status: user.status,
    days_remaining: user.days_remaining,
    daysRemaining: user.days_remaining,
    tipster_id: user.tipster_id,
    tipsterId: user.tipster_id,
    bankroll: user.bankroll,
    bankroll_currency: user.bankroll_currency,
    created_at: user.created_at,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ip = clientIp(req)

    if (body?.step === 'logout') {
      const res = NextResponse.json({ ok: true })
      res.cookies.set(USER_COOKIE, '', { ...cookieOptions(0), maxAge: 0 })
      await writeAuditLog({ actor: String(body.email || 'user'), action: 'LOGOUT', ip })
      return res
    }

    const { email, password } = body
    const normalized = String(email || '').trim().toLowerCase()
    const pass = String(password || '')
    if (!normalized || !pass) {
      return NextResponse.json({ ok: false, error: 'E-mail e senha obrigatórios.' }, { status: 400 })
    }

    const rl = checkRateLimit(`user-login:${ip}:${normalized}`, 20, 15 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: `Muitas tentativas. Aguarde ${rl.retryAfterSec}s.` },
        { status: 429 },
      )
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      return NextResponse.json({ ok: false, error: 'Banco não configurado.' }, { status: 500 })
    }

    const { data: user, error } = await admin
      .from('users')
      .select('*')
      .eq('email', normalized)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
    if (!user) {
      return NextResponse.json({ ok: false, error: 'E-mail ou senha incorretos.' }, { status: 401 })
    }

    if (['Master', 'Admin', 'Gerente'].includes(user.role)) {
      return NextResponse.json(
        { ok: false, error: 'Use o painel administrativo para esta conta.' },
        { status: 403 },
      )
    }

    const { data: cred } = await admin
      .from('user_credentials')
      .select('password')
      .eq('email', normalized)
      .maybeSingle()

    if (!cred?.password) {
      return NextResponse.json({ ok: false, error: 'Credenciais não encontradas.' }, { status: 401 })
    }

    if (!verifyPassword(pass, cred.password)) {
      await writeAuditLog({
        actor: normalized,
        action: 'SECURITY',
        meta: 'Falha login usuário',
        ip,
      })
      return NextResponse.json({ ok: false, error: 'E-mail ou senha incorretos.' }, { status: 401 })
    }

    if (needsRehash(cred.password)) {
      await admin
        .from('user_credentials')
        .upsert(
          { email: normalized, password: hashPassword(pass), user_id: user.id, updated_at: new Date().toISOString() },
          { onConflict: 'email' },
        )
    }

    await writeAuditLog({
      actor: normalized,
      action: 'LOGIN',
      target: user.id,
      meta: `Login ${user.role}`,
      ip,
    })

    const token = createSignedToken(user.id, 'user', 60 * 60 * 24 * 7)
    const res = NextResponse.json({ ok: true, user: publicUser(user) })
    res.cookies.set(USER_COOKIE, token, cookieOptions(60 * 60 * 24 * 7))
    return res
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro no login.' }, { status: 500 })
  }
}
