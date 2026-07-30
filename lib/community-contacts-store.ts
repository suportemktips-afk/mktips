import type { SupabaseClient } from '@supabase/supabase-js'

export const COMMUNITY_CONTACTS_BUCKET = 'mktips-private'
export const COMMUNITY_CONTACTS_PATH = 'community-contacts.json'
export const COMMUNITY_LEAVERS_PATH = 'community-leavers.json'

export type CommunityContactRow = {
  phone: string
  display_name?: string
  whatsapp_jid?: string
  community_jid: string
  community_name: string
  is_admin?: boolean
  synced_at?: string
}

export type CommunityLeaverRow = {
  phone: string
  display_name?: string
  whatsapp_jid?: string
  community_jid: string
  community_name?: string
  left_at?: string
  still_in_other_community?: boolean
  recovery_sent_at?: string | null
  recovery_status?: string
  returned_at?: string
}

export function mapRowsToContacts(rows: CommunityContactRow[]) {
  return rows.map((row, index) => ({
    id: `${row.phone}-${row.community_jid}-${index}`,
    name: row.display_name || row.phone,
    phone: row.phone,
    hasWhatsApp: true,
    tags: row.is_admin ? ['Admin', row.community_name] : [row.community_name],
    plan: 'Comunidade',
    tipster: '—',
    origin: 'WhatsApp Comunidade',
    communityId: row.community_jid,
    communityName: row.community_name,
    status: 'active' as const,
    syncedAt: row.synced_at,
  }))
}

export function mapLeaversToContacts(rows: CommunityLeaverRow[]) {
  return rows
    .filter((row) => row.recovery_status !== 'returned' && !row.returned_at)
    .map((row, index) => ({
      id: `left-${row.phone}-${row.community_jid}-${index}`,
      name: row.display_name || row.phone,
      phone: row.phone,
      hasWhatsApp: true,
      tags: [
        'Ex-membro',
        row.community_name || 'Comunidade',
        row.recovery_status === 'sent' ? 'Recovery enviado' : 'Recovery pendente',
      ],
      plan: 'Saiu',
      tipster: '—',
      origin: 'Saiu da comunidade',
      communityId: null,
      communityName: row.community_name || null,
      status: 'left' as const,
      leftAt: row.left_at,
      recoveryStatus: row.recovery_status || 'pending',
    }))
}

export async function ensureContactsBucket(admin: SupabaseClient) {
  const { data: buckets } = await admin.storage.listBuckets()
  const exists = (buckets || []).some((b) => b.name === COMMUNITY_CONTACTS_BUCKET)
  if (!exists) {
    const { error } = await admin.storage.createBucket(COMMUNITY_CONTACTS_BUCKET, {
      public: false,
      fileSizeLimit: 50 * 1024 * 1024,
    })
    if (error && !/already exists/i.test(error.message)) {
      throw error
    }
  }
}

export async function saveContactsToStorage(
  admin: SupabaseClient,
  rows: CommunityContactRow[],
  syncedAt: string,
) {
  await ensureContactsBucket(admin)
  const payload = JSON.stringify({ syncedAt, rows })
  const { error } = await admin.storage
    .from(COMMUNITY_CONTACTS_BUCKET)
    .upload(COMMUNITY_CONTACTS_PATH, payload, {
      contentType: 'application/json',
      upsert: true,
    })
  if (error) throw error
}

export async function loadContactsFromStorage(admin: SupabaseClient): Promise<CommunityContactRow[]> {
  const { data, error } = await admin.storage.from(COMMUNITY_CONTACTS_BUCKET).download(COMMUNITY_CONTACTS_PATH)
  if (error || !data) return []
  const parsed = JSON.parse(await data.text()) as { rows?: CommunityContactRow[] }
  return Array.isArray(parsed.rows) ? parsed.rows : []
}

export async function loadLeaversFromStorage(admin: SupabaseClient): Promise<CommunityLeaverRow[]> {
  const { data, error } = await admin.storage.from(COMMUNITY_CONTACTS_BUCKET).download(COMMUNITY_LEAVERS_PATH)
  if (error || !data) return []
  try {
    const parsed = JSON.parse(await data.text()) as { items?: CommunityLeaverRow[] }
    return Array.isArray(parsed.items) ? parsed.items : []
  } catch {
    return []
  }
}
