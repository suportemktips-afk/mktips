'use client'

import { useEffect, useState } from 'react'
import { Users, FileText, Trophy, Download } from 'lucide-react'
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
    { icon: FileText, value: statsConfig.tipsPublished, label: 'tips publicadas', suffix: '+' },
    { icon: Trophy, value: statsConfig.activeLeagues, label: 'campeonatos acompanhados', suffix: '+' },
    { icon: Download, value: statsConfig.appInstalls, label: 'instalações de aplicativo', suffix: '+' },
  ]

  return (
    <section id="resultados" className="border-b border-white/5 bg-[var(--mk-bg)] py-12 sm:py-16">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2.5 rounded-[14px] border border-[var(--mk-border)] bg-[var(--mk-card)] px-4 py-6 text-center transition-colors hover:bg-[var(--mk-card-hover)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--mk-border-green)] bg-[var(--mk-green)]/10 text-[var(--mk-green)]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="font-mono text-2xl font-black tracking-tight text-[var(--mk-text)] sm:text-3xl">
                  <CountUp end={item.value} decimals={0} suffix={item.suffix} />
                </span>
                <span className="text-xs font-medium text-[var(--mk-text-secondary)] sm:text-sm">
                  {item.label}
                </span>
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
