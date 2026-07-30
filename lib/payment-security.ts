import { getSupabaseAdmin } from '@/lib/supabase-admin'

declare global {
  // eslint-disable-next-line no-var
  var mktipsPaidTransactions: Map<
    string,
    { status: string; amount: number; paidAt: string; email?: string; applied?: boolean }
  >
}

if (!global.mktipsPaidTransactions) {
  global.mktipsPaidTransactions = new Map()
}

export function markTransactionPaid(input: {
  transactionId: string
  amount: number
  paidAt?: string
  email?: string
}) {
  global.mktipsPaidTransactions.set(input.transactionId, {
    status: 'paid',
    amount: input.amount,
    paidAt: input.paidAt || new Date().toISOString(),
    email: input.email,
    applied: false,
  })
}

export function getPaidTransaction(transactionId: string) {
  return global.mktipsPaidTransactions.get(transactionId) || null
}

export function consumePaidTransaction(transactionId: string) {
  const row = global.mktipsPaidTransactions.get(transactionId)
  if (!row || row.status !== 'paid') return null
  row.applied = true
  global.mktipsPaidTransactions.set(transactionId, row)
  return row
}

const ALLOWED_PLANS = ['Free', 'Starter', 'Premium', 'VIP Anual'] as const

export function resolvePlan(plan: string | null | undefined): string | null {
  if (!plan) return null
  if (ALLOWED_PLANS.includes(plan as (typeof ALLOWED_PLANS)[number])) return plan
  const lower = plan.toLowerCase()
  if (lower.includes('vip')) return 'VIP Anual'
  if (lower.includes('starter')) return 'Starter'
  if (lower.includes('premium')) return 'Premium'
  return null
}

/** Catálogo server-side — nunca confiar no amount do cliente. */
export const PRODUCT_PRICES: Record<string, number> = {
  starter: 49.9,
  'starter mensal': 49.9,
  premium: 97.9,
  'vip anual': 497.9,
  'alavancagem starter': 29.9,
  'alavancagem pro': 97,
  'alavancagem elite': 197,
  starter_challenge: 29.9,
  pro: 97,
  elite: 197,
}

export function expectedAmountForProduct(planOrProduct: string | null | undefined): number | null {
  if (!planOrProduct) return null
  const key = planOrProduct.trim().toLowerCase()
  if (PRODUCT_PRICES[key] != null) return PRODUCT_PRICES[key]
  for (const [k, v] of Object.entries(PRODUCT_PRICES)) {
    if (key.includes(k)) return v
  }
  return null
}

export async function applyVerifiedPayment(input: {
  email: string
  name?: string
  amount: number
  plan?: string | null
  productType?: string
  transactionId: string
  phone?: string
  cpf?: string
}): Promise<{ ok: true; user: any } | { ok: false; error: string; status: number }> {
  const email = input.email.trim().toLowerCase()
  const amount = Number(input.amount) || 0
  const transactionId = String(input.transactionId || '')

  if (!email || amount <= 0 || !transactionId) {
    return { ok: false, error: 'E-mail, valor e transactionId obrigatórios.', status: 400 }
  }

  const paid = getPaidTransaction(transactionId)
  if (!paid || paid.status !== 'paid') {
    return { ok: false, error: 'Pagamento não verificado no gateway.', status: 403 }
  }
  if (paid.applied) {
    return { ok: false, error: 'Transação já processada.', status: 409 }
  }
  if (!(paid.amount > 0)) {
    return { ok: false, error: 'Valor do pagamento verificado inválido.', status: 400 }
  }
  // Tolerância de arredondamento
  if (Math.abs(paid.amount - amount) > 0.05) {
    return { ok: false, error: 'Valor não confere com o pagamento verificado.', status: 400 }
  }
  if (paid.email && paid.email.toLowerCase() !== email) {
    return { ok: false, error: 'E-mail não confere com o pagamento.', status: 403 }
  }

  const productType = String(input.productType || 'plan')
  const resolvedPlan = resolvePlan(input.plan)

  // Plano pago deve bater com o catálogo de preços
  if (productType === 'plan' && resolvedPlan && resolvedPlan !== 'Free') {
    const expected = expectedAmountForProduct(resolvedPlan)
    if (expected == null || Math.abs(paid.amount - expected) > 1) {
      return {
        ok: false,
        error: 'Valor pago não corresponde ao plano solicitado.',
        status: 400,
      }
    }
  }
  if (productType === 'challenge' || productType === 'alavancagem') {
    const expected = expectedAmountForProduct(input.plan || productType)
    if (expected != null && Math.abs(paid.amount - expected) > 1) {
      return { ok: false, error: 'Valor pago não corresponde ao produto.', status: 400 }
    }
  }

  const admin = getSupabaseAdmin()
  if (!admin) {
    return { ok: false, error: 'Banco não configurado.', status: 500 }
  }

  const { data: existingPay } = await admin
    .from('payments')
    .select('id')
    .eq('transaction_id', transactionId)
    .eq('status', 'paid')
    .maybeSingle()
  if (existingPay) {
    consumePaidTransaction(transactionId)
    return { ok: false, error: 'Transação já processada.', status: 409 }
  }

  const { data: existing, error: findErr } = await admin
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (findErr) return { ok: false, error: findErr.message, status: 500 }

  const now = new Date().toISOString()
  let user = existing

  if (!user) {
    const id = crypto.randomUUID()
    const insertRow: Record<string, unknown> = {
      id,
      name: input.name || email.split('@')[0],
      email,
      phone: input.phone || '',
      cpf: input.cpf || '',
      city: '',
      country: 'Brasil',
      language: 'pt-BR',
      plan: productType === 'plan' && resolvedPlan ? resolvedPlan : 'Free',
      role: 'User',
      status: 'Ativo',
      created_at: now,
      last_login: now,
      last_login_ip: '0.0.0.0',
      device: 'Web App',
      os: '',
      browser: '',
      days_remaining:
        productType === 'plan' && resolvedPlan === 'VIP Anual'
          ? 365
          : productType === 'plan'
            ? 30
            : 7,
      revenue_generated: amount,
      total_paid: amount,
      last_payment_date: now,
      bankroll: 0,
      bankroll_currency: 'R$',
      roi_individual: 0,
    }
    const { data: created, error: createErr } = await admin
      .from('users')
      .insert(insertRow)
      .select('id, name, email, plan, status, days_remaining, total_paid')
      .single()
    if (createErr) return { ok: false, error: createErr.message, status: 500 }
    user = created
  } else {
    const patch: Record<string, unknown> = {
      total_paid: Number(user.total_paid || 0) + amount,
      revenue_generated: Number(user.revenue_generated || 0) + amount,
      last_payment_date: now,
    }
    if (productType === 'plan' && resolvedPlan) {
      patch.plan = resolvedPlan
      patch.days_remaining = resolvedPlan === 'VIP Anual' ? 365 : 30
      patch.status = 'Ativo'
    }
    if (input.name) patch.name = input.name
    if (input.phone) patch.phone = input.phone
    if (input.cpf) patch.cpf = input.cpf

    const { data: updated, error: updateErr } = await admin
      .from('users')
      .update(patch)
      .eq('id', user.id)
      .select('id, name, email, plan, status, days_remaining, total_paid')
      .single()
    if (updateErr) return { ok: false, error: updateErr.message, status: 500 }
    user = updated
  }

  const { error: payLogErr } = await admin.from('payments').insert({
    id: crypto.randomUUID(),
    user_id: user.id,
    email,
    amount,
    plan: resolvedPlan || productType,
    product_type: productType,
    transaction_id: transactionId,
    status: 'paid',
    created_at: now,
  })
  if (payLogErr) {
    // unique violation = already applied
    if (/duplicate|unique/i.test(payLogErr.message)) {
      consumePaidTransaction(transactionId)
      return { ok: false, error: 'Transação já processada.', status: 409 }
    }
    console.warn('payments log skipped:', payLogErr.message)
  }

  consumePaidTransaction(transactionId)
  return { ok: true, user }
}
