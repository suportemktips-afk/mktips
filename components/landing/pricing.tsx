'use client'

import { Check } from 'lucide-react'

const pricingPlans = [
  {
    name: 'Starter',
    price: '49,90',
    period: '/mês',
    description:
      'Ideal para quem quer começar com organização: tips, histórico e painel simplificado.',
    highlight: false,
    badge: null as string | null,
    cta: 'Começar no Starter',
    features: [
      'Visualização básica de tips',
      'Histórico dos últimos 30 dias',
      'Painel de controle simplificado',
      'Alertas básicos',
      'Suporte padrão',
    ],
  },
  {
    name: 'Premium',
    price: '97,90',
    period: '/mês',
    description:
      'Acesso completo à plataforma, estatísticas avançadas, histórico ilimitado e gestão de banca.',
    highlight: true,
    badge: 'Mais escolhido',
    cta: 'Assinar o Premium',
    features: [
      'Tips ilimitadas',
      'Histórico completo e auditado',
      'Métricas de ROI e Yield',
      'Gestão de banca com calculadora',
      'Suporte prioritário',
    ],
  },
  {
    name: 'VIP',
    price: '497,90',
    period: '/ano',
    description:
      'Experiência completa por 12 meses, com economia anual e atendimento VIP.',
    highlight: false,
    badge: 'VIP Anual',
    cta: 'Tornar-se VIP',
    features: [
      'Todos os recursos Premium',
      'Economia no plano anual',
      'Acesso antecipado a novidades',
      'Atendimento prioritário VIP',
      'Relatórios avançados',
    ],
  },
]

export function Pricing({
  onSelectPlan,
}: {
  onSelectPlan: (plan: 'Starter' | 'Premium' | 'VIP Anual') => void
}) {
  return (
    <section
      id="planos"
      className="relative overflow-hidden border-b border-white/5 bg-[var(--mk-bg)] py-20 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 h-[320px] w-[720px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: 'rgba(112,224,0,0.06)' }}
      />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-[var(--mk-text)] sm:text-4xl">
            Escolha o acesso ideal para sua rotina
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--mk-text-secondary)] sm:text-base">
            Acesso imediato após a confirmação. Sem fidelidade obrigatória.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-[14px] border p-6 sm:p-8 transition-all duration-300 ${
                plan.highlight
                  ? 'border-[var(--mk-border-green)] bg-[var(--mk-card)] shadow-[0_20px_60px_rgba(112,224,0,0.12)] lg:-mt-3 lg:mb-3'
                  : 'border-[var(--mk-border)] bg-[var(--mk-card)]/70 hover:bg-[var(--mk-card-hover)]'
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    plan.highlight
                      ? 'bg-[var(--mk-green)] text-[#02070b] shadow-lg shadow-[rgba(112,224,0,0.25)]'
                      : 'border border-[var(--mk-border)] bg-[var(--mk-bg-secondary)] text-[var(--mk-text-secondary)]'
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <div className="space-y-4">
                <h3 className="text-base font-bold uppercase tracking-wider text-[var(--mk-text)]">
                  {plan.name === 'VIP' ? 'VIP Anual' : plan.name}
                </h3>
                <p className="min-h-[72px] text-xs leading-relaxed text-[var(--mk-text-secondary)]">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-xs font-bold uppercase text-[var(--mk-text-secondary)]">
                    R$
                  </span>
                  <span className="font-mono text-3xl font-black tracking-tight text-[var(--mk-text)]">
                    {plan.price}
                  </span>
                  <span className="text-xs font-bold text-[var(--mk-text-secondary)]">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 border-t border-white/5 pt-5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-xs text-[var(--mk-text-secondary)]"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[var(--mk-border-green)] bg-[var(--mk-green)]/10 text-[var(--mk-green)]">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  onClick={() =>
                    onSelectPlan(
                      (plan.name === 'VIP' ? 'VIP Anual' : plan.name) as
                        | 'Starter'
                        | 'Premium'
                        | 'VIP Anual',
                    )
                  }
                  className={`w-full cursor-pointer rounded-[12px] py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                    plan.highlight
                      ? 'bg-[var(--mk-green)] text-[#02070b] hover:bg-[var(--mk-green-bright)]'
                      : 'border border-[var(--mk-border)] bg-[var(--mk-bg-secondary)] text-[var(--mk-text)] hover:border-white/25'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
