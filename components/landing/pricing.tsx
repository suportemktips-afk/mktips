'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <section id="planos" className="relative overflow-hidden border-b border-zinc-900/40 bg-black py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[350px] w-[750px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            Escolha o acesso ideal para sua rotina
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Acesso imediato após a confirmação. Sem fidelidade obrigatória.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 sm:p-8 transition-all duration-300 ${
                plan.highlight
                  ? 'border-[#00E08A]/50 bg-zinc-950/70 shadow-xl shadow-[#00E08A]/10 lg:-mt-3 lg:mb-3'
                  : 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-800'
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    plan.highlight
                      ? 'bg-[#00E08A] text-black shadow-lg shadow-[#00E08A]/20'
                      : 'border border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <div className="space-y-4">
                <h3 className="text-base font-bold uppercase tracking-wider text-white">
                  {plan.name === 'VIP' ? 'VIP Anual' : plan.name}
                </h3>
                <p className="min-h-[72px] text-xs leading-relaxed text-zinc-400">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-xs font-bold uppercase text-zinc-500">R$</span>
                  <span className="font-mono text-3xl font-black tracking-tight text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs font-bold text-zinc-500">{plan.period}</span>
                </div>

                <ul className="space-y-3 border-t border-zinc-900 pt-5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-zinc-400">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[#00E08A]">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Button
                  onClick={() =>
                    onSelectPlan((plan.name === 'VIP' ? 'VIP Anual' : plan.name) as 'Starter' | 'Premium' | 'VIP Anual')
                  }
                  className={`w-full cursor-pointer rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                    plan.highlight
                      ? 'bg-[#00E08A] text-black hover:bg-[#00E08A]/90'
                      : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
