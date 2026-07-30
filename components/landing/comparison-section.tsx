'use client'

import { X, Check } from 'lucide-react'

const comparisonRows = [
  {
    before: 'Informações espalhadas em vários lugares',
    after: 'Tudo centralizado em um único painel',
  },
  {
    before: 'Comparar odds manualmente em cada casa',
    after: 'Comparação automática da melhor cotação',
  },
  {
    before: 'Controle de lucros em planilhas soltas',
    after: 'Dashboard com ROI e yield automáticos',
  },
  {
    before: 'Histórico incompleto ou apagado',
    after: 'Histórico completo e auditável',
  },
  {
    before: 'Rotina desorganizada e reativa',
    after: 'Gestão integrada de banca e resultados',
  },
]

export function ComparisonSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-[var(--mk-bg-secondary)] py-20 sm:py-28">
      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-[var(--mk-text)] sm:text-4xl">
            Menos tarefas manuais. Mais controle da operação.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--mk-text-secondary)] sm:text-base">
            Veja a diferença de operar com a MK Tips no centro da sua rotina.
          </p>
        </div>

        <div className="relative mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-0">
          <div className="rounded-[14px] border border-[var(--mk-red)]/30 bg-[var(--mk-red)]/[0.04] p-6 sm:p-8 md:rounded-r-none md:border-r-0">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-[var(--mk-red)]">
              Sem a MK Tips
            </h3>
            <ul className="space-y-4">
              {comparisonRows.map((row) => (
                <li
                  key={row.before}
                  className="flex items-start gap-3 text-sm text-[var(--mk-text-secondary)]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--mk-red)]/15 text-[var(--mk-red)]">
                    <X className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span>{row.before}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-[14px] border border-[var(--mk-border-green)] bg-[var(--mk-green)]/[0.04] p-6 sm:p-8 md:rounded-l-none">
            <div className="absolute -left-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--mk-border)] bg-[var(--mk-bg)] text-xs font-black text-[var(--mk-text)] md:flex">
              VS
            </div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-[var(--mk-green)]">
              Com a MK Tips
            </h3>
            <ul className="space-y-4">
              {comparisonRows.map((row) => (
                <li
                  key={row.after}
                  className="flex items-start gap-3 text-sm font-medium text-[var(--mk-text)]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--mk-green)]/15 text-[var(--mk-green)]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span>{row.after}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
