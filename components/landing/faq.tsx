'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqItems = [
  {
    q: 'Como funciona a MK Tips?',
    a: 'A MK Tips é uma plataforma que reúne tips, histórico auditado, comparação de odds, gestão de banca e métricas em um único painel — para você operar com mais organização e transparência.',
  },
  {
    q: 'Como recebo meu acesso?',
    a: 'O acesso é liberado assim que o pagamento é confirmado. Você recebe os dados de login por e-mail automaticamente.',
  },
  {
    q: 'Posso cancelar a assinatura?',
    a: 'Sim. Você pode cancelar a qualquer momento, sem taxas de fidelidade, direto na área da conta.',
  },
  {
    q: 'Como funciona o aplicativo?',
    a: 'É um PWA: você adiciona à tela inicial pelo navegador (Chrome ou Safari), com notificações push e a mesma experiência do painel web.',
  },
  {
    q: 'O que inclui o Plano VIP?',
    a: 'O VIP Anual oferece todos os recursos Premium por 12 meses, com economia no valor anual e atendimento prioritário.',
  },
  {
    q: 'A plataforma garante lucro?',
    a: 'Não. Apostas esportivas envolvem risco. Trabalhamos com organização, gestão de banca e transparência de resultados — sem promessas de lucro garantido.',
  },
  {
    q: 'Quais casas de apostas são comparadas?',
    a: 'Comparamos as principais do mercado brasileiro, como Bet365, Betano, Stake, KTO, Superbet, Betfair e outras.',
  },
  {
    q: 'O histórico é realmente transparente?',
    a: 'Sim. Greens e reds ficam registrados. Não apagamos nem editamos resultados passados.',
  },
]

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950/40 transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between p-5 text-left text-sm font-semibold text-white transition-colors hover:text-[#00E08A]"
      >
        <span>{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[#00E08A]' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-40 border-t border-zinc-900/60' : 'max-h-0'
        }`}
      >
        <p className="p-5 text-sm leading-relaxed text-zinc-400">{a}</p>
      </div>
    </div>
  )
}

export function Faq() {
  return (
    <section id="faq" className="relative overflow-hidden border-t border-zinc-900/40 bg-black py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            Perguntas frequentes
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Tire dúvidas rápidas antes de escolher seu plano.
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item) => (
            <AccordionItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
