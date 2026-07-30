'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { db } from '@/lib/db'
import { Bell, LifeBuoy } from 'lucide-react'

export default function AdminNotificationsPage() {
  const [logs, setLogs] = useState(db.getLogs())
  const [openTickets, setOpenTickets] = useState(0)

  useEffect(() => {
    const load = async () => {
      await db.refresh()
      setLogs(db.getLogs())
      setOpenTickets(db.getTickets().filter((t) => t.status === 'Aberto').length)
    }
    load()
    const onUpdate = () => {
      setLogs(db.getLogs())
      setOpenTickets(db.getTickets().filter((t) => t.status === 'Aberto').length)
    }
    window.addEventListener('oddvault_db_update', onUpdate)
    return () => window.removeEventListener('oddvault_db_update', onUpdate)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-white">
          <Bell className="h-7 w-7 text-emerald-500" />
          Notificações do painel
        </h1>
        <p className="text-sm text-zinc-400">Logs de auditoria e alertas operacionais.</p>
      </div>

      {openTickets > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div className="flex items-center gap-2 text-amber-200">
              <LifeBuoy className="h-5 w-5" />
              <span>
                <strong>{openTickets}</strong> ticket(s) de suporte aguardando resposta
              </span>
            </div>
            <Link
              href="/mktipsadmin/dashboard/support"
              className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-100 hover:bg-amber-500/30"
            >
              Abrir suporte
            </Link>
          </CardContent>
        </Card>
      )}

      <Card className="border-zinc-850 bg-zinc-900/20">
        <CardHeader>
          <CardTitle className="text-base font-bold">Eventos recentes</CardTitle>
          <CardDescription>Criação de tips, resoluções e ações de admin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-lg border border-zinc-850 bg-zinc-900/40 p-3.5"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-white">{log.type}</span>
                    <span className="text-[9px] text-zinc-500">
                      {log.timestamp.replace('T', ' ').split('.')[0]}
                    </span>
                  </div>
                  <p className="leading-relaxed text-zinc-400">{log.message}</p>
                  {log.user && (
                    <p className="text-[9px] text-zinc-600">
                      {log.user} · {log.ip}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-zinc-500">Nenhum log ainda. Publique uma tip para ver eventos aqui.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
