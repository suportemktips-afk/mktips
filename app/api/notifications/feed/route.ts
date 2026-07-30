import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { appendTipAnnouncement, loadNotificationFeed } from '@/lib/notifications-feed'

export async function GET() {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return NextResponse.json({ ok: true, items: [] })
  }
  const items = await loadNotificationFeed(admin)
  return NextResponse.json({ ok: true, items })
}

/** Admin publica nova tip → feed para clientes receberem push */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const match = String(body.match || '').trim()
    if (!match) {
      return NextResponse.json({ ok: false, error: 'match obrigatório' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      return NextResponse.json({ ok: false, error: 'Supabase não configurado' }, { status: 500 })
    }

    const market = String(body.market || '')
    const odd = Number(body.odd) || 0
    const isResult = body.type === 'tip_result'
    const title = String(body.title || (isResult ? 'Resultado da tip' : 'Nova tip MK Tips'))
    const bodyText =
      String(body.body || '').trim() ||
      (isResult
        ? `${match}${market ? ` · ${market}` : ''}`
        : `${match}${market ? ` · ${market}` : ''}${odd ? ` · Odd ${odd.toFixed(2)}` : ''}`)

    const entry = await appendTipAnnouncement(admin, {
      title,
      body: bodyText,
      match,
      market,
      odd: odd || undefined,
      type: body.type === 'tip_result' ? 'tip_result' : 'new_tip',
    })

    return NextResponse.json({ ok: true, item: entry })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' }, { status: 500 })
  }
}
