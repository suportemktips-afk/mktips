'use client'

import { AppWindow, Bell, MonitorSmartphone, RefreshCw } from 'lucide-react'
import { PhoneMockup } from './device-mockups'

const appFeatures = [
  {
    icon: AppWindow,
    title: 'Instalação rápida',
    desc: 'Adicione o aplicativo à tela inicial diretamente pelo navegador.',
  },
  {
    icon: Bell,
    title: 'Notificações em tempo real',
    desc: 'Receba alertas assim que uma nova tip for publicada.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Acesso em qualquer dispositivo',
    desc: 'Use a mesma conta no celular, tablet ou computador.',
  },
  {
    icon: RefreshCw,
    title: 'Sincronização automática',
    desc: 'Seus dados permanecem atualizados em todos os dispositivos.',
  },
]

export function AppSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-[var(--mk-bg-secondary)] py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 41px)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="flex justify-center lg:col-span-5">
            <PhoneMockup />
          </div>

          <div className="space-y-8 lg:col-span-7">
            <div>
              <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
                A MK Tips sempre com você
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--mk-text-secondary)] sm:text-base">
                Acesse a plataforma pelo celular, tablet ou computador sem perder nenhuma
                oportunidade.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {appFeatures.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="rounded-[14px] border border-white/10 bg-[var(--mk-card)]/80 p-5 backdrop-blur-sm"
                  >
                    <span className="flex h-9 w-9 items-center justify-center text-[var(--mk-green)]">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <h4 className="mt-3 text-sm font-bold text-white">{item.title}</h4>
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
