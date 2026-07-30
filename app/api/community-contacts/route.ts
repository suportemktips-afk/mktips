import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  loadContactsFromStorage,
  loadLeaversFromStorage,
  mapLeaversToContacts,
  mapRowsToContacts,
} from '@/lib/community-contacts-store'
import { authorizeAdminOrCron } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  if (!authorizeAdminOrCron(req)) {
    return NextResponse.json({ ok: false, contacts: [], error: 'Não autorizado.' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  if (!admin) {
    return NextResponse.json({ ok: false, contacts: [], error: 'Supabase não configurado.' }, { status: 500 })
  }

  let rows = await loadContactsFromStorage(admin)

  if (rows.length === 0) {
    const { data, error } = await admin
      .from('community_contacts')
      .select('*')
      .order('community_name', { ascending: true })
      .order('phone', { ascending: true })

    if (!error && data?.length) {
      rows = data.map((row) => ({
        phone: row.phone,
        display_name: row.display_name,
        whatsapp_jid: row.whatsapp_jid,
        community_jid: row.community_jid,
        community_name: row.community_name,
        is_admin: row.is_admin,
        synced_at: row.synced_at,
      }))
    }
  }

  const active = mapRowsToContacts(rows)
  const leavers = mapLeaversToContacts(await loadLeaversFromStorage(admin))
  const activePhones = new Set(active.map((c) => c.phone.replace(/\D/g, '')))
  const leftOnly = leavers.filter((c) => !activePhones.has(c.phone.replace(/\D/g, '')))
  const contacts = [...active, ...leftOnly]
  const uniquePhones = new Set(contacts.map((c) => c.phone))

  return NextResponse.json({
    ok: true,
    contacts,
    total: contacts.length,
    uniquePhones: uniquePhones.size,
    activeCount: active.length,
    leftCount: leftOnly.length,
    source: rows.length ? 'storage-or-table' : leftOnly.length ? 'leavers' : 'empty',
  })
}
