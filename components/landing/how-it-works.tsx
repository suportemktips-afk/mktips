'use client'

import React from 'react'
import {
  UserPlus,
  LogIn,
  Zap,
  Scale,
  BarChart3,
  Wallet,
} from 'lucide-react'

const stepsList = [
  {
    icon: UserPlus,
    title: 'Crie sua conta',
    desc: 'Cadastro rápido com seus dados básicos para liberar o acesso à plataforma.',
  },
  {
    icon: LogIn,
    title: 'Acesse a plataforma',
    desc: 'Entre no painel e configure seu perfil operacional em poucos minutos.',
  },
  {
    icon: Zap,
    title: 'Receba as oportunidades',
    desc: 'Tips organizadas com contexto, odd sugerida e horário de entrada.',
  },
  {
    icon: Scale,
    title: 'Compare as odds',
    desc: 'Veja em segundos qual casa oferece a melhor cotação no momento.',
  },
  {
    icon: BarChart3,
    title: 'Acompanhe os resultados',
    desc: 'Histórico completo de greens e reds, sem edições ou cortes.',
  },
  {
    icon: Wallet,
    title: 'Controle sua banca',
    desc: 'Monitore ROI, yield e evolução do capital em um único lugar.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative overflow-hidden border-b border-zinc-900/40 bg-black py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            Do cadastro ao controle da banca
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Um fluxo simples para organizar sua rotina no mercado esportivo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stepsList.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="group relative flex flex-col gap-4 rounded-2xl border border-zinc-900 bg-zinc-950/50 p-6 transition-all duration-300 hover:border-[#00E08A]/25 hover:bg-zinc-950/80"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#00E08A] text-sm font-black text-[#00E08A]">
                    {idx + 1}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-[#00E08A] transition-colors group-hover:border-[#00E08A]/40 group-hover:bg-[#00E08A]/10">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white sm:text-base">{step.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 sm:text-[13px]">
                    {step.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
