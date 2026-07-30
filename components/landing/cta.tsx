'use client'

import { ArrowRight } from 'lucide-react'

export function Cta({ onStartFree: _onStartFree }: { onStartFree: () => void }) {
  return (
    <section className="relative overflow-hidden border-t border-white/5 py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(105deg, rgba(2,7,11,0.94) 0%, rgba(2,7,11,0.72) 48%, rgba(2,7,11,0.45) 100%),
            radial-gradient(ellipse 70% 55% at 70% 40%, rgba(112,224,0,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 20% 60% at 25% 0%, rgba(255,255,255,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 18% 55% at 55% 0%, rgba(255,255,255,0.05) 0%, transparent 70%),
            radial-gradient(ellipse 22% 60% at 85% 0%, rgba(255,255,255,0.06) 0%, transparent 70%),
            linear-gradient(180deg, #061017 0%, #02070b 100%)
          `,
        }}
      />

      {/* Athlete jersey composition */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-[2%] hidden h-[340px] w-[240px] sm:block lg:right-[6%] lg:h-[420px] lg:w-[280px]"
      >
        <div className="absolute inset-x-[22%] top-[4%] h-[16%] rounded-full bg-[#121820]" />
        <div className="absolute inset-x-[6%] top-[18%] h-[72%] rounded-t-[42%] bg-gradient-to-b from-[#101820] via-[#0a1016] to-[#05090e]" />
        <div className="absolute left-[8%] top-[34%] h-[28%] w-[18%] -rotate-12 rounded-l-2xl bg-[#0c141c]" />
        <div className="absolute right-[8%] top-[34%] h-[28%] w-[18%] rotate-12 rounded-r-2xl bg-[#0c141c]" />
        <div className="absolute left-1/2 top-[40%] w-[70%] -translate-x-1/2 text-center">
          <p className="text-sm font-black tracking-[0.22em] text-white lg:text-base">MK</p>
          <p className="text-2xl font-black tracking-[0.16em] text-[var(--mk-green)] lg:text-3xl">
            TIPS
          </p>
        </div>
        <div className="absolute bottom-0 left-[24%] h-[10%] w-[20%] rounded-t-md bg-[#081219]" />
        <div className="absolute bottom-0 right-[24%] h-[10%] w-[20%] rounded-t-md bg-[#081219]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <h2 className="text-balance text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
            Sua operação não precisa continuar espalhada em vários lugares
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75 sm:text-[15px]">
            Centralize análises, odds, resultados e gestão de banca em uma plataforma desenvolvida
            para quem busca mais organização e transparência.
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
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-white/30 bg-transparent px-7 text-sm font-semibold text-white transition-all hover:bg-white/5"
            >
              Entrar e começar agora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
