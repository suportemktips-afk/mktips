'use client'

import React, { useEffect, useState } from 'react'
import {
  ArrowRight,
  Play,
  Monitor,
  Smartphone,
  Tablet,
  Scale,
  FileCheck,
  Wallet,
  Bell,
} from 'lucide-react'
import Image from 'next/image'

const featurePills = [
  { icon: Scale, label: 'Comparador automático de odds' },
  { icon: FileCheck, label: 'Histórico completo e auditado' },
  { icon: Wallet, label: 'Gestão inteligente de banca' },
  { icon: Bell, label: 'Alertas em tempo real' },
]

export function Hero({ onStartFree }: { onStartFree: () => void }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <section className="relative overflow-hidden bg-black pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 50% at 80% 30%, rgba(0,224,138,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 10% 80%, rgba(0,180,100,0.05) 0%, transparent 55%),
            linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div
            className={`lg:col-span-6 space-y-7 transition-all duration-700 ease-out ${
              ready ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <h1 className="max-w-[620px] text-balance text-4xl font-black leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              Mais controle para tomar melhores{' '}
              <span className="text-[#00E08A]">decisões</span> no mercado esportivo
            </h1>

            <p className="max-w-[540px] text-[15px] leading-relaxed text-zinc-400 sm:text-base">
              Organize análises, compare odds e acompanhe sua banca com transparência —
              tudo em um painel pensado para quem quer operar com mais clareza e menos ruído.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onStartFree}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#00E08A] px-7 text-sm font-bold text-black shadow-[0_8px_24px_rgba(0,224,138,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1AFF9C] hover:shadow-[0_12px_32px_rgba(0,224,138,0.4)]"
              >
                Conhecer os planos
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#como-funciona"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-transparent px-7 text-sm font-semibold text-white transition-all duration-300 hover:border-white/50 hover:bg-white/5"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Ver como funciona
              </a>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#00E08A]/30 bg-[#00E08A]/10 px-3.5 py-1.5 text-xs font-medium text-[#00E08A]">
              <Monitor className="h-3.5 w-3.5" />
              <span className="font-mono tracking-tight">app.mktips.com/dashboard</span>
            </div>

            <div className="grid max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
              {featurePills.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-300"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#00E08A]/25 bg-[#00E08A]/10 text-[#00E08A]">
                      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </span>
                    {item.label}
                  </div>
                )
              })}
            </div>
          </div>

          <div
            className={`relative flex items-center justify-center pt-4 lg:col-span-6 lg:pt-0 transition-all duration-1000 ease-out ${
              ready ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 rounded-[2rem] blur-3xl"
              style={{
                background:
                  'radial-gradient(ellipse 70% 65% at 50% 50%, rgba(0,224,138,0.12) 0%, transparent 70%)',
              }}
            />

            <div className="relative w-full max-w-md">
              <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
                <div className="flex items-center gap-1.5 border-b border-zinc-900 bg-zinc-950 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 flex items-center gap-1 font-mono text-[9px] text-zinc-500">
                    <Monitor className="h-3 w-3" /> app.mktips.com/dashboard
                  </span>
                </div>
                <div className="relative aspect-[16/10] bg-zinc-950">
                  <Image
                    src="/dashboard-mockup.png"
                    alt="Dashboard da MK Tips"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="absolute -bottom-6 -left-10 hidden w-36 -rotate-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl sm:block">
                <div className="flex items-center gap-1 border-b border-zinc-900 px-2 py-1.5">
                  <Tablet className="h-2.5 w-2.5 text-zinc-500" />
                  <span className="font-mono text-[6px] text-zinc-600">Tablet</span>
                </div>
                <div className="relative aspect-[3/4] bg-zinc-950">
                  <Image src="/tips-mockup.png" alt="Tips no tablet" fill className="object-cover" />
                </div>
              </div>

              <div className="absolute -bottom-8 -right-6 w-28 rotate-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
                <div className="flex items-center justify-center border-b border-zinc-900 py-1">
                  <Smartphone className="h-2.5 w-2.5 text-zinc-500" />
                </div>
                <div className="relative aspect-[9/16] h-40 bg-zinc-950">
                  <Image src="/tips-mockup.png" alt="Tips no celular" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
