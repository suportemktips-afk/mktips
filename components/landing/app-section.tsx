'use client'

import React from 'react'
import { Smartphone, Bell, MonitorSmartphone, RefreshCw } from 'lucide-react'
import Image from 'next/image'

const appFeatures = [
  {
    icon: Smartphone,
    title: 'Instalação rápida',
    desc: 'Adicione à tela inicial pelo navegador, sem lojas nem downloads pesados.',
  },
  {
    icon: Bell,
    title: 'Notificações em tempo real',
    desc: 'Receba alertas no instante em que uma nova tip é publicada.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Acesse em qualquer dispositivo',
    desc: 'Celular, tablet ou desktop — a mesma experiência, sincronizada.',
  },
  {
    icon: RefreshCw,
    title: 'Sincronização automática',
    desc: 'Dados, histórico e configurações sempre atualizados na nuvem.',
  },
]

export function AppSection() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-900/40 bg-black py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="flex justify-center lg:col-span-5">
            <div className="relative w-56 overflow-hidden rounded-[2.25rem] border border-zinc-800 bg-zinc-950 p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:w-64">
              <div className="mx-auto mb-2 h-3.5 w-20 rounded-full bg-zinc-800" />
              <div className="relative aspect-[9/19] overflow-hidden rounded-[1.75rem] bg-zinc-900">
                <Image
                  src="/tips-mockup.png"
                  fill
                  alt="Aplicativo MK Tips"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-7">
            <div>
              <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
                A MK TIPS sempre com você
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
                Leve o painel no bolso e acompanhe oportunidades, resultados e banca onde estiver.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {appFeatures.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 transition-all hover:border-[#00E08A]/20"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#00E08A]/25 bg-[#00E08A]/10 text-[#00E08A]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h4 className="mt-3 text-sm font-bold text-white">{item.title}</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
