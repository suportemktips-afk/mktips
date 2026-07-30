'use client'

import { Check } from 'lucide-react'

const pricingPlans = [
  {
    name: 'Starter',
    price: '49,90',
    period: 'por mês',
    description: 'Para quem está começando e deseja organizar melhor suas operações.',
    highlight: false,
    badge: null as string | null,
    cta: 'Começar no Starter',
    features: [
      'Até 5 tips por dia',
      'Histórico dos últimos 30 dias',
      'Painel de controle simplificado',
      'Alertas básicos',
      'Suporte padrão',
    ],
  },
  {
    name: 'Premium',
    price: '97,90',
    period: 'por mês',
    description: 'Para quem deseja acesso completo à plataforma e às ferramentas avançadas.',
    highlight: true,
    badge: 'Mais escolhido',
    cta: 'Assinar o Premium',
    features: [
      'Tips ilimitadas',
      'Histórico completo e auditado',
      'Estatísticas avançadas',
      'Gestão de banca',
      'Alertas push',
      'Suporte prioritário',
    ],
  },
  {
    name: 'VIP',
    price: '497,90',
    period: 'por ano',
    description: 'Para quem busca economia e acesso aos recursos mais completos da MK Tips.',
    highlight: false,
    badge: null as string | null,
    cta: 'Tornar-se VIP',
    features: [
      'Todos os recursos do Premium',
      'Maior economia no plano anual',
      'Automação via WhatsApp CRM',
      'Acesso antecipado a novos módulos',
      'Atendimento VIP prioritário',
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
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-12deg, transparent, transparent 28px, rgba(112,224,0,0.05) 28px, rgba(112,224,0,0.05) 29px)',
        }}
      />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            Escolha o acesso ideal para sua rotina
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--mk-text-secondary)] sm:text-base">
            Sem multa de cancelamento e com liberação imediata após a confirmação do pagamento.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-[14px] border p-6 sm:p-8 transition-all duration-300 ${
                plan.highlight
                  ? 'border-[var(--mk-green)] bg-[var(--mk-card)] shadow-[0_20px_60px_rgba(112,224,0,0.14)] lg:-mt-2 lg:mb-2'
                  : 'border-white/10 bg-[var(--mk-card)]/80'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--mk-green)] px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#02070b]">
                  {plan.badge}
                </span>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">
                  {plan.name === 'VIP' ? 'VIP Anual' : plan.name}
                </h3>
                <p className="min-h-[48px] text-sm leading-relaxed text-[var(--mk-text-secondary)]">
                  {plan.description}
                </p>

                <div className="flex flex-wrap items-baseline gap-1.5 pt-1">
                  <span className="text-sm font-medium text-[var(--mk-text-secondary)]">R$</span>
                  <span className="font-mono text-4xl font-black tracking-tight text-[var(--mk-green)]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[var(--mk-text-secondary)]">{plan.period}</span>
                </div>

                <ul className="space-y-3 border-t border-white/5 pt-5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-[var(--mk-text-secondary)]"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mk-green)]"
                        strokeWidth={2.5}
                      />
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
                  className={`w-full cursor-pointer rounded-[12px] py-3 text-sm font-bold transition-all ${
                    plan.highlight
                      ? 'bg-[var(--mk-green)] text-[#02070b] hover:bg-[var(--mk-green-bright)]'
                      : 'border border-white/20 bg-transparent text-white hover:bg-white/5'
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
