import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { hasValidAdminSession } from '@/lib/auth-server'

/**
 * Lista pagamentos confirmados (tabela payments).
 * Usado pelo dashboard admin para faturamento dia a dia.
 */
export async function GET(req: NextRequest) {
  try {
    if (!hasValidAdminSession(req)) {
      return NextResponse.json(
        { ok: false, error: 'Não autorizado.', payments: [] },
        { status: 401 },
      )
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: 'Banco não configurado (SUPABASE_SERVICE_ROLE_KEY).', payments: [] },
        { status: 500 },
      )
    }

    const { data, error } = await admin
      .from('payments')
      .select('id, user_id, email, amount, plan, product_type, transaction_id, status, created_at')
      .eq('status', 'paid')
      .order('created_at', { ascending: true })

    if (error) {
      if (error.code === '42P01' || /does not exist|relation/i.test(error.message)) {
        return NextResponse.json({ ok: true, payments: [], tableMissing: true })
      }
      return NextResponse.json({ ok: false, error: error.message, payments: [] }, { status: 500 })
    }

    return NextResponse.json({ ok: true, payments: data || [] })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Erro ao listar pagamentos.', payments: [] },
      { status: 500 },
    )
  }
}
