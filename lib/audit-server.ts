import { getSupabaseAdmin } from '@/lib/supabase-admin'

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTER'
  | 'PAYMENT'
  | 'PLAN_CHANGE'
  | 'TIP_CREATE'
  | 'TIP_DELETE'
  | 'ADMIN_CHANGE'
  | 'USER_DELETE'
  | 'SECURITY'

export async function writeAuditLog(params: {
  actor: string
  action: AuditAction
  target?: string
  before?: string
  after?: string
  ip?: string
  meta?: string
}): Promise<void> {
  const admin = getSupabaseAdmin()
  if (!admin) {
    console.info('[audit]', params.action, params.actor, params.target || '', params.meta || '')
    return
  }
  const now = new Date().toISOString()
  try {
    await admin.from('audit_logs').insert({
      id: crypto.randomUUID(),
      timestamp: now,
      admin_user: params.actor,
      action: params.action,
      target_user: params.target || '',
      before_value: params.before || '',
      after_value: params.after || params.meta || '',
    })
  } catch (e) {
    console.warn('[audit] failed', e)
  }
  try {
    await admin.from('logs').insert({
      type: params.action,
      message: params.meta || `${params.action} ${params.target || ''}`.trim(),
      ip: params.ip || '0.0.0.0',
      device: 'Server',
      user: params.actor,
      timestamp: now,
    })
  } catch {
    // tabela opcional
  }
}
