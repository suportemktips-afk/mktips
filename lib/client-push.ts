'use client'

const PREFS_KEY = 'mktips_notif_prefs'
const LAST_SEEN_KEY = 'mktips_notif_last_seen_id'

export type NotifPrefs = {
  newTip: boolean
  result: boolean
}

export function getNotifPrefs(): NotifPrefs {
  if (typeof window === 'undefined') return { newTip: true, result: true }
  try {
    return { newTip: true, result: true, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }
  } catch {
    return { newTip: true, result: true }
  }
}

export function setNotifPrefs(prefs: Partial<NotifPrefs>) {
  const next = { ...getNotifPrefs(), ...prefs }
  localStorage.setItem(PREFS_KEY, JSON.stringify(next))
}

export function getLastSeenNotificationId(): string {
  return localStorage.getItem(LAST_SEEN_KEY) || ''
}

export function setLastSeenNotificationId(id: string) {
  localStorage.setItem(LAST_SEEN_KEY, id)
}

/** Push no celular (PWA) e desktop via Service Worker ou Notification API */
export async function showClientPush(title: string, body: string, url = '/dashboard/tips') {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const payload = {
    type: 'SHOW_NOTIFICATION',
    title,
    body,
    icon: '/icon-192.png',
    url,
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.register('/sw.js').catch(() => null)
      if (reg) {
        await navigator.serviceWorker.ready
        reg.active?.postMessage(payload)
        return
      }
    }
    new Notification(title, { body, icon: '/logo-mktips.png', tag: 'mktips-tip' })
  } catch {
    /* ignore */
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const p = await Notification.requestPermission()
  return p === 'granted'
}
