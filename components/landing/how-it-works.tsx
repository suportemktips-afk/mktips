'use client'

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
    <section
      id="como-funciona"
      className="relative overflow-hidden border-b border-white/5 bg-[var(--mk-bg)] py-20 sm:py-28"
    >
      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-[var(--mk-text)] sm:text-4xl">
            Do cadastro ao controle da banca
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--mk-text-secondary)] sm:text-base">
            Um fluxo simples para organizar sua rotina no mercado esportivo.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Dotted connectors (desktop) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-[72px] hidden lg:block"
          >
            <div className="mx-auto grid max-w-5xl grid-cols-3 gap-5">
              <div className="relative col-span-3 h-0">
                <div className="absolute left-[16%] right-[16%] top-0 border-t border-dashed border-[var(--mk-green)]/35" />
                <div className="absolute left-[16%] top-[148px] right-[50%] border-t border-dashed border-[var(--mk-green)]/25" />
              </div>
            </div>
          </div>

          {stepsList.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="group relative flex flex-col gap-4 rounded-[14px] border border-[var(--mk-border)] bg-[var(--mk-card)] p-6 transition-all duration-300 hover:border-[var(--mk-border-green)] hover:bg-[var(--mk-card-hover)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--mk-green)] text-sm font-black text-[var(--mk-green)]">
                    {idx + 1}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--mk-border)] bg-[var(--mk-bg-secondary)] text-[var(--mk-green)] transition-colors group-hover:border-[var(--mk-border-green)] group-hover:bg-[var(--mk-green)]/10">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--mk-text)] sm:text-base">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--mk-text-secondary)] sm:text-[13px]">
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
