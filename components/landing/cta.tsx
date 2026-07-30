'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Cta({ onStartFree }: { onStartFree: () => void }) {
  return (
    <section className="relative overflow-hidden border-t border-zinc-900/40 py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.78) 40%, rgba(0,0,0,0.92) 100%),
            radial-gradient(ellipse 70% 55% at 50% 35%, rgba(0,224,138,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 90% 40% at 50% 100%, rgba(0,80,40,0.2) 0%, transparent 50%),
            url('/dashboard-mockup.png')
          `,
          backgroundSize: 'cover, cover, cover, cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-balance text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
          Sua operação não precisa continuar espalhada em vários lugares
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-400">
          Centralize análises, odds e banca em um painel feito para quem busca mais controle.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            onClick={onStartFree}
            size="lg"
            className="group h-12 w-full cursor-pointer rounded-xl bg-[#00E08A] text-sm font-bold text-black shadow-lg shadow-[#00E08A]/20 hover:bg-[#00E08A]/90 sm:w-auto"
          >
            Conhecer os planos
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <a href="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full cursor-pointer rounded-xl border-white/25 bg-transparent text-sm font-semibold text-white hover:bg-white/5 hover:text-white"
            >
              Acessar a plataforma
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
