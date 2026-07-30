'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { db, DBLog } from '@/lib/db'
import { Bell } from 'lucide-react'
import {
  getNotifPrefs,
  setNotifPrefs,
  ensureNotificationPermission,
} from '@/lib/client-push'

type FeedItem = {
  id: string
  title: string
  body: string
  createdAt: string
  type: string
}

export default function UserNotificationsPage() {
  const [logs, setLogs] = useState<DBLog[]>([])
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [pushOk, setPushOk] = useState(false)
  const [alerts, setAlerts] = useState([
    {
      id: 'tip',
      key: 'newTip' as const,
      label: 'Nova Tip publicada',
      desc: 'Alerta no celular e no desktop quando sair entrada nova.',
      enabled: true,
    },
    {
      id: 'result',
      key: 'result' as const,
      label: 'Resultado final das Tips',
      desc: 'Green, Red ou Void.',
      enabled: true,
    },
  ])

  const loadFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/feed', { cache: 'no-store' })
      const data = await res.json()
      setFeed((data?.items || []).slice(0, 15))
    } catch {
      setFeed([])
    }
  }, [])

  useEffect(() => {
    const prefs = getNotifPrefs()
    setAlerts((a) =>
      a.map((row) => ({
        ...row,
        enabled: row.key === 'result' ? prefs.result : prefs.newTip,
      })),
    )
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushOk(Notification.permission === 'granted')
    }

    const init = async () => {
      await db.refresh()
      // Cliente: só feed de tips — nunca logs internos/admin
      setLogs([])
      await loadFeed()
    }
    init()

    const handleUpdate = () => {
      setLogs([])
      loadFeed()
    }

    window.addEventListener('oddvault_db_update', handleUpdate)
    window.addEventListener('mktips_notifications_update', handleUpdate)
    return () => {
      window.removeEventListener('oddvault_db_update', handleUpdate)
      window.removeEventListener('mktips_notifications_update', handleUpdate)
    }
  }, [loadFeed])

  const toggleAlert = (id: string) => {
    setAlerts((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
      const tip = next.find((x) => x.id === 'tip')
      const result = next.find((x) => x.id === 'result')
      setNotifPrefs({
        newTip: tip?.enabled ?? true,
        result: result?.enabled ?? true,
      })
      return next
    })
  }

  const enablePush = async () => {
    const ok = await ensureNotificationPermission()
    setPushOk(ok)
    if (ok) window.dispatchEvent(new CustomEvent('mktips_force_notif_poll'))
  }

  const messages = [
    ...feed.map((f) => ({
      id: f.id,
      title: f.title,
      body: f.body,
      time: f.createdAt,
      kind: 'feed' as const,
    })),
    ...logs.map((log) => ({
      id: log.id,
      title: 'Sistema',
      body: log.message,
      time: log.timestamp,
      kind: 'log' as const,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-white">
          <Bell className="h-7 w-7 text-emerald-500" />
          Central de Notificações
        </h1>
        <p className="text-sm text-zinc-400">
          Ative o push no navegador ou no app instalado para receber tips no celular e no PC.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-zinc-850 bg-zinc-900/20">
            <CardHeader>
              <CardTitle className="text-base font-bold">Mensagens recentes</CardTitle>
              <CardDescription>Novas tips e comunicados do MK Tips.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={`${msg.kind}-${msg.id}`}
                    className="flex items-start gap-3 rounded-lg border border-zinc-850 bg-zinc-900/40 p-3.5"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="font-bold text-white">{msg.title}</span>
                        <span className="text-[9px] text-zinc-550">
                          {msg.time.replace('T', ' ').split('.')[0]}
                        </span>
                      </div>
                      <p className="leading-relaxed text-zinc-400">{msg.body}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-zinc-550">
                  <Bell className="h-8 w-8 text-zinc-650" />
                  <p className="font-semibold">Nenhum alerta no momento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-zinc-850 bg-zinc-900/30">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Push no dispositivo</CardTitle>
              <CardDescription>Celular (PWA) e desktop com o site aberto ou instalado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {pushOk ? (
                <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 font-semibold text-emerald-400">
                  Notificações ativas neste dispositivo.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={enablePush}
                  className="w-full rounded-lg bg-emerald-500 py-2.5 text-xs font-bold text-black hover:bg-emerald-400"
                >
                  Ativar notificações
                </button>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-850 bg-zinc-900/30">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Preferências de push</CardTitle>
              <CardDescription>Eventos que disparam alertas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-850 bg-zinc-900/50 p-2.5"
                >
                  <div>
                    <h4 className="font-bold leading-tight text-white">{alert.label}</h4>
                    <p className="mt-0.5 text-[9px] text-zinc-500">{alert.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={alert.enabled}
                    onChange={() => toggleAlert(alert.id)}
                    className="h-4 w-4 cursor-pointer rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
