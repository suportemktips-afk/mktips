'use client'

import { useId, useState } from 'react'
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
  const panelId = useId()
  const buttonId = useId()

  return (
    <div className="overflow-hidden rounded-[12px] border border-[var(--mk-border)] bg-[var(--mk-card)] transition-colors hover:border-white/15">
      <button
        type="button"
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen((v) => !v)
          }
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left text-sm font-semibold text-[var(--mk-text)] transition-colors hover:text-[var(--mk-green)]"
      >
        <span>{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--mk-text-secondary)] transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[var(--mk-green)]' : ''
          }`}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="border-t border-white/5 px-5 pb-5 pt-4 text-sm leading-relaxed text-[var(--mk-text-secondary)]">
            {a}
          </p>
        </div>
      </div>
    </div>
  )
}

export function Faq() {
  return (
    <section id="faq" className="relative overflow-hidden border-b border-white/5 bg-[var(--mk-bg)] py-20 sm:py-28">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-[var(--mk-text)] sm:text-4xl">
            Perguntas frequentes
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--mk-text-secondary)] sm:text-base">
            Tire dúvidas rápidas antes de escolher seu plano.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {faqItems.map((item) => (
            <AccordionItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
