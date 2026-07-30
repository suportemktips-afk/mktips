import { NextRequest, NextResponse } from 'next/server'
import {
  checkRateLimit,
  clientIp,
  hasValidAdminSession,
  hasValidUserSession,
} from '@/lib/auth-server'
import { expectedAmountForProduct } from '@/lib/payment-security'

export async function POST(req: NextRequest) {
  try {
    const authed = hasValidUserSession(req) || hasValidAdminSession(req)
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Faça login para pagar com cartão.' }, { status: 401 })
    }

    const ip = clientIp(req)
    const rl = checkRateLimit(`cakto:${ip}`, 15, 15 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json({ success: false, error: 'Limite de cobranças excedido.' }, { status: 429 })
    }

    const body = await req.json()
    const { email, name, description } = body
    const productKey = String(body.plan || body.product || description || '')
    const catalogAmount = expectedAmountForProduct(productKey)
    const requested = Number(body.amount) || 0
    const amount = catalogAmount != null ? catalogAmount : requested

    if (!email || amount <= 0) {
      return NextResponse.json({ success: false, error: 'E-mail e valor inválidos.' }, { status: 400 })
    }

    const clientId = process.env.CAKTO_CLIENT_ID
    const clientSecret = process.env.CAKTO_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { success: false, error: 'Gateway de cartão não configurado.' },
        { status: 503 },
      )
    }

    const response = await fetch('https://api.cakto.com.br/v1/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientSecret}`,
        'X-Client-Id': clientId,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        payment_method: body.paymentMethod || 'credit_card',
        description: description || 'Assinatura MK Tips',
        customer: {
          name: name || 'Cliente MK Tips',
          email,
        },
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Erro Cakto API (${response.status})` },
        { status: response.status },
      )
    }

    const data = await response.json()
    const status = String(data.status || data.payment_status || '').toLowerCase()
    const paid = ['paid', 'approved', 'captured', 'authorized'].includes(status)
    const transactionId = data.id || data.transaction_id || null

    if (paid && transactionId) {
      const { markTransactionPaid } = await import('@/lib/payment-security')
      markTransactionPaid({
        transactionId: String(transactionId),
        amount,
        email: String(email).toLowerCase(),
      })
    }

    return NextResponse.json({
      success: true,
      provider: 'cakto',
      paid,
      status: status || 'pending',
      qrCode: data.pix?.qrCode || data.qr_code || null,
      qrCodeImage: data.pix?.qrCodeImage || data.qr_code_image || null,
      transactionId,
      amount,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
