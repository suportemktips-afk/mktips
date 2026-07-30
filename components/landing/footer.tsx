'use client'

import type { SVGProps } from 'react'

function IconInstagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconTelegram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.5 3.4 2.9 10.6c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.4 1 .9 1 .6 0 .8-.2 1.1-.5l2.7-2.6 5.6 4.1c1 .6 1.8.3 2-.9L23 4.7c.3-1.3-.5-1.9-1.5-1.3z" />
    </svg>
  )
}

function IconYoutube(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23 12.2s0-3.2-.4-4.7c-.2-.9-.9-1.6-1.8-1.8C19.2 5.2 12 5.2 12 5.2s-7.2 0-8.8.5c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.7.4-4.7zM9.8 15.5v-6.6l6 3.3-6 3.3z" />
    </svg>
  )
}

function IconWhatsApp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.1 4 4.1-1.1A9.9 9.9 0 1 0 12 2zm0 18a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-2.4.6.6-2.4-.2-.3A8.1 8.1 0 1 1 12 20zm4.5-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.8-1.1-.7-.6-1.1-1.3-1.2-1.5-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.3.2-.4 0-.1 0-.3-.1-.4-.1-.1-.5-1.3-.7-1.8-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4 2.3.9 2.3.6 2.7.6.4 0 1.3-.5 1.5-1 .2-.5.2-.9.1-1 0-.1-.2-.2-.4-.3z" />
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
              <span className="text-lg font-black tracking-tight text-[var(--mk-text)]">MK</span>
              <span className="text-lg font-black tracking-tight text-[var(--mk-green)]">TIPS</span>
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--mk-text-secondary)]">
              Plataforma de tips esportivas com histórico transparente, comparação de odds e gestão
              de banca.
            </p>
            <div className="flex gap-2">
              {socials.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--mk-border)] bg-[var(--mk-card)] text-[var(--mk-text-secondary)] transition-all hover:border-[var(--mk-border-green)] hover:text-[var(--mk-green)]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--mk-text)]">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-[var(--mk-text-secondary)] transition-colors hover:text-[var(--mk-text)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t border-white/5 pt-8">
          <p className="max-w-4xl text-[10px] leading-relaxed text-white/35">
            Apostas esportivas envolvem risco financeiro. Jogue com responsabilidade e aposte apenas
            o que você pode perder. Proibido para menores de 18 anos. Se o jogo deixou de ser
            diversão, procure ajuda.
          </p>
          <p className="text-xs font-medium text-[var(--mk-text-secondary)]">
            © 2026 MK TIPS. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
