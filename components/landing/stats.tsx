'use client'

import React, { useEffect, useState } from 'react'
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
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mktips_admin_stats_config')
      if (stored) {
        try {
          setStatsConfig((prev) => ({ ...prev, ...JSON.parse(stored) }))
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [])

  const items = [
    {
      icon: Users,
      value: statsConfig.activeUsers,
      label: 'usuários ativos',
      suffix: '+',
    },
    {
      icon: FileText,
      value: statsConfig.tipsPublished,
      label: 'tips publicadas',
      suffix: '+',
    },
    {
      icon: Trophy,
      value: statsConfig.activeLeagues,
      label: 'campeonatos',
      suffix: '+',
    },
    {
      icon: Download,
      value: statsConfig.appInstalls,
      label: 'instalações',
      suffix: '+',
    },
  ]

  return (
    <div id="resultados" className="border-b border-zinc-900/80 bg-black py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex flex-col items-center text-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00E08A]/25 bg-[#00E08A]/10 text-[#00E08A]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="font-mono text-2xl font-black tracking-tight text-white sm:text-3xl">
                  <CountUp end={item.value} decimals={0} suffix={item.suffix} />
                </span>
                <span className="text-xs font-medium text-zinc-500 sm:text-sm">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function Stats() {
  return <TrustBar />
}
