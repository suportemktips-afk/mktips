import type { SupabaseClient } from '@supabase/supabase-js'

export const NOTIFICATIONS_BUCKET = 'mktips-private'
export const NOTIFICATIONS_PATH = 'notifications-feed.json'

export type TipAnnouncement = {
  id: string
  type: 'new_tip' | 'tip_result'
  title: string
  body: string
  match: string
  market?: string
  odd?: number
  createdAt: string
}

type FeedFile = { items: TipAnnouncement[] }

export async function loadNotificationFeed(admin: SupabaseClient): Promise<TipAnnouncement[]> {
  const { data, error } = await admin.storage.from(NOTIFICATIONS_BUCKET).download(NOTIFICATIONS_PATH)
  if (error || !data) return []
  try {
    const parsed = JSON.parse(await data.text()) as FeedFile
    return Array.isArray(parsed.items) ? parsed.items : []
  } catch {
    return []
  }
}

export async function appendTipAnnouncement(
  admin: SupabaseClient,
  item: Omit<TipAnnouncement, 'id' | 'createdAt' | 'type'> & { type?: TipAnnouncement['type'] },
): Promise<TipAnnouncement> {
  const items = await loadNotificationFeed(admin)
  const entry: TipAnnouncement = {
    id: crypto.randomUUID(),
    type: item.type || 'new_tip',
    title: item.title,
    body: item.body,
    match: item.match,
    market: item.market,
    odd: item.odd,
    createdAt: new Date().toISOString(),
  }
  const next = [entry, ...items].slice(0, 200)
  const payload = JSON.stringify({ items: next })
  const { error } = await admin.storage.from(NOTIFICATIONS_BUCKET).upload(NOTIFICATIONS_PATH, payload, {
    contentType: 'application/json',
    upsert: true,
  })
  if (error) throw error
  return entry
}
