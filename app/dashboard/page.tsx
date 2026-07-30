'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AreaChart, Sparkline } from '@/components/ui/charts'
import { db, DBTip, DBUser } from '@/lib/db'
import { ArrowUpRight, Zap, Trophy, ShieldAlert, Award } from 'lucide-react'

export default function UserDashboard() {
  const [user, setUser] = useState<DBUser | null>(null)
  const [volumeTips, setVolumeTips] = useState<DBTip[]>([])
  const [followedTips, setFollowedTips] = useState<DBTip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () => {
      if (!db.isReady()) return
      const currentUser = db.getActiveUser()
      setUser(currentUser)

      const allTips = db.getTips()
      const platformTips = currentUser?.tipsterId
        ? allTips.filter((t) => t.tipsterId === currentUser.tipsterId)
        : allTips
      setVolumeTips(platformTips)
      setFollowedTips(db.getFollowedTips(currentUser?.id))
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

  // Desempenho pessoal: só tips que o cliente favoritou/acompanhou
  const tips = followedTips
  const totalTipsCount = tips.length
  const greenCount = tips.filter((t) => t.status === 'Green').length
  const redCount = tips.filter((t) => t.status === 'Red').length
  const pendingCount = tips.filter((t) => t.status === 'Pendente').length

  const resolvedTips = tips.filter((t) => t.status === 'Green' || t.status === 'Red')
  const invested = resolvedTips.reduce((acc, t) => acc + t.stake, 0)
  const returned = resolvedTips.reduce(
    (acc, t) => acc + (t.status === 'Green' ? t.odd * t.stake : 0),
    0,
  )
  const currentRoi = invested > 0 ? Number((((returned - invested) / invested) * 100).toFixed(1)) : 0
  const netProfit = returned - invested
  const avgOdd =
    tips.length > 0 ? Number((tips.reduce((acc, t) => acc + t.odd, 0) / tips.length).toFixed(2)) : 0

  const zeros = [0, 0, 0, 0, 0, 0, 0]

  const profitTrend =
    resolvedTips.length > 0
      ? resolvedTips.slice(-7).map((t) => {
          const subHistory = resolvedTips.slice(0, resolvedTips.indexOf(t) + 1)
          return subHistory.reduce(
            (acc, current) =>
              acc +
              (current.status === 'Green'
                ? current.odd * current.stake - current.stake
                : -current.stake),
            0,
          )
        })
      : zeros

  const roiTrend =
    resolvedTips.length > 0
      ? resolvedTips.slice(-7).map((t) => {
          const subHistory = resolvedTips.slice(0, resolvedTips.indexOf(t) + 1)
          const inv = subHistory.reduce((acc, curr) => acc + curr.stake, 0)
          const ret = subHistory.reduce(
            (acc, curr) => acc + (curr.status === 'Green' ? curr.odd * curr.stake : 0),
            0,
          )
          return inv > 0 ? Number((((ret - inv) / inv) * 100).toFixed(1)) : 0
        })
      : zeros

  const tipsCountTrend =
    tips.length > 0 ? Array.from({ length: Math.min(tips.length, 7) }, (_, idx) => idx + 1) : zeros

  const greensTrend =
    resolvedTips.length > 0
      ? resolvedTips
          .slice(-7)
          .map((t) =>
            resolvedTips.slice(0, resolvedTips.indexOf(t) + 1).filter((x) => x.status === 'Green')
              .length,
          )
      : zeros

  const redsTrend =
    resolvedTips.length > 0
      ? resolvedTips
          .slice(-7)
          .map((t) =>
            resolvedTips.slice(0, resolvedTips.indexOf(t) + 1).filter((x) => x.status === 'Red')
              .length,
          )
      : zeros

  const oddsTrend = tips.length > 0 ? tips.slice(-7).map((t) => t.odd) : zeros

  const metricCards = [
    {
      label: 'Lucro Acumulado',
      value: `${user.bankrollCurrency} ${netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}`,
      desc: tips.length ? 'Nas tips que você acompanhou' : 'Favorite tips para começar',
      isGreen: netProfit >= 0,
      trend: profitTrend,
      icon: Trophy,
    },
    {
      label: 'ROI Pessoal',
      value: `${currentRoi >= 0 ? '+' : ''}${currentRoi}%`,
      desc: tips.length ? 'Eficiência nas suas entradas' : 'Zerado até acompanhar tips',
      isGreen: currentRoi >= 0,
      trend: roiTrend,
      icon: Award,
    },
    {
      label: 'Tips Acompanhadas',
      value: totalTipsCount.toString(),
      desc: `${pendingCount} ativas agora`,
      isGreen: false,
      trend: tipsCountTrend,
      icon: Zap,
    },
    {
      label: 'Greens',
      value: greenCount.toString(),
      desc: 'Ganhos nas suas tips',
      isGreen: true,
      color: 'text-[#00E08A]',
      trend: greensTrend,
      icon: Trophy,
    },
    {
      label: 'Reds',
      value: redCount.toString(),
      desc: 'Perdas nas suas tips',
      isGreen: false,
      color: 'text-[#EF4444]',
      trend: redsTrend,
      icon: ShieldAlert,
    },
    {
      label: 'Odds Médias',
      value: avgOdd.toString(),
      desc: tips.length ? 'Nas tips acompanhadas' : '—',
      isGreen: false,
      trend: oddsTrend,
      icon: Zap,
    },
  ]

  const bankrollData =
    resolvedTips.length > 0
      ? resolvedTips.slice(-7).map((t) => {
          const subHistory = resolvedTips.slice(0, resolvedTips.indexOf(t) + 1)
          const profit = subHistory.reduce(
            (acc, curr) =>
              acc +
              (curr.status === 'Green' ? curr.odd * curr.stake - curr.stake : -curr.stake),
            0,
          )
          return {
            label: new Date(t.datetime).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            }),
            value: (user.bankroll || 0) + profit,
          }
        })
      : [{ label: 'Hoje', value: user.bankroll || 0 }]

  // Volume da plataforma (pode aparecer): oportunidades do dia
  const activeTips = volumeTips.filter((t) => t.status === 'Pendente').slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Geral</h1>
          <p className="text-sm text-zinc-400">
            Bem-vindo, {user.name}. Seu desempenho começa zerado — favorito tips para acompanhar.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00E08A] bg-[#00E08A]/10 px-3 py-1.5 rounded-lg border border-[#00E08A]/20">
          <Zap className="w-4 h-4 text-[#00E08A]" />
          <span>
            Sua Banca: {user.bankrollCurrency} {user.bankroll || 0}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {metricCards.map((card, i) => (
          <Card
            key={i}
            className="border-zinc-850 bg-zinc-950 hover:border-zinc-800 transition-all duration-200"
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                  {card.label}
                </span>
                <card.icon className="w-4 h-4 text-zinc-650" />
              </div>
              <div className="space-y-1">
                <h2 className={`text-2xl font-black tracking-tight ${card.color || 'text-white'}`}>
                  {card.value}
                </h2>
                <span className="text-[10px] text-zinc-500 block leading-tight">{card.desc}</span>
              </div>
              <div className="pt-1 flex items-center justify-between">
                <Sparkline
                  data={card.trend}
                  width={75}
                  height={20}
                  color={card.isGreen ? '#00E08A' : '#EF4444'}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaChart
            data={bankrollData}
            height={280}
            color="#00E08A"
            title="Evolução da Banca (R$)"
            subtitle={
              tips.length
                ? 'Crescimento baseado nas tips que você acompanhou'
                : 'Sem tips acompanhadas — gráfico zerado'
            }
          />
        </div>

        <Card className="border-zinc-850 bg-zinc-950 flex flex-col justify-between hover:border-zinc-800 transition-all duration-200">
          <div>
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Principais Oportunidades</CardTitle>
              <CardDescription className="text-zinc-400">
                Volume da plataforma — tips ativas do dia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6">
              {activeTips.length > 0 ? (
                activeTips.map((tip) => (
                  <div
                    key={tip.id}
                    className="p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-850 space-y-2"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="px-1.5 py-0.5 bg-zinc-800 rounded font-semibold text-zinc-400">
                        {tip.sport}
                      </span>
                      <span className="text-zinc-500">Confiança {tip.confidence}/10</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{tip.match}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Aposta: <strong className="text-white">{tip.market}</strong> ({tip.type})
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-zinc-850/60">
                      <span className="text-xs font-bold text-[#00E08A]">Odd {tip.odd}</span>
                      <a
                        href={tip.affiliateUrl}
                        target="_blank"
                        className="text-[10px] text-zinc-300 hover:text-white flex items-center gap-1 font-semibold"
                      >
                        Apostar <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  Nenhuma tip ativa pendente no momento.
                </div>
              )}
            </CardContent>
          </div>
          <div className="p-6 border-t border-zinc-850">
            <button
              onClick={() => (window.location.href = '/dashboard/tips')}
              className="w-full py-2.5 bg-[#00E08A] hover:bg-[#00E08A]/90 text-black font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Ver Todas as Tips do Dia
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
