'use client'

import { User, Lock, Bell, Search, TrendingUp, Wallet, Plus } from 'lucide-react'

const stepsList = [
  {
    icon: User,
    title: 'Crie sua conta',
    desc: 'Faça seu cadastro e escolha o plano mais adequado para sua rotina.',
  },
  {
    icon: Lock,
    title: 'Acesse a plataforma',
    desc: 'Após a confirmação do pagamento, seu acesso é liberado automaticamente.',
  },
  {
    icon: Bell,
    title: 'Receba as oportunidades',
    desc: 'Acompanhe novas análises pelo painel ou por notificações no celular.',
  },
  {
    icon: Search,
    title: 'Compare as odds',
    desc: 'Veja rapidamente qual casa oferece a melhor cotação disponível.',
  },
  {
    icon: TrendingUp,
    title: 'Acompanhe os resultados',
    desc: 'Consulte greens, reds, ROI, Yield e todo o histórico de desempenho.',
  },
  {
    icon: Wallet,
    title: 'Controle sua banca',
    desc: 'Registre operações e acompanhe a evolução do seu caixa em tempo real.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden border-b border-white/5 bg-[var(--mk-bg)] py-20 sm:py-24"
    >
      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            Do cadastro ao controle da banca
          </h2>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0">
          {stepsList.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="flex flex-1 items-stretch lg:min-w-0">
                <div className="relative flex w-full flex-col rounded-[14px] border border-white/10 bg-[var(--mk-card)] p-5 sm:p-6">
                  <span className="mb-5 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--mk-green)] text-xs font-black text-[#02070b]">
                    {idx + 1}
                  </span>
                  <div className="mb-5 flex justify-center">
                    <Icon className="h-9 w-9 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-center text-sm font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-center text-xs leading-relaxed text-[var(--mk-text-secondary)]">
                    {step.desc}
                  </p>
                </div>

                {idx < stepsList.length - 1 && (
                  <div
                    aria-hidden
                    className="hidden shrink-0 items-center justify-center px-1.5 lg:flex"
                  >
                    <Plus className="h-4 w-4 text-[var(--mk-green)]" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
