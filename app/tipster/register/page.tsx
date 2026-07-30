'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Sparkles, User, Mail, Lock, FileText, Globe, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function TipsterRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [specialty, setSpecialty] = useState('Futebol')
  const [bio, setBio] = useState('')
  const [instagram, setInstagram] = useState('')
  const [telegram, setTelegram] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) return
    setLoading(true)

    try {
      const res = await fetch('/api/tipsters/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, specialty, bio, instagram, telegram }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Falha no cadastro')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Erro ao cadastrar tipster.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-950 border border-emerald-500/20 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Cadastro Solicitado!</h2>
          <p className="text-sm text-zinc-400">
            Seu cadastro como Tipster foi enviado com sucesso. Aguarde a validação do administrador para poder fazer login e começar a postar suas tips.
          </p>
          <p className="text-xs text-zinc-500 animate-pulse">Redirecionando em instantes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl">
        {/* Glow decoration */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="text-center space-y-2 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Faça parte da elite
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Cadastro de Tipster</h1>
          <p className="text-xs text-zinc-500">Registre-se para publicar suas estatísticas, tips e gerenciar sua banca profissional.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">E-mail Profissional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">WhatsApp</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Especialidade Esportiva</label>
            <select
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="Futebol">Futebol</option>
              <option value="Basquete">Basquete (NBA/NBB)</option>
              <option value="Tênis">Tênis</option>
              <option value="eSports">eSports</option>
              <option value="MMA/UFC">MMA / UFC</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Biografia Profissional</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Conte sobre sua experiência no mercado de apostas..."
                rows={3}
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Instagram (@)</label>
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                placeholder="perfil"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Telegram (link/user)</label>
              <input
                type="text"
                value={telegram}
                onChange={e => setTelegram(e.target.value)}
                placeholder="@canal_vip"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-extrabold rounded-lg text-sm transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            {loading ? 'Processando...' : (
              <>
                Enviar Solicitação <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-zinc-650 relative">
          Ao se cadastrar, você concorda com nossos termos de uso profissional e auditoria de tips.
        </p>
      </div>
    </div>
  )
}
