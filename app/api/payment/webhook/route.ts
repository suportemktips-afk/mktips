import { NextRequest, NextResponse } from 'next/server'
import { hasValidWebhookSecret } from '@/lib/auth-server'
import { applyVerifiedPayment, markTransactionPaid } from '@/lib/payment-security'
import { writeAuditLog } from '@/lib/audit-server'

declare global {
  // compat com código antigo
  // eslint-disable-next-line no-var
  var velanaConfirmedPayments: Map<string, { status: string; amount: number; paidAt: string }>
}

if (!global.velanaConfirmedPayments) {
  global.velanaConfirmedPayments = new Map()
}

export async function POST(req: NextRequest) {
  try {
    if (!hasValidWebhookSecret(req)) {
      return NextResponse.json({ received: false, error: 'Assinatura inválida.' }, { status: 401 })
    }

    const body = await req.json()
    const transactionId = body.id || body.transactionId || body.transaction_id
    const status = body.status || body.event || ''
    const rawAmount = body.amount || 0
    const amount = typeof rawAmount === 'number' ? (rawAmount > 1000 ? rawAmount / 100 : rawAmount) : 0
    const paidAt = body.paidAt || body.paid_at || new Date().toISOString()
    const email = body.customer?.email || body.email || ''
    const name = body.customer?.name || body.name || ''
    const plan = body.plan || body.metadata?.plan || null
    const productType = body.productType || body.metadata?.productType || 'plan'

    if (!transactionId) {
      return NextResponse.json({ received: false, error: 'Missing transaction ID' }, { status: 400 })
    }

    if (status === 'paid' || status === 'approved' || status === 'completed') {
      markTransactionPaid({
        transactionId: String(transactionId),
        amount,
        paidAt,
        email: email ? String(email).toLowerCase() : undefined,
      })
      global.velanaConfirmedPayments.set(String(transactionId), {
        status: 'paid',
        amount,
        paidAt,
      })

      if (email && amount > 0) {
        const result = await applyVerifiedPayment({
          email: String(email),
          name: String(name || ''),
          amount,
          plan,
          productType: String(productType),
          transactionId: String(transactionId),
        })
        await writeAuditLog({
          actor: 'webhook:velana',
          action: 'PAYMENT',
          target: String(email),
          after: result.ok ? `paid:${amount}` : `error:${result.error}`,
          meta: `tx=${transactionId}`,
        })
      }
    } else if (status === 'expired' || status === 'cancelled' || status === 'refunded') {
      global.velanaConfirmedPayments.set(String(transactionId), {
        status: String(status),
        amount,
        paidAt,
      })
    }

    return NextResponse.json({ received: true, transactionId, status })
  } catch (err: any) {
    console.error('[Velana Webhook] Error:', err)
    return NextResponse.json({ received: false, error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ confirmed: false, error: 'Missing transaction ID' }, { status: 400 })
  }

  const payment = global.velanaConfirmedPayments.get(id)
  if (payment && payment.status === 'paid') {
    return NextResponse.json({
      confirmed: true,
      status: 'paid',
      amount: payment.amount,
      paidAt: payment.paidAt,
    })
  }

  return NextResponse.json({ confirmed: false, status: payment?.status || 'pending' })
}
