'use client'

import React from 'react'
import { Camera, Send, MessageCircle } from 'lucide-react'

const columns = [
  {
    title: 'Produto',
    links: [
      { label: 'Como funciona', href: '#como-funciona' },
      { label: 'Recursos', href: '#recursos' },
      { label: 'Planos', href: '#planos' },
      { label: 'Resultados', href: '#resultados' },
    ],
  },
  {
    title: 'Institucional',
    links: [
      { label: 'Termos de Uso', href: '#' },
      { label: 'Política de Privacidade', href: '#' },
      { label: 'Contato', href: '#' },
    ],
  },
  {
    title: 'Suporte',
    links: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Central de Ajuda', href: '#' },
      { label: 'WhatsApp', href: '#' },
    ],
  },
]

const socials = [
  { icon: Camera, label: 'Instagram', href: '#' },
  { icon: Send, label: 'Telegram', href: '#' },
  { icon: MessageCircle, label: 'WhatsApp', href: '#' },
]

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950/80 py-16">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <a href="#" className="flex items-center gap-2" aria-label="MK TIPS">
              <img src="/logo-mktips.png" alt="MK TIPS" className="h-8 w-auto object-contain" />
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
              Plataforma de tips esportivas com histórico transparente, comparação de odds e gestão de banca.
            </p>
            <div className="flex gap-2">
              {socials.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-400 transition-all hover:border-[#00E08A]/30 hover:text-[#00E08A]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-zinc-500 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t border-zinc-900 pt-8">
          <p className="max-w-4xl text-[10px] leading-relaxed text-zinc-600">
            Apostas esportivas envolvem risco financeiro. Jogue com responsabilidade e aposte apenas o que
            você pode perder. Proibido para menores de 18 anos. Se o jogo deixou de ser diversão, procure ajuda.
          </p>
          <p className="text-xs font-medium text-zinc-500">
            © {new Date().getFullYear()} MK TIPS. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
