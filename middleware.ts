import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, USER_COOKIE, verifySignedTokenEdge } from '@/lib/auth-edge'

function cronOk(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.AUTO_IMPORT_SECRET || ''
  if (!secret) return false
  const provided =
    req.headers.get('x-auto-import-secret') ||
    req.headers.get('x-cron-secret') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    ''
  return provided === secret
}

function webhookOk(req: NextRequest): boolean {
  const secret = process.env.VELANA_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET || ''
  if (!secret) return false
  const provided =
    req.headers.get('x-webhook-secret') ||
    req.headers.get('x-velana-signature') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    ''
  return provided === secret
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Painel admin — exige cookie HMAC válido
  if (pathname.startsWith('/mktipsadmin/dashboard')) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    const session = await verifySignedTokenEdge(token, 'admin')
    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/mktipsadmin'
      url.searchParams.set('auth', 'required')
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // WhatsApp / CRM APIs — só admin ou cron
  if (pathname.startsWith('/api/whatsapp')) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    const session = await verifySignedTokenEdge(token, 'admin')
    if (!session && !cronOk(req)) {
      return NextResponse.json({ ok: false, error: 'Não autorizado.' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Lista de pagamentos — só admin
  if (pathname === '/api/payments' && req.method === 'GET') {
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    const session = await verifySignedTokenEdge(token, 'admin')
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Não autorizado.', payments: [] }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Contatos comunidade — só admin/cron
  if (pathname.startsWith('/api/community-contacts')) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value
    const session = await verifySignedTokenEdge(token, 'admin')
    if (!session && !cronOk(req)) {
      return NextResponse.json({ ok: false, contacts: [], error: 'Não autorizado.' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Notificações: POST admin; GET usuário logado ou admin
  if (pathname.startsWith('/api/notifications/feed')) {
    if (req.method === 'POST') {
      const token = req.cookies.get(ADMIN_COOKIE)?.value
      const session = await verifySignedTokenEdge(token, 'admin')
      if (!session && !cronOk(req)) {
        return NextResponse.json({ ok: false, error: 'Não autorizado.' }, { status: 401 })
      }
    } else if (req.method === 'GET') {
      const admin = await verifySignedTokenEdge(req.cookies.get(ADMIN_COOKIE)?.value, 'admin')
      const user = await verifySignedTokenEdge(req.cookies.get(USER_COOKIE)?.value, 'user')
      if (!admin && !user && !cronOk(req)) {
        return NextResponse.json({ ok: false, items: [], error: 'Não autorizado.' }, { status: 401 })
      }
    }
    return NextResponse.next()
  }

  // Auto-import — fail-closed no middleware também
  if (pathname.startsWith('/api/tips/auto-import') && req.method === 'POST') {
    if (!cronOk(req)) {
      const admin = await verifySignedTokenEdge(req.cookies.get(ADMIN_COOKIE)?.value, 'admin')
      if (!admin) {
        return NextResponse.json({ ok: false, error: 'Não autorizado.' }, { status: 401 })
      }
    }
    return NextResponse.next()
  }

  // Webhook — exige secret dedicado
  if (pathname.startsWith('/api/payment/webhook')) {
    if (req.method === 'POST' && !webhookOk(req)) {
      return NextResponse.json({ received: false, error: 'Assinatura inválida.' }, { status: 401 })
    }
    if (req.method === 'GET') {
      const admin = await verifySignedTokenEdge(req.cookies.get(ADMIN_COOKIE)?.value, 'admin')
      const user = await verifySignedTokenEdge(req.cookies.get(USER_COOKIE)?.value, 'user')
      if (!admin && !user) {
        return NextResponse.json({ confirmed: false, error: 'Não autorizado.' }, { status: 401 })
      }
    }
    return NextResponse.next()
  }

  // Área tipster — exige sessão de usuário (não visita anônima)
  if (pathname.startsWith('/tipster/dashboard') || pathname.startsWith('/tipster/tips')) {
    const user = await verifySignedTokenEdge(req.cookies.get(USER_COOKIE)?.value, 'user')
    const admin = await verifySignedTokenEdge(req.cookies.get(ADMIN_COOKIE)?.value, 'admin')
    if (!user && !admin) {
      const url = req.nextUrl.clone()
      url.pathname = '/tipster'
      url.searchParams.set('auth', 'required')
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Dashboard cliente
  if (pathname.startsWith('/dashboard')) {
    const user = await verifySignedTokenEdge(req.cookies.get(USER_COOKIE)?.value, 'user')
    if (!user) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('auth', 'required')
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/mktipsadmin/dashboard/:path*',
    '/dashboard/:path*',
    '/tipster/dashboard/:path*',
    '/tipster/tips/:path*',
    '/api/whatsapp/:path*',
    '/api/payments',
    '/api/payments/:path*',
    '/api/community-contacts',
    '/api/community-contacts/:path*',
    '/api/notifications/feed',
    '/api/notifications/feed/:path*',
    '/api/tips/auto-import',
    '/api/payment/webhook',
  ],
}
