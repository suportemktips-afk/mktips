'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Search, LogOut } from 'lucide-react'
import { db, DBUser } from '@/lib/db'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { userNavFlat, userNavGroups } from '@/lib/nav-config'
import { TipNotificationWatcher } from '@/components/tip-notification-watcher'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<DBUser | null>(null)
  const [allUsers, setAllUsers] = useState<DBUser[]>([])
  const [search, setSearch] = useState('')
  const [notifications, setNotifications] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const handleUpdate = () => {
      const activeUser = db.getActiveUser()
      if (!activeUser?.id) return

      // Auto-block Free trial after 7 days
      if (db.isFreeTrialExpired(activeUser)) {
        db.blockExpiredFreeUser(activeUser.id)
        localStorage.removeItem('oddvault_user_session')
        router.replace('/dashboard/subscription?expired=1')
        return
      }

      if (activeUser.status === 'Bloqueado') {
        router.replace('/dashboard/subscription?blocked=1')
        return
      }

      const daysLeft = db.getFreeTrialDaysLeft(activeUser)
      if (activeUser.plan === 'Free' && daysLeft !== activeUser.daysRemaining) {
        db.setUsers(
          db.getUsers().map((u) => (u.id === activeUser.id ? { ...u, daysRemaining: daysLeft } : u)),
        )
      }

      setUser({ ...activeUser, daysRemaining: daysLeft })
      // Never expose Master user list on mobile / public UI
      setAllUsers([])
      // Cliente: sino só com avisos de tips (sem logs de outros usuários/admin)
      setNotifications([])
    }

    const init = async () => {
      if (typeof window !== 'undefined') {
        const session = localStorage.getItem('oddvault_user_session')
        if (session !== 'true') {
          router.push('/login')
          return
        }
        // Remove dump antigo de todos os usuários (telefones) do browser
        const activeId = localStorage.getItem('mktips_active_user_id')
        try {
          const raw = localStorage.getItem('mktips_mock_users')
          if (raw && activeId) {
            const list = JSON.parse(raw) as { id: string }[]
            if (Array.isArray(list) && list.length > 1) {
              localStorage.setItem(
                'mktips_mock_users',
                JSON.stringify(list.filter((u) => u.id === activeId)),
              )
            }
          }
        } catch {
          /* ignore */
        }
      }
      await db.refresh()
      const activeUser = db.getActiveUser()
      const staffRoles = ['Master', 'Admin', 'Gerente', 'Suporte', 'Financeiro', 'Moderador']
      if (!activeUser?.id || staffRoles.includes(activeUser.role)) {
        // Staff must use /mktipsadmin — never the client dashboard
        localStorage.removeItem('oddvault_user_session')
        db.clearActiveUser()
        if (localStorage.getItem('oddvault_admin_session') === 'true') {
          router.replace('/mktipsadmin/dashboard')
        } else {
          router.replace('/login')
        }
        return
      }
      handleUpdate()
    }

    init()
    window.addEventListener('oddvault_db_update', handleUpdate)
    return () => window.removeEventListener('oddvault_db_update', handleUpdate)
  }, [router])

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-emerald-500" />
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('oddvault_user_session')
    localStorage.removeItem('oddvault_admin_session')
    db.clearActiveUser()
    window.location.href = '/'
  }

  const sidebarFooter = (
    <>
      <div className="rounded-lg border border-zinc-850 bg-zinc-900/40 p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-zinc-400">
            {user.plan === 'Free' ? 'TESTE GRÁTIS' : user.plan}
          </span>
          <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1 py-0.5 text-[9px] font-semibold text-emerald-400">
            {user.daysRemaining} dias restando
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${(user.daysRemaining / (user.plan === 'Free' ? 7 : 365)) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-zinc-900 bg-zinc-900/20 px-3 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold uppercase text-white">
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
        Sair da Conta
      </button>
    </>
  )

  const header = (
    <>
      <div className="relative min-w-0 flex-1 sm:max-w-none md:w-96">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-4 text-xs text-white transition-colors focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-4">
        {user.role === 'Master' && allUsers.length > 1 && (
          <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-zinc-850 bg-zinc-900 px-2.5 py-1 text-[10px]">
            <span className="hidden text-[8px] font-bold uppercase tracking-wider text-zinc-500 md:inline">
              Simulador:
            </span>
            <select
              value={user.id}
              onChange={(e) => db.setActiveUser(e.target.value)}
              className="cursor-pointer border-none bg-transparent pr-5 text-[10px] font-bold text-white outline-none focus:ring-0"
            >
              <option value={user.id} className="bg-zinc-950 font-bold text-white">
                {user.name.split(' ')[0]} (você)
              </option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-zinc-950 font-bold text-white">
                  {u.name.split(' ')[0]} ({u.role})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative cursor-pointer rounded-lg border border-zinc-850 bg-zinc-900 p-2 text-zinc-400 transition-all hover:border-zinc-700 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full border border-zinc-950 bg-emerald-500" />
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 z-50 mt-2 w-72 space-y-1 rounded-lg border border-zinc-850 bg-zinc-950 p-2 text-[10px] shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-900 p-2 font-bold text-white">
                <span>Notificações</span>
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setShowDropdown(false)}
                  className="text-[9px] text-emerald-400 hover:underline"
                >
                  Ver todas
                </Link>
              </div>
              <div className="max-h-60 divide-y divide-zinc-900 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="space-y-1 p-2.5 text-left hover:bg-zinc-900/40">
                      <p className="font-semibold leading-snug text-zinc-200">{n.message}</p>
                      <span className="block text-[8px] text-zinc-500">
                        {n.timestamp.replace('T', ' ').split('.')[0]}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-center text-zinc-600">Nenhum alerta recente.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )

  return (
    <DashboardShell
      homeHref="/dashboard"
      brandTitle={<span className="font-bold tracking-tight text-white">MK Tips</span>}
      desktopMenuItems={userNavFlat}
      mobileNavGroups={userNavGroups}
      sidebarFooter={sidebarFooter}
      header={header}
      mobileUser={user}
      mobileBrandTitle="MK Tips"
      onLogout={handleLogout}
    >
      <TipNotificationWatcher />
      {children}
    </DashboardShell>
  )
}
