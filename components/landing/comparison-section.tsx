'use client'

import { X, Check } from 'lucide-react'

const withoutItems = [
  'Informações espalhadas em diferentes sites',
  'Comparação manual de odds',
  'Controle da banca em planilhas',
  'Dificuldade para acompanhar resultados',
  'Falta de organização operacional',
]

const withItems = [
  'Tudo centralizado em um painel',
  'Melhor odd identificada automaticamente',
  'Gestão de banca integrada',
  'Histórico completo e auditável',
  'Indicadores atualizados em tempo real',
]

export function ComparisonSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-[var(--mk-bg)] py-20 sm:py-28">
      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            Menos tarefas manuais. Mais controle da operação.
          </h2>
        </div>

        <div className="relative mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-0">
          <div className="rounded-[14px] border border-[var(--mk-red)]/50 bg-[var(--mk-red)]/[0.04] p-6 shadow-[0_0_40px_rgba(255,59,48,0.08)] sm:p-8 md:rounded-r-none md:border-r-0">
            <h3 className="mb-6 text-center text-base font-bold text-[var(--mk-red)]">
              Sem a MK Tips
            </h3>
            <ul className="space-y-4">
              {withoutItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[var(--mk-red)]">
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-[14px] border border-[var(--mk-border-green)] bg-[var(--mk-green)]/[0.04] p-6 shadow-[0_0_40px_rgba(112,224,0,0.1)] sm:p-8 md:rounded-l-none">
            <div className="absolute -left-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[var(--mk-bg)] text-xs font-black text-white md:flex">
              VS
            </div>
            <h3 className="mb-6 text-center text-base font-bold text-[var(--mk-green)]">
              Com a MK Tips
            </h3>
            <ul className="space-y-4">
              {withItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[var(--mk-green)]">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
