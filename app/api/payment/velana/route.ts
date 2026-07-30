import { NextRequest, NextResponse } from 'next/server'
import {
  checkRateLimit,
  clientIp,
  createPaymentStatusToken,
  hasValidAdminSession,
  hasValidUserSession,
  verifyPaymentStatusToken,
} from '@/lib/auth-server'
import { expectedAmountForProduct, markTransactionPaid } from '@/lib/payment-security'

export async function POST(req: NextRequest) {
  try {
    const authed = hasValidUserSession(req) || hasValidAdminSession(req)
    const ip = clientIp(req)
    const rl = checkRateLimit(authed ? `velana:${ip}` : `velana-anon:${ip}`, authed ? 15 : 5, 15 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json({ success: false, error: 'Limite de cobranças excedido.' }, { status: 429 })
    }

    const body = await req.json()
    const { email, name, description, cpf } = body
    const productKey = String(body.plan || body.product || description || '')
    const catalogAmount = expectedAmountForProduct(productKey)
    const requested = Number(body.amount) || 0
    const amount = catalogAmount != null ? catalogAmount : requested

    if (!email || !(amount >= 1)) {
      return NextResponse.json(
        {
          success: false,
          error:
            Number(body.amount) === 0 || amount === 0
              ? 'Teste grátis não usa Pix. Ative pelo fluxo Free sem pagamento.'
              : 'E-mail e valor inválidos (mín. R$ 1,00).',
        },
        { status: 400 },
      )
    }

    // Anti-tamper: se há catálogo, não aceitar amount menor
    if (catalogAmount != null && requested > 0 && requested + 0.05 < catalogAmount) {
      return NextResponse.json({ success: false, error: 'Valor inconsistente com o produto.' }, { status: 400 })
    }

    const secretKey = process.env.VELANA_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ success: false, error: 'Gateway Pix não configurado.' }, { status: 503 })
    }

    const basicAuth = Buffer.from(`${secretKey}:x`).toString('base64')
    const cleanCpf = cpf ? String(cpf).replace(/\D/g, '') : '00000000000'
    const docType = cleanCpf.length === 14 ? 'cnpj' : 'cpf'

    const response = await fetch('https://api.velana.com.br/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        paymentMethod: 'pix',
        customer: {
          name: name || 'Cliente MK Tips',
          email,
          document: { number: cleanCpf, type: docType },
        },
        items: [
          {
            title: description || 'Pagamento Pix MK Tips',
            unitPrice: Math.round(amount * 100),
            quantity: 1,
            tangible: false,
          },
        ],
        pix: { expiresIn: 3600 },
        metadata: {
          plan: body.plan || null,
          productType: body.productType || 'plan',
          email,
        },
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { success: false, error: `Erro Velana API (${response.status})` },
        { status: response.status },
      )
    }

    const data = await response.json()
    const qrCodeVal =
      data.pix?.qrcode ||
      data.pix?.qrCode ||
      data.pix?.copiaCola ||
      data.pix?.qr_code ||
      data.qrCode ||
      data.copiaCola
    const txIdVal = data.id || data.transactionId || null

    if (!qrCodeVal || !txIdVal) {
      return NextResponse.json(
        { success: false, error: 'QR Code Pix não encontrado na resposta do gateway' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      provider: 'velana',
      qrCode: qrCodeVal,
      transactionId: txIdVal,
      amount,
      statusToken: createPaymentStatusToken(String(txIdVal)),
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Erro Pix' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const statusToken =
      req.headers.get('x-payment-status-token') ||
      searchParams.get('token') ||
      ''

    const sessionOk = hasValidUserSession(req) || hasValidAdminSession(req)
    const tokenOk = id ? verifyPaymentStatusToken(statusToken, id) : false
    if (!sessionOk && !tokenOk) {
      return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
    }

    const ip = clientIp(req)
    const rl = checkRateLimit(`velana-status:${ip}`, 60, 15 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json({ success: false, error: 'Limite excedido.' }, { status: 429 })
    }

    if (!id || !/^[a-zA-Z0-9_-]{6,128}$/.test(id)) {
      return NextResponse.json({ success: false, error: 'ID da transação inválido' }, { status: 400 })
    }

    const secretKey = process.env.VELANA_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ success: false, error: 'Gateway não configurado.' }, { status: 503 })
    }
    const basicAuth = Buffer.from(`${secretKey}:x`).toString('base64')

    const response = await fetch(`https://api.velana.com.br/v1/transactions/${id}`, {
      method: 'GET',
      headers: { Authorization: `Basic ${basicAuth}` },
    })

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'Erro ao buscar status' }, { status: response.status })
    }

    const data = await response.json()
    const paid = data.status === 'paid' || data.status === 'approved' || data.status === 'completed'
    if (paid) {
      const rawAmount = Number(data.amount) || 0
      const amount = rawAmount > 1000 ? rawAmount / 100 : rawAmount
      markTransactionPaid({
        transactionId: id,
        amount,
        email: data.customer?.email || data.email,
      })
    }

    return NextResponse.json({
      success: true,
      status: data.status,
      paid,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
