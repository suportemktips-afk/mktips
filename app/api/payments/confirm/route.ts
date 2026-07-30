import { NextRequest, NextResponse } from 'next/server'
import { hasValidCronSecret, hasValidAdminSession } from '@/lib/auth-server'
import { applyVerifiedPayment, getPaidTransaction } from '@/lib/payment-security'
import { writeAuditLog } from '@/lib/audit-server'
import { clientIp } from '@/lib/auth-server'

/**
 * Confirma pagamento SOMENTE se a transação já foi marcada como paid
 * pelo webhook assinado (ou job interno com secret).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const name = String(body.name || '').trim()
    const amount = Number(body.amount) || 0
    const plan = body.plan ? String(body.plan) : null
    const productType = String(body.productType || 'plan')
    const transactionId = body.transactionId ? String(body.transactionId) : ''
    const phone = String(body.phone || '')
    const cpf = String(body.cpf || '')
    const ip = clientIp(req)

    if (!email || amount <= 0 || !transactionId) {
      return NextResponse.json(
        { ok: false, error: 'E-mail, valor e transactionId são obrigatórios.' },
        { status: 400 },
      )
    }

    const paid = getPaidTransaction(transactionId)
    const internalOverride =
      hasValidCronSecret(req) ||
      (hasValidAdminSession(req) && body.forceAdminConfirm === true)

    if (!paid && !internalOverride) {
      return NextResponse.json(
        { ok: false, error: 'Pagamento ainda não confirmado pelo gateway.' },
        { status: 403 },
      )
    }

    if (internalOverride && !paid) {
      // Admin/cron pode marcar antes de apply (suporte) — ainda exige transactionId único
      const { markTransactionPaid } = await import('@/lib/payment-security')
      markTransactionPaid({ transactionId, amount, email })
    }

    const result = await applyVerifiedPayment({
      email,
      name,
      amount,
      plan,
      productType,
      transactionId,
      phone,
      cpf,
    })

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status })
    }

    await writeAuditLog({
      actor: email,
      action: 'PAYMENT',
      target: result.user.id,
      after: plan || productType,
      meta: `tx=${transactionId} amount=${amount}`,
      ip,
    })

    if (plan) {
      await writeAuditLog({
        actor: email,
        action: 'PLAN_CHANGE',
        target: result.user.id,
        after: String(plan),
        ip,
      })
    }

    return NextResponse.json({ ok: true, user: result.user })
  } catch (e: any) {
    console.error('payment confirm error:', e)
    return NextResponse.json(
      { ok: false, error: e?.message || 'Erro ao confirmar pagamento.' },
      { status: 500 },
    )
  }
}
