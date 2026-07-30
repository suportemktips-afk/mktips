'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Trophy, Shield, Flame, Star } from 'lucide-react'
import { db, DBTip, DBUser } from '@/lib/db'

export default function UserGamificationPage() {
  const [user, setUser] = useState<DBUser | null>(null)
  const [tips, setTips] = useState<DBTip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () => {
      if (!db.isReady()) return
      setUser(db.getActiveUser())
      // XP/nível só com tips acompanhadas pelo cliente
      setTips(db.getFollowedTips())
      setLoading(false)
    }

    load()
    window.addEventListener('oddvault_db_update', load)
    return () => window.removeEventListener('oddvault_db_update', load)
  }, [])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#00E08A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Calculate dynamic gamification stats based on tips acompanhadas
  const resolvedTips = tips.filter(t => t.status === 'Green' || t.status === 'Red')
  const greenTipsCount = tips.filter(t => t.status === 'Green').length

  // XP: 100 XP per resolved tip + 150 XP per Green tip (0 se não favoritou nada)
  const xp = (resolvedTips.length * 100) + (greenTipsCount * 150)
  
  // Calculate Level based on XP (each level requires 500 XP)
  const level = Math.floor(xp / 500) + 1
  const xpInCurrentLevel = xp % 500
  const progressPercent = (xpInCurrentLevel / 500) * 100
  const xpNeededForNext = 500 - xpInCurrentLevel

  // Dynamic Level Titles
  const getLevelTitle = (lvl: number) => {
    if (lvl === 1) return 'Apostador Iniciante'
    if (lvl === 2) return 'Apostador Praticante'
    if (lvl === 3) return 'Analista Júnior'
    if (lvl === 4) return 'Apostador Pro'
    return 'Trader de Elite'
  }

  // Dynamic badges unlocked based on actual achievements
  const badges = [
    { 
      title: 'Primeiro de Muitos', 
      desc: 'Acompanhou a primeira tip na plataforma.', 
      icon: Star, 
      unlocked: resolvedTips.length >= 1 
    },
    { 
      title: 'Caçador de Greens', 
      desc: 'Acertou 10 tips seguidas de futebol (ou 10 no total).', 
      icon: Trophy, 
      unlocked: greenTipsCount >= 10 
    },
    { 
      title: 'Banca Blindada', 
      desc: 'Alcançou um ROI individual positivo no banco.', 
      icon: Shield, 
      unlocked: user.roiIndividual > 0 || resolvedTips.some(t => t.status === 'Green') 
    },
    { 
      title: 'Mestre da Odd', 
      desc: 'Aproveitou uma odd recomendada acima de 3.00.', 
      icon: Flame, 
      unlocked: resolvedTips.some(t => t.odd >= 3.00) 
    }
  ]

  // Streak: dynamic count based on recent logs activity or default to 0/1 if database has tips
  const streak = resolvedTips.length > 0 ? 1 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Gamificação & Nível</h1>
        <p className="text-sm text-zinc-400">Acumule pontos acompanhando tips corretas e desbloqueie recompensas e insígnias.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Rank Card */}
        <Card className="border-zinc-850 bg-zinc-900/30">
          <CardHeader>
            <CardTitle className="text-base font-bold">Seu Nível Atual</CardTitle>
            <CardDescription>Consistência e atividade geral</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-lg font-black text-white">Nível {level} ({getLevelTitle(level)})</span>
              <span className="text-zinc-500">{xp} XP</span>
            </div>
            <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-[10px] text-zinc-500">Faltam {xpNeededForNext} XP para o Nível {level + 1}.</p>
          </CardContent>
        </Card>

        {/* Streaks */}
        <Card className="border-zinc-850 bg-zinc-900/30">
          <CardHeader>
            <CardTitle className="text-base font-bold">Sequência Ativa (Streak)</CardTitle>
            <CardDescription>Dias consecutivos acessando e analisando tips</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">{streak} Dia{streak !== 1 ? 's' : ''} Seguido{streak !== 1 ? 's' : ''}</h3>
              <p className="text-xs text-zinc-500">
                {streak > 0 
                  ? 'Parabéns! Continue acessando diariamente para ganhar bônus de XP.'
                  : 'Acompanhe as próximas tips recomendadas para iniciar sua sequência!'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges checklist */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Minhas Insígnias</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {badges.map((badge, idx) => (
            <Card key={idx} className={`border-zinc-850 bg-zinc-950 hover:border-zinc-800 transition-all duration-200 ${!badge.unlocked && 'opacity-40'}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${badge.unlocked ? 'bg-emerald-500/10 border-emerald-500/20 text-[#00E08A]' : 'bg-zinc-900 border-zinc-850 text-zinc-500'}`}>
                  <badge.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{badge.title}</h4>
                  <p className="text-[10px] text-zinc-500 leading-tight mt-1">{badge.desc}</p>
                  <span className={`text-[8px] font-bold block mt-1.5 ${badge.unlocked ? 'text-[#00E08A]' : 'text-zinc-650'}`}>
                    {badge.unlocked ? 'Desbloqueada' : 'Bloqueada'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
