'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const leftFaqs = [
  {
    q: 'Como funciona a MK Tips?',
    a: 'A MK Tips reúne tips, histórico auditado, comparação de odds, gestão de banca e métricas em um único painel — para você operar com mais organização e transparência.',
  },
  {
    q: 'Como recebo meu acesso?',
    a: 'O acesso é liberado assim que o pagamento é confirmado. Você recebe os dados de login por e-mail automaticamente.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Você pode cancelar a qualquer momento, sem multa de fidelidade, direto na área da conta.',
  },
  {
    q: 'Preciso instalar um aplicativo?',
    a: 'Não é obrigatório. Você pode usar pelo navegador ou adicionar o PWA à tela inicial do celular para receber notificações.',
  },
  {
    q: 'A MK Tips realiza as apostas por mim?',
    a: 'Não. A plataforma organiza análises, odds e gestão de banca. As decisões e apostas são sempre suas.',
  },
]

const rightFaqs = [
  {
    q: 'Os resultados ficam disponíveis no histórico?',
    a: 'Sim. Greens e reds ficam registrados de forma transparente. Não apagamos nem editamos resultados passados.',
  },
  {
    q: 'A plataforma garante lucro?',
    a: 'Não. Apostas esportivas envolvem risco. Trabalhamos com organização, gestão de banca e transparência — sem promessas de lucro garantido.',
  },
  {
    q: 'Posso utilizar mesmo sendo iniciante?',
    a: 'Sim. O plano Starter foi pensado para quem está começando e quer organizar melhor as operações.',
  },
]

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const panelId = useId()
  const buttonId = useId()

  return (
    <div className="overflow-hidden rounded-[12px] border border-white/10 bg-[var(--mk-card)]">
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
        className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left text-sm font-medium text-white sm:p-5"
      >
        <span>{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white transition-transform duration-300 ${
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
          <p className="border-t border-white/5 px-4 pb-4 pt-3 text-sm leading-relaxed text-[var(--mk-text-secondary)] sm:px-5 sm:pb-5">
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 36px, rgba(255,255,255,0.05) 36px, rgba(255,255,255,0.05) 37px)',
        }}
      />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            Perguntas frequentes
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
          <div className="space-y-3">
            {leftFaqs.map((item) => (
              <AccordionItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
          <div className="space-y-3">
            {rightFaqs.map((item) => (
              <AccordionItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
