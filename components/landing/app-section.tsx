'use client'

import { Smartphone, Bell, MonitorSmartphone, RefreshCw } from 'lucide-react'
import { PhoneMockup } from './device-mockups'

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
    <section className="relative overflow-hidden border-b border-white/5 bg-[var(--mk-bg-secondary)] py-20 sm:py-28">
      <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="flex justify-center lg:col-span-5">
            <PhoneMockup />
          </div>

          <div className="space-y-8 lg:col-span-7">
            <div>
              <h2 className="text-balance text-3xl font-black tracking-tight text-[var(--mk-text)] sm:text-4xl">
                A MK Tips sempre com você
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--mk-text-secondary)] sm:text-base">
                Leve o painel no bolso e acompanhe oportunidades, resultados e banca onde estiver.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {appFeatures.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="rounded-[14px] border border-[var(--mk-border)] bg-[var(--mk-card)] p-5 transition-all hover:border-[var(--mk-border-green)] hover:bg-[var(--mk-card-hover)]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--mk-border-green)] bg-transparent text-[var(--mk-green)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h4 className="mt-3 text-sm font-bold text-[var(--mk-text)]">{item.title}</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--mk-text-secondary)]">
                      {item.desc}
                    </p>
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
