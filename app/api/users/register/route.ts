import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { USER_COOKIE, cookieOptions, createSignedToken, clientIp } from '@/lib/auth-server'
import { hashPassword } from '@/lib/password'
import { writeAuditLog } from '@/lib/audit-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const phone = String(body.phone || '')
    const cpf = String(body.cpf || '')
    const referrerCode = body.referrerCode ? String(body.referrerCode).trim().toUpperCase() : null
    const ip = clientIp(req)

    // Plano pago NUNCA via register público
    const plan = 'Free'

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'Nome, e-mail e senha (mín. 6) são obrigatórios.' },
        { status: 400 },
      )
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: 'Banco não configurado no servidor (SUPABASE_SERVICE_ROLE_KEY).' },
        { status: 500 },
      )
    }

    const { data: existing, error: existingErr } = await admin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (existingErr) {
      return NextResponse.json({ ok: false, error: existingErr.message }, { status: 500 })
    }
    if (existing) {
      return NextResponse.json({ ok: false, error: 'Este e-mail já está cadastrado.' }, { status: 409 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const row = {
      id,
      name,
      email,
      phone,
      cpf,
      city: '',
      country: 'Brasil',
      language: 'pt-BR',
      plan,
      role: 'User',
      status: 'Ativo',
      created_at: now,
      last_login: now,
      last_login_ip: ip,
      device: 'Web App',
      os: '',
      browser: '',
      days_remaining: 7,
      revenue_generated: 0,
      total_paid: 0,
      last_payment_date: null,
      bankroll: 0,
      bankroll_currency: 'R$',
      roi_individual: 0,
    }

    const { data: inserted, error: insertErr } = await admin
      .from('users')
      .insert(row)
      .select('id, name, email, phone, plan, role, status, days_remaining, created_at')
      .single()

    if (insertErr) {
      console.error('register insert error:', insertErr)
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 })
    }

    await admin.from('user_credentials').upsert(
      { email, password: hashPassword(password), user_id: id, updated_at: now },
      { onConflict: 'email' },
    )

    if (referrerCode) {
      const { data: candidates } = await admin.from('users').select('id').limit(5000)
      const referrer = (candidates || []).find((u) => {
        const code = u.id.replace(/-/g, '').toUpperCase().slice(-8)
        return code === referrerCode
      })
      if (referrer && referrer.id !== id) {
        await admin.from('referrals').insert({
          id: crypto.randomUUID(),
          name,
          date: now.slice(0, 10),
          plan,
          status: 'Ativo',
          referrer_id: referrer.id,
        })
      }
    }

    await writeAuditLog({
      actor: email,
      action: 'REGISTER',
      target: id,
      meta: 'Cadastro Free',
      ip,
    })

    const token = createSignedToken(id, 'user', 60 * 60 * 24 * 7)
    const res = NextResponse.json({ ok: true, user: inserted })
    res.cookies.set(USER_COOKIE, token, cookieOptions(60 * 60 * 24 * 7))
    return res
  } catch (e: any) {
    console.error('register error:', e)
    return NextResponse.json({ ok: false, error: e?.message || 'Erro ao cadastrar.' }, { status: 500 })
  }
}
