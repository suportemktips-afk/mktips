'use client'

import { useEffect, useRef } from 'react'
import {
  getLastSeenNotificationId,
  getNotifPrefs,
  setLastSeenNotificationId,
  showClientPush,
  ensureNotificationPermission,
} from '@/lib/client-push'

/**
 * Observa novas tips no feed e dispara push (mobile PWA + desktop).
 */
export function TipNotificationWatcher() {
  const polling = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('oddvault_user_session') !== 'true') return

    const poll = async () => {
      if (polling.current) return
      polling.current = true
      try {
        const res = await fetch('/api/notifications/feed', { cache: 'no-store' })
        const data = await res.json()
        const items = (data?.items || []) as {
          id: string
          type: string
          title: string
          body: string
          createdAt: string
        }[]
        if (!items.length) return

        const prefs = getNotifPrefs()
        const lastSeen = getLastSeenNotificationId()
        const newest = items[0]

        if (!lastSeen) {
          setLastSeenNotificationId(newest.id)
          return
        }

        const fresh: typeof items = []
        for (const item of items) {
          if (item.id === lastSeen) break
          fresh.push(item)
        }

        if (fresh.length === 0) return

        const toShow = fresh
          .reverse()
          .filter((i) => (i.type === 'tip_result' ? prefs.result : prefs.newTip))

        for (const item of toShow) {
          await showClientPush(item.title, item.body)
        }

        setLastSeenNotificationId(newest.id)
        window.dispatchEvent(new CustomEvent('mktips_notifications_update'))
      } catch {
        /* ignore */
      } finally {
        polling.current = false
      }
    }

    ensureNotificationPermission().then(() => {
      poll()
    })

    const interval = setInterval(poll, 25000)
    const onFocus = () => poll()
    window.addEventListener('focus', onFocus)
    window.addEventListener('mktips_force_notif_poll', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('mktips_force_notif_poll', onFocus)
    }
  }, [])

  return null
}
