'use client'

import { useEffect, useState } from 'react'
import { Users, TrendingUp, Trophy, Download } from 'lucide-react'
import { CountUp } from './count-up'

export function TrustBar() {
  const [statsConfig, setStatsConfig] = useState({
    activeUsers: 24800,
    tipsPublished: 142000,
    activeLeagues: 480,
    appInstalls: 12500,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('mktips_admin_stats_config')
    if (!stored) return
    try {
      setStatsConfig((prev) => ({ ...prev, ...JSON.parse(stored) }))
    } catch {
      /* ignore */
    }
  }, [])

  const items = [
    { icon: Users, value: statsConfig.activeUsers, label: 'usuários ativos', suffix: '+' },
    { icon: TrendingUp, value: statsConfig.tipsPublished, label: 'tips publicadas', suffix: '+' },
    {
      icon: Trophy,
      value: statsConfig.activeLeagues,
      label: 'campeonatos acompanhados',
      suffix: '+',
    },
    {
      icon: Download,
      value: statsConfig.appInstalls,
      label: 'instalações do aplicativo',
      suffix: '+',
    },
  ]

  return (
    <section id="resultados" className="border-b border-white/5 bg-[var(--mk-bg)] py-10 sm:py-14">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-[14px] border border-white/10 bg-[var(--mk-card)] px-5 py-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center text-[var(--mk-green)]">
                  <Icon className="h-7 w-7" strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-2xl font-black tracking-tight text-white sm:text-[1.65rem]">
                    <CountUp end={item.value} decimals={0} suffix={item.suffix} />
                  </p>
                  <p className="text-sm text-[var(--mk-text-secondary)]">{item.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function Stats() {
  return <TrustBar />
}
