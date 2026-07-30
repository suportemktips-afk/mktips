'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Planos', href: '#planos' },
  { label: 'Resultados', href: '#resultados' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar({ onStartFree: _onStartFree }: { onStartFree: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || open
          ? 'border-b border-white/10 bg-[#02070b]/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-baseline gap-0.5" aria-label="MK TIPS, página inicial">
          <span className="text-lg font-black tracking-tight text-[var(--mk-text)]">MK</span>
          <span className="text-lg font-black tracking-tight text-[var(--mk-green)]">TIPS</span>
        </a>

        <div className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--mk-text-secondary)] transition-colors hover:text-[var(--mk-text)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center md:flex">
          <a
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-[12px] border border-white/20 bg-transparent px-5 text-sm font-semibold text-[var(--mk-text)] transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Entrar na plataforma
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--mk-text)] md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-white/10 bg-[#02070b]/98 backdrop-blur-xl md:hidden"
        >
          <div className="space-y-1 px-4 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm text-[var(--mk-text-secondary)] hover:bg-white/5 hover:text-[var(--mk-text)]"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3">
              <a
                href="/login"
                className="inline-flex h-11 w-full items-center justify-center rounded-[12px] border border-white/20 text-sm font-semibold text-[var(--mk-text)]"
              >
                Entrar na plataforma
              </a>
              <a
                href="#planos"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[var(--mk-green)] text-sm font-bold text-[#02070b]"
              >
                Conhecer os planos
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
