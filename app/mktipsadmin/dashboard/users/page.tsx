'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { db, DBUser } from '@/lib/db'
import {
  Search,
  UserPlus,
  MoreVertical,
  CheckCircle,
  XCircle,
  Edit2,
  Lock,
  Download,
  AlertCircle
} from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DBUser[]>([])
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null)
  const [activeUser, setActiveUser] = useState<DBUser | null>(null)
  
  // Registration form
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPlan, setNewPlan] = useState<'Free' | 'Starter' | 'Premium' | 'VIP Anual'>('Premium')
  const [newRole, setNewRole] = useState<'Master' | 'Admin' | 'Gerente' | 'Suporte' | 'Financeiro' | 'Tipster' | 'Moderador' | 'User'>('User')
  const [internalNote, setInternalNote] = useState('')

  // Edit fields
  const [editingUser, setEditingUser] = useState<DBUser | null>(null)

  useEffect(() => {
    const load = async () => {
      await db.refresh()
      setUsers(db.getUsers())
      setActiveUser(db.getActiveUser())
    }
    load()
    const onUpdate = () => setUsers(db.getUsers())
    window.addEventListener('oddvault_db_update', onUpdate)
    const interval = setInterval(() => {
      db.refresh().then(() => setUsers(db.getUsers()))
    }, 15000)
    return () => {
      window.removeEventListener('oddvault_db_update', onUpdate)
      clearInterval(interval)
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleBlockUnblock = (userId: string, currentStatus: string) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) return

    if (targetUser.role === 'Master') {
      alert('Operação Negada: O perfil Master não pode ser bloqueado ou desativado!')
      return
    }

    if (activeUser?.role !== 'Master' && activeUser?.id !== userId) {
      // If the administrator executing this is not a Master
      alert('Operação Negada: Apenas o perfil Master pode bloquear ou desativar outros administradores!')
      return
    }

    const nextStatus: DBUser['status'] = currentStatus === 'Ativo' ? 'Bloqueado' : 'Ativo'
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        db.addAuditLog('Admin Master', 'CHANGE_USER_STATUS', user.id, user.status, nextStatus)
        db.addLog('Audit', `Status do usuário ${user.name} alterado para ${nextStatus}`, '189.120.45.10', 'MacBook Pro', 'Admin Master')
        return { ...user, status: nextStatus }
      }
      return user
    })
    setUsers(updatedUsers)
    db.setUsers(updatedUsers)
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, status: nextStatus })
    }
  }

  const handleRoleChange = (userId: string, nextRole: DBUser['role']) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) return

    if (targetUser.role === 'Master') {
      alert('Operação Negada: O cargo do perfil Master não pode ser alterado!')
      return
    }

    if (activeUser?.role !== 'Master') {
      alert('Operação Negada: Apenas o perfil Master pode alterar os cargos dos administradores e gerentes!')
      return
    }

    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        db.addAuditLog('Admin Master', 'CHANGE_USER_ROLE', user.id, user.role, nextRole)
        db.addLog('Audit', `Cargo de ${user.name} alterado para ${nextRole}`, '189.120.45.10', 'MacBook Pro', 'Admin Master')
        return { ...user, role: nextRole }
      }
      return user
    })
    setUsers(updatedUsers)
    db.setUsers(updatedUsers)
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, role: nextRole })
    }
  }

  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) return

    if (targetUser.role === 'Master') {
      alert('Operação Negada: O perfil Master não pode ser excluído do sistema!')
      return
    }

    if (activeUser?.role !== 'Master') {
      alert('Operação Negada: Apenas o perfil Master pode excluir administradores, gerentes ou usuários!')
      return
    }

    if (confirm(`Deseja realmente remover o usuário ${targetUser.name} do sistema? Esta ação é irreversível.`)) {
      const updatedUsers = users.filter(u => u.id !== userId)
      setUsers(updatedUsers)
      void db.deleteUser(userId)
      setSelectedUser(null)
      db.addAuditLog('Admin Master', 'DELETE_USER', userId, targetUser.name, '')
      db.addLog('Audit', `Usuário ${targetUser.name} removido do sistema`, '189.120.45.10', 'MacBook Pro', 'Admin Master')
    }
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newEmail) return

    const newUser: DBUser = {
      id: crypto.randomUUID(),
      name: newName,
      email: newEmail,
      phone: '+55 (11) 90000-0000',
      city: 'São Paulo',
      country: 'Brasil',
      language: 'pt-BR',
      plan: newPlan,
      role: newRole,
      status: 'Ativo',
      createdAt: new Date().toISOString(),
      lastLogin: '-',
      lastLoginIp: '-',
      device: '-',
      os: '-',
      browser: '-',
      daysRemaining: newPlan === 'VIP Anual' ? 365 : 30,
      revenueGenerated: newPlan === 'VIP Anual' ? 497.90 : 97.90,
      totalPaid: newPlan === 'VIP Anual' ? 497.90 : 97.90,
      lastPaymentDate: new Date().toISOString(),
      bankroll: 0,
      bankrollCurrency: 'R$',
      roiIndividual: 0
    }

    const updated = [...users, newUser]
    setUsers(updated)
    db.setUsers(updated)
    db.addAuditLog('Admin Master', 'MANUAL_CREATE_USER', newUser.id, '', `${newName} (${newRole})`)
    db.addLog('Audit', `Usuário ${newName} cadastrado manualmente com cargo ${newRole} e plano ${newPlan}`, '189.120.45.10', 'MacBook Pro', 'Admin Master')

    // Reset fields
    setNewName('')
    setNewEmail('')
    setNewRole('User')
    setShowAddModal(false)
  }

  const exportCSV = () => {
    const headers = 'ID,Nome,E-mail,Plano,Cargo,Status,Cadastro\n'
    const rows = users.map(u => `${u.id},"${u.name}",${u.email},${u.plan},${u.role},${u.status},${u.createdAt.split('T')[0]}`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `oddvault_users_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Gestão de Usuários</h1>
          <p className="text-sm text-zinc-400">Gerencie planos, bloqueios, auditoria e logs de sessões.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Cadastrar Usuário
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="border-zinc-850 bg-zinc-950">
        <CardContent className="p-4 flex gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Pesquisar por nome ou e-mail..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Grid/List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table list */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="border-zinc-850 bg-zinc-900/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-850 bg-zinc-900/50 text-zinc-400 font-semibold">
                    <th className="p-4">Assinante</th>
                    <th className="p-4">Plano</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Dispositivo / OS</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-zinc-300">
                  {filteredUsers.map(user => (
                    <tr 
                      key={user.id} 
                      onClick={() => setSelectedUser(user)}
                      className={`hover:bg-zinc-900/40 cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-zinc-900/60' : ''}`}
                    >
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white uppercase text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{user.name}</p>
                          <p className="text-[10px] text-zinc-500">{user.email}</p>
                          <div className="flex gap-1 items-center mt-1">
                            <span className={`text-[8.5px] px-1 rounded font-extrabold uppercase border ${
                              user.role === 'Master' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              user.role === 'Admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              user.role === 'Gerente' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                              'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {user.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                          user.status === 'Ativo' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Ativo' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-400">
                        <p className="text-[10px]">{user.device || 'Nenhum'}</p>
                        <p className="text-[9px] text-zinc-500">{user.os || '-'}</p>
                      </td>
                      <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          {user.role !== 'Master' && (
                            <>
                              <button
                                onClick={() => handleBlockUnblock(user.id, user.status)}
                                className={`p-1.5 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 cursor-pointer text-xs ${
                                  user.status === 'Ativo' ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'
                                }`}
                                title={user.status === 'Ativo' ? 'Bloquear usuário' : 'Desbloquear usuário'}
                              >
                                {user.status === 'Ativo' ? 'Bloquear' : 'Ativar'}
                              </button>
                              {activeUser?.role === 'Master' && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1.5 rounded border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer text-xs"
                                  title="Remover usuário do sistema"
                                >
                                  Excluir
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* User Details Sidebar */}
        <div className="xl:col-span-1">
          {selectedUser ? (
            <Card className="border-zinc-800 bg-zinc-950/80 sticky top-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">{selectedUser.name}</CardTitle>
                  <CardDescription>Detalhes do Perfil do Assinante</CardDescription>
                </div>
                <span className="text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{selectedUser.id}</span>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-2 border-b border-zinc-850 pb-4">
                  <div className="flex justify-between"><span className="text-zinc-500">Telefone:</span><span className="text-white">{selectedUser.phone}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">CPF:</span><span className="text-white font-mono">{selectedUser.cpf || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Cidade:</span><span className="text-white">{selectedUser.city}, {selectedUser.country}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Cadastro:</span><span className="text-white">{selectedUser.createdAt.split('T')[0]}</span></div>
                </div>

                <div className="space-y-2 border-b border-zinc-850 pb-4">
                  <div className="flex justify-between"><span className="text-zinc-500">Último Login:</span><span className="text-white">{selectedUser.lastLogin}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">IP de Origem:</span><span className="text-white font-mono">{selectedUser.lastLoginIp}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Navegador:</span><span className="text-white">{selectedUser.browser}</span></div>
                </div>

                <div className="space-y-2 border-b border-zinc-850 pb-4">
                  <div className="flex justify-between"><span className="text-zinc-500">Banca Cadastrada:</span><span className="text-emerald-400 font-semibold">{selectedUser.bankrollCurrency} {selectedUser.bankroll}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Faturamento Total:</span><span className="text-white">R$ {selectedUser.totalPaid}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Dias Restantes:</span><span className="text-white font-semibold">{selectedUser.daysRemaining} dias</span></div>
                </div>

                {/* Role/Cargo row */}
                <div className="space-y-2 border-b border-zinc-850 pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Cargo / Função:</span>
                    {selectedUser.role === 'Master' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 uppercase">Master</span>
                    ) : activeUser?.role === 'Master' ? (
                      <select
                        value={selectedUser.role}
                        onChange={e => handleRoleChange(selectedUser.id, e.target.value as any)}
                        className="p-1 bg-zinc-900 border border-zinc-800 rounded text-white text-[11px] outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="User">User (Cliente)</option>
                        <option value="Admin">Admin</option>
                        <option value="Gerente">Gerente</option>
                        <option value="Suporte">Suporte</option>
                        <option value="Financeiro">Financeiro</option>
                        <option value="Tipster">Tipster</option>
                        <option value="Moderador">Moderador</option>
                      </select>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800 uppercase">
                        {selectedUser.role}
                      </span>
                    )}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="space-y-2 pb-4">
                  <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Observações Internas (Admin)</label>
                  <textarea
                    placeholder="Adicionar notas internas sobre comportamento, problemas com pagamentos..."
                    value={internalNote}
                    onChange={e => setInternalNote(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-zinc-700 text-xs h-20 placeholder:text-zinc-600 resize-none"
                  />
                  <button
                    onClick={() => {
                      db.addLog('Audit', `Nota interna salva para o usuário ${selectedUser.name}`, '189.120.45.10', 'MacBook Pro', 'Admin Master')
                      alert('Nota salva internamente com sucesso!')
                    }}
                    className="mt-2 w-full py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 rounded font-semibold border border-zinc-800 cursor-pointer"
                  >
                    Salvar Notas
                  </button>
                </div>

                {/* Delete button in sidebar */}
                {selectedUser.role !== 'Master' && activeUser?.role === 'Master' && (
                  <div className="pt-2 border-t border-zinc-850">
                    <button
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Remover Usuário do Sistema
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-zinc-800 bg-transparent flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="w-8 h-8 text-zinc-600 mb-3" />
              <p className="text-zinc-400 font-medium text-xs">Nenhum Usuário Selecionado</p>
              <p className="text-[10px] text-zinc-650 mt-1">Clique em uma linha na tabela para visualizar dados financeiros e logs de sessões.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Manual Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base font-bold">Cadastrar Assinante / Admin</CardTitle>
              <CardDescription>Insira as credenciais e defina a função do novo membro.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddUser}>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="João Silva"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-550 font-semibold uppercase tracking-wider mb-2">E-mail</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="joao@gmail.com"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-zinc-550 font-semibold uppercase tracking-wider mb-2">Plano de Assinatura</label>
                    <select
                      value={newPlan}
                      onChange={e => setNewPlan(e.target.value as any)}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Free">Free</option>
                      <option value="Starter">Starter - R$49,90</option>
                      <option value="Premium">Premium - R$97,90</option>
                      <option value="VIP Anual">VIP Anual - R$497,90</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-550 font-semibold uppercase tracking-wider mb-2">Função / Cargo</label>
                    <select
                      value={newRole}
                      onChange={e => setNewRole(e.target.value as any)}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="User">Cliente (User)</option>
                      <option value="Admin">Admin</option>
                      <option value="Gerente">Gerente</option>
                      <option value="Suporte">Suporte</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Tipster">Tipster</option>
                      <option value="Moderador">Moderador</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <div className="p-6 border-t border-zinc-850 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold rounded hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded cursor-pointer"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
