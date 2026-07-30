'use client'

import React from 'react'
import {
  Scale,
  Wallet,
  FileCheck,
  BarChart3,
  Bell,
  Trophy,
} from 'lucide-react'

const features = [
  {
    icon: Scale,
    title: 'Comparador de odds',
    desc: 'Identifique em segundos a melhor cotação entre as principais casas.',
  },
  {
    icon: Wallet,
    title: 'Gestão de banca',
    desc: 'Controle stakes, capital e evolução do caixa com clareza.',
  },
  {
    icon: FileCheck,
    title: 'Histórico transparente',
    desc: 'Greens e reds registrados sem edições — tudo auditável.',
  },
  {
    icon: BarChart3,
    title: 'Estatísticas avançadas',
    desc: 'ROI, yield e desempenho visualizados em gráficos claros.',
  },
  {
    icon: Bell,
    title: 'Alertas instantâneos',
    desc: 'Notificações no momento exato em que uma tip é publicada.',
  },
  {
    icon: Trophy,
    title: 'Ranking de tipsters',
    desc: 'Acompanhe quem entrega mais consistência no longo prazo.',
  },
]

export function WhyThousandsChoose() {
  return (
    <section id="recursos" className="relative overflow-hidden border-b border-zinc-900/40 bg-black py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            Tudo o que você precisa em um único painel
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Ferramentas pensadas para organizar análise, execução e acompanhamento.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 transition-all duration-300 hover:border-[#00E08A]/25 hover:bg-zinc-950/70"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#00E08A]/30 bg-transparent text-[#00E08A] transition-colors group-hover:bg-[#00E08A]/10">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-sm font-bold text-white sm:text-base">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500 sm:text-[13px]">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
