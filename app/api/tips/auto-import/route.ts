import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { appendTipAnnouncement } from '@/lib/notifications-feed'
import { randomUUID } from 'crypto'

const DEFAULT_LEAGUES = [
  { id: '4328', name: 'Premier League' },
  { id: '4335', name: 'La Liga' },
  { id: '4332', name: 'Serie A' },
  { id: '4331', name: 'Bundesliga' },
]

type IncomingLeague = { id: string; name?: string }

/**
 * Importa jogos futuros como tips Pendentes (volume automático).
 * Protegido por CRON_SECRET ou header x-auto-import-secret.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET || process.env.AUTO_IMPORT_SECRET || ''
    const provided =
      req.headers.get('x-auto-import-secret') ||
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
      ''

    // Fail-closed: secret obrigatório. Admin autenticado também pode disparar.
    const { hasValidAdminSession } = await import('@/lib/auth-server')
    const adminOk = hasValidAdminSession(req)
    if ((!secret || provided !== secret) && !adminOk) {
      return NextResponse.json({ ok: false, error: 'Não autorizado.' }, { status: 401 })
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      return NextResponse.json({ ok: false, error: 'Supabase admin não configurado.' }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const allowedIds = new Set(DEFAULT_LEAGUES.map((l) => l.id))
    const rawLeagues: IncomingLeague[] = Array.isArray(body.leagues) ? body.leagues : DEFAULT_LEAGUES
    const leagues: IncomingLeague[] = rawLeagues.filter((l) => allowedIds.has(String(l?.id || '')))
    if (leagues.length === 0) {
      return NextResponse.json({ ok: false, error: 'Nenhuma liga permitida.' }, { status: 400 })
    }
    const maxTips = Math.min(Number(body.maxTips) || 8, 20)
    const bookmaker = String(body.bookmaker || 'Betano')
    const defaultOdd = Number(body.defaultOdd) || 1.85
    const broadcast = Boolean(body.broadcast)
    const notifyClients = Boolean(body.notifyClients)

    const events: any[] = []
    for (const league of leagues) {
      const res = await fetch(
        `https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=${league.id}`,
      )
      if (!res.ok) continue
      const data = await res.json()
      for (const ev of data.events || []) {
        if (ev.strSport && ev.strSport !== 'Soccer') continue
        events.push(ev)
      }
    }

    events.sort((a, b) => String(a.strTimestamp || a.dateEvent).localeCompare(String(b.strTimestamp || b.dateEvent)))

    const { data: existing } = await admin
      .from('tips')
      .select('match, datetime, status')
      .eq('status', 'Pendente')

    const existingKeys = new Set(
      (existing || []).map((t) => `${String(t.match).toLowerCase()}|${String(t.datetime).slice(0, 16)}`),
    )

    const tipsToInsert: Record<string, unknown>[] = []
    for (const ev of events) {
      if (tipsToInsert.length >= maxTips) break
      const home = ev.strHomeTeam
      const away = ev.strAwayTeam
      if (!home || !away) continue
      const match = `${home} vs ${away}`
      const datetime = ev.strTimestamp
        ? new Date(ev.strTimestamp).toISOString()
        : `${ev.dateEvent}T${ev.strTime || '15:00:00'}Z`
      const key = `${match.toLowerCase()}|${datetime.slice(0, 16)}`
      if (existingKeys.has(key)) continue
      existingKeys.add(key)

      const type = 'Casa vence'
      const odd = defaultOdd
      const confidence = 7

      tipsToInsert.push({
        id: randomUUID(),
        sport: 'Futebol',
        league: ev.strLeague || 'Futebol',
        match,
        datetime,
        market: 'Resultado Final (1X2)',
        type,
        odd,
        stake: Number((confidence / 3).toFixed(1)),
        confidence,
        recommended_bookmaker: bookmaker,
        affiliate_url: 'https://www.betano.com',
        tipster_id: null,
        tipster_name: 'MK Tips',
        justification: `Oportunidade automática · ${home} x ${away}. Ajuste odd/mercado com a casa parceira antes do jogo.`,
        risk_indicators: ['Auto-import', 'Revisar odd com a casa'],
        estimated_probability: Math.min(80, Math.floor(95 / odd)),
        ev: Number((odd * 0.52 - 1).toFixed(2)),
        views: 0,
        favorites_count: 0,
        status: 'Pendente',
        odds_comparison: [
          { bookmaker, odd },
          { bookmaker: 'Bet365', odd: Number((odd - 0.05).toFixed(2)) },
          { bookmaker: 'Stake', odd: Number((odd - 0.02).toFixed(2)) },
        ],
      })
    }

    if (tipsToInsert.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0, tips: [], message: 'Nenhum jogo novo para importar.' })
    }

    const { data, error } = await admin.from('tips').insert(tipsToInsert).select('id, match, datetime, league, market, type, odd, status')
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    if (notifyClients) {
      for (const t of data) {
        try {
          await appendTipAnnouncement(admin, {
            title: 'Nova tip MK Tips',
            body: `${t.match} · ${t.market || 'Resultado'} · Odd ${Number(t.odd).toFixed(2)}`,
            match: String(t.match),
            market: String(t.market || ''),
            odd: Number(t.odd) || undefined,
          })
        } catch {
          /* feed optional */
        }
      }
    }

    // Best-effort: enfileira broadcast (worker local / wacli consome)
    if (broadcast) {
      try {
        const base = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
        await fetch(`${base}/api/whatsapp/queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'push',
            campaignId: `auto-${Date.now()}`,
            campaignName: `Auto tips: ${data.length} oportunidades`,
            total: data.length,
            tips: data,
          }),
        })
      } catch {
        /* queue optional */
      }
    }

    return NextResponse.json({ ok: true, inserted: data.length, tips: data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Falha no auto-import.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: 'POST /api/tips/auto-import com header x-auto-import-secret',
  })
}
