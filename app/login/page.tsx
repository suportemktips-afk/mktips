'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react'
import { db } from '@/lib/db'
import { captureReferralCodeFromUrl, withReferralParam } from '@/lib/referral'

export default function UserLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [freeHref, setFreeHref] = useState('/checkout?plan=Free')

  useEffect(() => {
    captureReferralCodeFromUrl()
    setFreeHref(withReferralParam('/checkout?plan=Free'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Não faz refresh da base inteira antes do login (vazava telefones de todos)
      const result = await db.loginWithCredentialsAsync(email.trim(), password)
      if (!result.ok || !result.user) {
        setError(result.error || 'E-mail ou senha incorretos.')
        return
      }

      if (result.user.status === 'Bloqueado') {
        setError('Sua conta está bloqueada. Renove sua assinatura para continuar.')
        return
      }

      // Free trial expired → auto-block
      if (db.isFreeTrialExpired(result.user)) {
        db.blockExpiredFreeUser(result.user.id)
        setError('Seu teste grátis de 7 dias expirou. Faça upgrade para continuar.')
        return
      }

      localStorage.setItem('oddvault_user_session', 'true')
      localStorage.setItem('oddvault_pwa_show_after_login', '1')
      db.setActiveUser(result.user.id)
      // Limpa lista antiga de usuários no browser (privacidade)
      localStorage.setItem('mktips_mock_users', JSON.stringify([result.user]))
      await db.refresh()
      db.addLog('Auth', `Usuário ${result.user.name} logado com sucesso`, db.getClientIp(), 'Web App', result.user.name)
      router.push('/dashboard')
    } catch {
      setError('Erro ao realizar o login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00E08A]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-md border-zinc-900 bg-zinc-950/80 backdrop-blur-md relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl border border-[#00E08A]/20 bg-[#00E08A]/10 overflow-hidden flex items-center justify-center">
            <img src="/logo-mktips.png" alt="MK Tips" className="h-full w-full object-cover" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Acessar Plataforma
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Entre na sua conta para acompanhar as melhores tips do dia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                E-mail
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="w-4 h-4 text-zinc-500" />
                </span>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-email@exemplo.com"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-[#00E08A] transition-colors placeholder:text-zinc-600 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="w-4 h-4 text-zinc-500" />
                </span>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-[#00E08A] transition-colors placeholder:text-zinc-600 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 bg-[#00E08A] hover:bg-[#00E08A]/90 disabled:opacity-50 text-black font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00E08A]/10 mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar na Conta'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-[11px] text-zinc-500">
            Não tem conta?{' '}
            <Link href={freeHref} className="font-semibold text-emerald-400 hover:underline">
              Criar teste grátis (7 dias)
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
