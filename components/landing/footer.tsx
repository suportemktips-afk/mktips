'use client'

import type { SVGProps } from 'react'

function IconInstagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="ig" x1="0" y1="24" x2="24" y2="0">
          <stop stopColor="#f58529" />
          <stop offset="0.5" stopColor="#dd2a7b" />
          <stop offset="1" stopColor="#515bd4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig)" />
      <circle cx="12" cy="12" r="4.2" stroke="white" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
    </svg>
  )
}

function IconTelegram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#2AABEE" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path
        d="M16.8 8.2 8.9 11.4c-.5.2-.5.5-.1.6l2 .6  .8 2.5c.1.3.2.4.4.4.2 0 .3-.1.5-.3l1.2-1.2 2.5 1.8c.5.3.8.1.9-.4l1.5-7c.2-.7-.2-1-.8-.6z"
        fill="white"
      />
    </svg>
  )
}

function IconYoutube(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#FF0000" {...props}>
      <path d="M23 12.2s0-3.2-.4-4.7c-.2-.9-.9-1.6-1.8-1.8C19.2 5.2 12 5.2 12 5.2s-7.2 0-8.8.5c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.7.4-4.7z" />
      <path d="M9.8 15.5v-6.6l6 3.3-6 3.3z" fill="white" />
    </svg>
  )
}

function IconWhatsApp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#25D366" {...props}>
      <path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.1 4 4.1-1.1A9.9 9.9 0 1 0 12 2zm5.7 14.1c-.2.7-1.3 1.2-2.1 1.4-.5.1-1.2.2-3.5-.7-2.9-1.2-4.8-4.2-4.9-4.4-.2-.2-1.3-1.7-1.3-3.3 0-1.5.8-2.3 1.1-2.6.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.8 2c.1.3 0 .5-.1.7l-.4.5c-.1.2-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1.9 2 1.2 2.3 1.3.3.1.5.1.7-.1l.7-.8c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.4 0 .1 0 .6-.2 1.2z" />
    </svg>
  )
}

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
  { icon: IconInstagram, label: 'Instagram', href: '#' },
  { icon: IconTelegram, label: 'Telegram', href: '#' },
  { icon: IconYoutube, label: 'YouTube', href: '#' },
  { icon: IconWhatsApp, label: 'WhatsApp', href: '#' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[var(--mk-bg-secondary)] py-16">
      <div className="mx-auto max-w-[1240px] space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <a href="#" className="flex items-baseline gap-0.5" aria-label="MK TIPS">
              <span className="text-lg font-black tracking-tight text-white">MK</span>
              <span className="text-lg font-black tracking-tight text-[var(--mk-green)]">TIPS</span>
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--mk-text-secondary)]">
              Análises, comparação de odds, histórico transparente e gestão de banca em um único
              lugar.
            </p>
            <div className="flex gap-2.5">
              {socials.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105"
                  >
                    <Icon className="h-7 w-7" />
                  </a>
                )
              })}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="space-y-4">
              <h3 className="text-sm font-bold text-white">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--mk-text-secondary)] transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-white/5 pt-8 text-center">
          <p className="text-[11px] leading-relaxed text-white/40">
            Apostas esportivas envolvem risco financeiro. Aposte apenas valores que você pode
            perder. Proibido para menores de 18 anos.
          </p>
          <p className="text-xs font-medium text-[var(--mk-text-secondary)]">
            © 2026 MK TIPS. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
