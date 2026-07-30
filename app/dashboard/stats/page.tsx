'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart, AreaChart, DonutChart, HeatmapChart } from '@/components/ui/charts'
import { Award, Target, Trophy, Percent } from 'lucide-react'
import { db, DBTip } from '@/lib/db'

export default function UserStatsPage() {
  const [tips, setTips] = useState<DBTip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = () => {
      if (!db.isReady()) return
      // Só tips que o cliente acompanhou — sem favoritos = tudo zerado
      setTips(db.getFollowedTips())
      setLoading(false)
    }

    load()
    window.addEventListener('oddvault_db_update', load)
    return () => window.removeEventListener('oddvault_db_update', load)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#00E08A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const resolvedTips = tips.filter((t) => t.status === 'Green' || t.status === 'Red' || t.status === 'Void')
  const greenTips = tips.filter((t) => t.status === 'Green')
  const redTips = tips.filter((t) => t.status === 'Red')
  const voidTips = tips.filter((t) => t.status === 'Void')

  const totalInvested = resolvedTips.reduce((acc, curr) => acc + curr.stake, 0)
  const totalReturned = resolvedTips.reduce(
    (acc, curr) =>
      acc + (curr.status === 'Green' ? curr.odd * curr.stake : curr.status === 'Void' ? curr.stake : 0),
    0,
  )

  const roiValue = totalInvested > 0 ? ((totalReturned - totalInvested) / totalInvested) * 100 : 0
  const precisionValue =
    greenTips.length + redTips.length > 0
      ? (greenTips.length / (greenTips.length + redTips.length)) * 100
      : 0
  const yieldValue = totalInvested > 0 ? ((totalReturned - totalInvested) / totalInvested) * 100 : 0

  const biggestGreenTip = greenTips.reduce(
    (max, t) => (t.odd > (max?.odd || 0) ? t : max),
    null as DBTip | null,
  )
  const biggestGreenText = biggestGreenTip
    ? `+${(biggestGreenTip.odd * biggestGreenTip.stake - biggestGreenTip.stake).toFixed(2)}u`
    : '0.00u'
  const biggestGreenDesc = biggestGreenTip
    ? `Odd ${biggestGreenTip.odd} (${biggestGreenTip.match.split(' vs ')[0] || 'Aposta'})`
    : 'Favorite tips para gerar estatísticas'

  const sports = Array.from(new Set(tips.map((t) => t.sport)))
  const sportRoiData = sports.map((sport) => {
    const sportTips = resolvedTips.filter((t) => t.sport === sport)
    const invested = sportTips.reduce((acc, curr) => acc + curr.stake, 0)
    const returned = sportTips.reduce(
      (acc, curr) =>
        acc + (curr.status === 'Green' ? curr.odd * curr.stake : curr.status === 'Void' ? curr.stake : 0),
      0,
    )
    const roi = invested > 0 ? Number((((returned - invested) / invested) * 100).toFixed(1)) : 0
    return { label: sport, value: roi }
  })

  const tipsters = Array.from(new Set(tips.map((t) => t.tipsterName)))
  const tipsterRoiData = tipsters.map((name) => {
    const tipsterTips = resolvedTips.filter((t) => t.tipsterName === name)
    const invested = tipsterTips.reduce((acc, curr) => acc + curr.stake, 0)
    const returned = tipsterTips.reduce(
      (acc, curr) =>
        acc + (curr.status === 'Green' ? curr.odd * curr.stake : curr.status === 'Void' ? curr.stake : 0),
      0,
    )
    const roi = invested > 0 ? Number((((returned - invested) / invested) * 100).toFixed(1)) : 0
    return { label: name || 'Analista', value: roi }
  })

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const yieldHistory = months
    .map((month, idx) => {
      const monthlyTips = resolvedTips.filter((t) => new Date(t.datetime).getMonth() === idx)
      const invested = monthlyTips.reduce((acc, curr) => acc + curr.stake, 0)
      const returned = monthlyTips.reduce(
        (acc, curr) =>
          acc +
          (curr.status === 'Green' ? curr.odd * curr.stake : curr.status === 'Void' ? curr.stake : 0),
        0,
      )
      const yld = invested > 0 ? Number((((returned - invested) / invested) * 100).toFixed(1)) : 0
      return { label: month, value: yld }
    })
    .filter((_, idx) => idx <= new Date().getMonth())

  const tipsPerformanceData = [
    { name: 'Greens', value: greenTips.length, color: '#00E08A' },
    { name: 'Reds', value: redTips.length, color: '#EF4444' },
    { name: 'Voids', value: voidTips.length, color: '#F59E0B' },
  ]

  const heatmapData = Array.from({ length: 28 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (27 - i))
    const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    const dayTips = tips.filter((t) => new Date(t.datetime).toDateString() === d.toDateString())
    return { day: dateStr, value: dayTips.length }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Estatísticas Detalhadas</h1>
        <p className="text-sm text-zinc-400">
          Baseado só nas tips que você acompanhou. Sem favoritos, tudo fica zerado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'ROI Pessoal',
            value: `${roiValue >= 0 ? '+' : ''}${roiValue.toFixed(1)}%`,
            icon: Target,
            desc: tips.length ? 'Nas tips acompanhadas' : 'Zerado até favoritar tips',
            color: roiValue >= 0 ? 'text-[#00E08A]' : 'text-red-500',
          },
          {
            label: 'Precisão',
            value: `${precisionValue.toFixed(1)}%`,
            icon: Percent,
            desc: tips.length ? 'Taxa de acertos' : 'Zerado',
            color: 'text-white',
          },
          {
            label: 'Yield',
            value: `${yieldValue >= 0 ? '+' : ''}${yieldValue.toFixed(1)}%`,
            icon: Trophy,
            desc: tips.length ? 'Eficiência financeira' : 'Zerado',
            color: yieldValue >= 0 ? 'text-[#00E08A]' : 'text-red-500',
          },
          {
            label: 'Maior Green',
            value: biggestGreenText,
            icon: Award,
            desc: biggestGreenDesc,
            color: 'text-white',
          },
        ].map((card, i) => (
          <Card
            key={i}
            className="border-zinc-850 bg-zinc-950 hover:border-zinc-800 transition-all duration-200"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                  {card.label}
                </span>
                <h2 className={`text-2xl font-black tracking-tight ${card.color}`}>{card.value}</h2>
                <span className="text-[10px] text-zinc-500 block">{card.desc}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-500 shadow-inner">
                <card.icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaChart
            data={yieldHistory}
            height={240}
            color="#3B82F6"
            title="Curva de Yield Mensal (%)"
            subtitle="Só tips que você acompanhou"
          />
        </div>

        <div>
          <DonutChart
            data={tipsPerformanceData}
            height={240}
            title="Distribuição das Tips"
            subtitle="Greens, Reds e Voids das suas entradas"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <BarChart
            data={sportRoiData.length > 0 ? sportRoiData : [{ label: 'Nenhum', value: 0 }]}
            height={200}
            color="#00E08A"
            accentColor="#6C5CE7"
            title="ROI por Esporte (%)"
            subtitle="Nas tips acompanhadas"
          />
        </div>

        <div>
          <BarChart
            data={tipsterRoiData.length > 0 ? tipsterRoiData : [{ label: 'Nenhum', value: 0 }]}
            height={200}
            color="#00E08A"
            accentColor="#3B82F6"
            title="ROI por Tipster (%)"
            subtitle="Nas tips acompanhadas"
          />
        </div>

        <div>
          <HeatmapChart
            data={heatmapData}
            title="Atividade nas tips"
            subtitle="Tips que você favoritou nos últimos 28 dias"
          />
        </div>
      </div>
    </div>
  )
}
