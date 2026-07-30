'use client'

import { Search, TrendingUp, ShieldCheck, BarChart3, Bell, Users } from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'Comparador de odds',
    desc: 'Encontre a melhor cotação disponível sem precisar abrir várias casas de apostas.',
  },
  {
    icon: TrendingUp,
    title: 'Gestão de banca',
    desc: 'Acompanhe entradas, resultados, saldo, ROI e evolução da banca.',
  },
  {
    icon: ShieldCheck,
    title: 'Histórico transparente',
    desc: 'Consulte todas as operações publicadas, incluindo greens e reds.',
  },
  {
    icon: BarChart3,
    title: 'Estatísticas avançadas',
    desc: 'Analise desempenho, taxa de acerto, Yield e outros indicadores importantes.',
  },
  {
    icon: Bell,
    title: 'Alertas instantâneos',
    desc: 'Receba novas oportunidades no momento da publicação.',
  },
  {
    icon: Users,
    title: 'Ranking de tipsters',
    desc: 'Compare resultados e acompanhe o desempenho dos especialistas parceiros.',
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
          <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            Tudo o que você precisa em um único painel
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {features.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-[14px] border border-white/10 bg-[var(--mk-card)] p-5 sm:p-6"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center text-[var(--mk-green)]">
                  <Icon className="h-6 w-6" strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white sm:text-base">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--mk-text-secondary)] sm:text-[13px]">
                    {item.desc}
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
