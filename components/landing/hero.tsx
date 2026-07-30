'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Play, Lock, Scale, ShieldCheck, TrendingUp, Bell } from 'lucide-react'
import { DeviceMockups } from './device-mockups'

const featurePills = [
  { icon: Scale, label: 'Comparação automática de odds' },
  { icon: ShieldCheck, label: 'Histórico completo e auditado' },
  { icon: TrendingUp, label: 'Gestão inteligente de banca' },
  { icon: Bell, label: 'Alertas em tempo real' },
]

export function Hero({ onStartFree: _onStartFree }: { onStartFree: () => void }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setReady(true)
      return
    }
    const t = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <section className="relative overflow-x-clip overflow-y-visible bg-[var(--mk-bg)] pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 50% 48% at 82% 42%, rgba(112,224,0,0.14) 0%, transparent 62%),
            radial-gradient(ellipse 35% 30% at 8% 80%, rgba(112,224,0,0.04) 0%, transparent 55%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-6 xl:gap-8">
          <div
            className={`motion-safe-fade space-y-6 lg:col-span-5 xl:col-span-5 transition-all duration-700 ease-out ${
              ready ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <h1 className="max-w-[560px] text-balance text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.15rem] xl:text-[3.35rem]">
              Mais controle para tomar melhores{' '}
              <span className="text-[var(--mk-green)]">decisões</span> no mercado esportivo
            </h1>

            <div className="max-w-[520px] space-y-3 text-[15px] leading-relaxed text-[var(--mk-text-secondary)] sm:text-base">
              <p>
                Analise oportunidades, compare odds, acompanhe resultados e gerencie sua banca em
                uma única plataforma.
              </p>
              <p>
                A MK Tips reúne as ferramentas que você precisa para operar com mais organização,
                agilidade e transparência.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#planos"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--mk-green)] px-7 text-sm font-bold text-[#02070b] shadow-[0_8px_28px_rgba(112,224,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--mk-green-bright)]"
              >
                Conhecer os planos
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#como-funciona"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-white/30 bg-transparent px-7 text-sm font-semibold text-white transition-all duration-300 hover:border-white/50 hover:bg-white/5"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/35">
                  <Play className="h-3 w-3 fill-current" />
                </span>
                Ver como funciona
              </a>
            </div>

            <div className="grid max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
              {featurePills.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2.5 rounded-[10px] border border-white/15 bg-transparent px-3 py-2.5 text-[12px] font-medium leading-snug text-white"
                  >
                    <Icon
                      className="h-4 w-4 shrink-0 text-[var(--mk-green)]"
                      strokeWidth={2}
                    />
                    {item.label}
                  </div>
                )
              })}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--mk-border-green)] bg-[var(--mk-green)]/10 px-3.5 py-1.5 text-xs font-medium text-[var(--mk-green)]">
              <Lock className="h-3.5 w-3.5" />
              <span className="font-mono tracking-tight">app.mktips.com/dashboard</span>
            </div>
          </div>

          <div
            className={`motion-safe-fade relative overflow-visible lg:col-span-7 xl:col-span-7 transition-all duration-1000 ease-out ${
              ready ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <DeviceMockups />
          </div>
        </div>
      </div>
    </section>
  )
}
