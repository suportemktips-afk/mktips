'use client'

import Image from 'next/image'
import { ArrowRight, Play, Lock, Scale, ShieldCheck, Landmark, Bell } from 'lucide-react'

const featurePills = [
  { icon: Scale, label: 'Comparação automática de odds' },
  { icon: ShieldCheck, label: 'Histórico completo e auditado' },
  { icon: Landmark, label: 'Gestão inteligente de banca' },
  { icon: Bell, label: 'Alertas em tempo real' },
]

export function Hero({ onStartFree: _onStartFree }: { onStartFree: () => void }) {
  return (
    <section className="relative min-h-[680px] overflow-hidden bg-[#02080c] lg:min-h-[720px] xl:min-h-[760px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 76% 40%, rgba(99, 255, 0, 0.12), transparent 36%),
            linear-gradient(180deg, #02080c 0%, #02070b 100%)
          `,
        }}
      />

      <div className="mx-auto grid min-h-[680px] w-full max-w-[1840px] grid-cols-1 items-center px-6 py-12 md:px-10 lg:min-h-[720px] lg:grid-cols-[42%_58%] lg:px-16 lg:py-0 xl:min-h-[760px] xl:px-20">
        <div className="relative z-20 max-w-[640px]">
          <h1 className="text-[44px] font-extrabold leading-[1.02] tracking-[-0.045em] text-white sm:text-[52px] lg:text-[60px] xl:text-[68px]">
            Mais controle para
            <br />
            tomar melhores
            <br />
            <span className="text-[#70e000]">decisões</span> no
            <br />
            mercado esportivo
          </h1>

          <div className="mt-7 max-w-[610px] space-y-3 text-[16px] leading-[1.65] text-[#aab4bc] xl:text-[17px]">
            <p>
              Analise oportunidades, compare odds, acompanhe resultados e gerencie sua banca em
              uma única plataforma.
            </p>
            <p>
              A MK Tips reúne as ferramentas que você precisa para operar com mais organização,
              agilidade e transparência.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#planos"
              className="inline-flex h-[56px] w-[220px] items-center justify-center gap-2 rounded-[14px] bg-[#70e000] text-[15px] font-bold text-[#02070b] transition-colors hover:bg-[#7ef000]"
            >
              Conhecer os planos
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#como-funciona"
              className="inline-flex h-[56px] w-[220px] items-center justify-center gap-2.5 rounded-[14px] border border-white/25 bg-transparent text-[15px] font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/35">
                <Play className="h-3 w-3 fill-current" />
              </span>
              Ver como funciona
            </a>
          </div>

          <div className="mt-6 grid max-w-[620px] grid-cols-2 gap-3">
            {featurePills.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="inline-flex min-h-[48px] items-center gap-2.5 rounded-xl border border-white/10 bg-[#071117] px-4 text-[13px] font-medium leading-snug text-white"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#70e000]" strokeWidth={2} />
                  {item.label}
                </div>
              )
            })}
          </div>

          <div className="mt-5 inline-flex h-[44px] items-center gap-3 rounded-full border border-[#70e000]/60 bg-[#07120a] px-5 text-sm font-semibold text-[#70e000]">
            <Lock className="h-3.5 w-3.5" />
            <span className="font-mono tracking-tight">app.mktips.com/dashboard</span>
          </div>

          <div className="relative mt-10 h-[440px] w-full lg:hidden">
            <Image
              src="/images/mk-tips-hero-devices.png"
              alt="Plataforma MK Tips"
              fill
              priority
              sizes="100vw"
              className="object-contain object-center"
            />
          </div>
        </div>

        <div className="relative hidden h-[650px] w-full items-center justify-end lg:flex">
          <div className="absolute right-[-5%] top-[5%] h-[600px] w-[850px] rounded-full bg-[#65e600]/10 blur-[150px]" />
          <div className="relative z-10 h-[620px] w-full max-w-[1050px]">
            <Image
              src="/images/mk-tips-hero-devices.png"
              alt="Dashboard da MK Tips em notebook, tablet e celulares"
              fill
              priority
              sizes="(min-width: 1440px) 1000px, 58vw"
              className="object-contain object-right"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
