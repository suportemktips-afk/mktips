'use client'

import {
  Scale,
  Wallet,
  FileCheck,
  BarChart3,
  Bell,
  Trophy,
} from 'lucide-react'

const features = [
  {
    icon: Scale,
    title: 'Comparador de odds',
    desc: 'Identifique em segundos a melhor cotação entre as principais casas.',
  },
  {
    icon: Wallet,
    title: 'Gestão de banca',
    desc: 'Controle stakes, capital e evolução do caixa com clareza.',
  },
  {
    icon: FileCheck,
    title: 'Histórico transparente',
    desc: 'Greens e reds registrados sem edições — tudo auditável.',
  },
  {
    icon: BarChart3,
    title: 'Estatísticas avançadas',
    desc: 'ROI, yield e desempenho visualizados em gráficos claros.',
  },
  {
    icon: Bell,
    title: 'Alertas instantâneos',
    desc: 'Notificações no momento exato em que uma tip é publicada.',
  },
  {
    icon: Trophy,
    title: 'Ranking de tipsters',
    desc: 'Acompanhe quem entrega mais consistência no longo prazo.',
  },
]

export function WhyThousandsChoose() {
  return (
    <section
      id="recursos"
      className="relative overflow-hidden border-b border-white/5 bg-[var(--mk-bg)] py-20 sm:py-28"
    >
      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-[var(--mk-text)] sm:text-4xl">
            Tudo o que você precisa em um único painel
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--mk-text-secondary)] sm:text-base">
            Ferramentas pensadas para organizar análise, execução e acompanhamento.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="group rounded-[14px] border border-[var(--mk-border)] bg-[var(--mk-card)] p-6 transition-all duration-300 hover:border-[var(--mk-border-green)] hover:bg-[var(--mk-card-hover)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[var(--mk-border-green)] bg-transparent text-[var(--mk-green)] transition-colors group-hover:bg-[var(--mk-green)]/10">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-sm font-bold text-[var(--mk-text)] sm:text-base">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--mk-text-secondary)] sm:text-[13px]">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
