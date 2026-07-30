'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { db, DBUser } from '@/lib/db'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { tipsterNavFlat } from '@/lib/nav-config'

export default function TipsterLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<DBUser | null>(null)
  const [allUsers, setAllUsers] = useState<DBUser[]>([])

  useEffect(() => {
    const handleUpdate = () => {
      if (!db.isReady()) return
      const activeUser = db.getActiveUser()
      setUser(activeUser)
      // Never list Master/Admin in tipster account switcher
      setAllUsers(db.getUsers().filter((u) => u.role === 'Tipster' || u.role === 'User'))

      if (activeUser.role !== 'Tipster') {
        if (['Master', 'Admin', 'Gerente'].includes(activeUser.role)) {
          router.push('/mktipsadmin/dashboard')
        } else {
          router.push('/dashboard')
        }
        return
      }

      if (activeUser.status === 'Pendente' || activeUser.status === 'Bloqueado') {
        router.push('/tipster/register?pending=1')
      }
    }

    handleUpdate()
    window.addEventListener('oddvault_db_update', handleUpdate)
    return () => window.removeEventListener('oddvault_db_update', handleUpdate)
  }, [router])

  if (!user || user.role !== 'Tipster') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-emerald-500" />
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'logout' }),
      })
    } catch {
      // ignore
    }
    localStorage.removeItem('oddvault_user_session')
    db.clearActiveUser()
    window.location.href = '/'
  }

  const sidebarFooter = (
    <>
      <div className="rounded-lg border border-zinc-850 bg-zinc-900/40 p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[9px] font-extrabold uppercase text-zinc-500">Tipster ID</span>
          <span className="rounded border border-zinc-850 bg-zinc-900 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400">
            {user.tipsterId}
          </span>
        </div>
        <p className="mt-2 text-[10px] text-zinc-400">
          Você está visualizando apenas os seus dados e os seus clientes.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-zinc-900 bg-zinc-900/20 px-3 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold uppercase text-black">
          {user.name.charAt(0)}
        </div>
        <div className="truncate">
          <p className="text-xs font-semibold text-white">{user.name}</p>
          <p className="truncate text-[9px] text-zinc-500">{user.email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-red-500/5 hover:text-red-400"
      >
        <LogOut className="h-4 w-4 text-zinc-500" />
        Sair
      </button>
    </>
  )

  const header = (
    <>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-bold uppercase tracking-wider text-white">
          Painel do Tipster
        </h2>
      </div>

      {allUsers.length > 1 && (
        <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-850 bg-zinc-900 px-2.5 py-1 text-[10px]">
          <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">Simulador:</span>
          <select
            value={user.id}
            onChange={(e) => db.setActiveUser(e.target.value)}
            className="cursor-pointer border-none bg-transparent pr-5 text-[10px] font-bold text-white outline-none focus:ring-0"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} className="bg-zinc-950 font-bold text-white">
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  )

  return (
    <DashboardShell
      homeHref="/tipster/dashboard"
      brandTitle={
        <div className="flex flex-col">
          <span className="text-sm font-black leading-none text-white">MK TIPS</span>
          <span className="mt-1 text-[8px] font-bold tracking-widest text-emerald-400">
            PAINEL DO ANALISTA
          </span>
        </div>
      }
      desktopMenuItems={tipsterNavFlat}
      mobileNavGroups={[{ title: 'Tipster', items: tipsterNavFlat }]}
      sidebarFooter={sidebarFooter}
      header={header}
      mobileUser={user}
      mobileBrandTitle="MK Tips"
      mobileBrandBadge="Painel Tipster"
      onLogout={handleLogout}
    >
      {children}
    </DashboardShell>
  )
}
