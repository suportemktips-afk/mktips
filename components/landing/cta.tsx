'use client'

import { ArrowRight } from 'lucide-react'

export function Cta({ onStartFree: _onStartFree }: { onStartFree: () => void }) {
  return (
    <section className="relative overflow-hidden border-t border-white/5 py-24 sm:py-32">
      {/* Stadium-dark atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(105deg, rgba(2,7,11,0.92) 0%, rgba(2,7,11,0.78) 45%, rgba(2,7,11,0.55) 100%),
            radial-gradient(ellipse 70% 55% at 70% 40%, rgba(112,224,0,0.10) 0%, transparent 55%),
            radial-gradient(ellipse 90% 50% at 50% 100%, rgba(0,40,20,0.35) 0%, transparent 50%),
            linear-gradient(180deg, #061017 0%, #02070b 100%)
          `,
        }}
      />

      {/* Floodlight beams */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 20% 60% at 20% 0%, rgba(255,255,255,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 18% 55% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 22% 60% at 80% 0%, rgba(255,255,255,0.07) 0%, transparent 70%)
          `,
        }}
      />

      {/* Athlete jersey silhouette (CSS composition) */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-[4%] hidden h-[320px] w-[220px] sm:block lg:right-[8%] lg:h-[380px] lg:w-[260px]"
      >
        <div className="absolute inset-x-[18%] top-[8%] h-[18%] rounded-full bg-[#0a1520]" />
        <div className="absolute inset-x-[8%] top-[22%] h-[70%] rounded-t-[40%] bg-gradient-to-b from-[#0c1822] to-[#050d12]" />
        <div className="absolute left-1/2 top-[38%] w-[72%] -translate-x-1/2 text-center">
          <p className="text-[11px] font-black tracking-[0.2em] text-white/90 lg:text-xs">MK</p>
          <p className="text-lg font-black tracking-[0.18em] text-[var(--mk-green)] lg:text-xl">
            TIPS
          </p>
        </div>
        <div className="absolute bottom-0 left-[22%] h-[12%] w-[22%] rounded-t-md bg-[#081219]" />
        <div className="absolute bottom-0 right-[22%] h-[12%] w-[22%] rounded-t-md bg-[#081219]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <h2 className="text-balance text-2xl font-black tracking-tight text-[var(--mk-text)] sm:text-3xl lg:text-4xl">
            Sua operação não precisa continuar espalhada em vários lugares.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--mk-text-secondary)]">
            Centralize análises, odds e banca em um painel feito para quem busca mais controle.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#planos"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--mk-green)] px-7 text-sm font-bold text-[#02070b] shadow-lg shadow-[rgba(112,224,0,0.22)] transition-all hover:bg-[var(--mk-green-bright)]"
            >
              Conhecer os planos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-[12px] border border-white/25 bg-transparent px-7 text-sm font-semibold text-[var(--mk-text)] transition-all hover:bg-white/5"
            >
              Acessar a plataforma
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
