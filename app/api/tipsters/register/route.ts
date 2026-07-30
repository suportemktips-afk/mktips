import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hashPassword } from '@/lib/password'
import { checkRateLimit, clientIp } from '@/lib/auth-server'
import { writeAuditLog } from '@/lib/audit-server'

/**
 * Registro público de tipster — cria conta Pendente.
 * NÃO concede acesso admin nem dados MK Tips.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req)
    const rl = checkRateLimit(`tipster-reg:${ip}`, 5, 60 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json({ ok: false, error: 'Muitas tentativas.' }, { status: 429 })
    }

    const body = await req.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const phone = String(body.phone || '')
    const specialty = String(body.specialty || 'Futebol').slice(0, 80)
    const bio = String(body.bio || '').slice(0, 1000)
    const instagram = String(body.instagram || '').slice(0, 120)
    const telegram = String(body.telegram || '').slice(0, 120)

    if (!name || !email || password.length < 6) {
      return NextResponse.json({ ok: false, error: 'Dados inválidos.' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      return NextResponse.json({ ok: false, error: 'Banco não configurado.' }, { status: 500 })
    }

    const { data: existing } = await admin.from('users').select('id').eq('email', email).maybeSingle()
    if (existing) {
      return NextResponse.json({ ok: false, error: 'E-mail já cadastrado.' }, { status: 409 })
    }

    const tipsterId = crypto.randomUUID()
    const now = new Date().toISOString()

    const { error: tipsterErr } = await admin.from('tipsters').insert({
      id: tipsterId,
      name,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      specialty,
      sports: [specialty],
      markets: ['1x2', 'Gols'],
      bio,
      socials: { instagram, telegram },
      status: 'Pendente',
      verified: false,
      badge: 'Tipster Pro',
      color: '#10B981',
      created_at: now,
    })
    if (tipsterErr) {
      return NextResponse.json({ ok: false, error: tipsterErr.message }, { status: 500 })
    }

    const { error: userErr } = await admin.from('users').insert({
      id: tipsterId,
      name,
      email,
      phone: phone || '',
      cpf: '',
      city: '',
      country: 'Brasil',
      language: 'pt-BR',
      plan: 'Free',
      role: 'Tipster',
      status: 'Pendente',
      created_at: now,
      last_login: now,
      last_login_ip: ip,
      device: 'Web Browser',
      os: '',
      browser: '',
      days_remaining: 0,
      revenue_generated: 0,
      total_paid: 0,
      bankroll: 0,
      bankroll_currency: 'R$',
      roi_individual: 0,
      tipster_id: tipsterId,
    })
    if (userErr) {
      return NextResponse.json({ ok: false, error: userErr.message }, { status: 500 })
    }

    await admin.from('user_credentials').upsert(
      { email, password: hashPassword(password), user_id: tipsterId, updated_at: now },
      { onConflict: 'email' },
    )

    await writeAuditLog({
      actor: email,
      action: 'REGISTER',
      target: tipsterId,
      meta: 'Tipster Pendente',
      ip,
    })

    return NextResponse.json({
      ok: true,
      message: 'Cadastro enviado. Aguarde aprovação da MK Tips.',
      tipsterId,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' }, { status: 500 })
  }
}
