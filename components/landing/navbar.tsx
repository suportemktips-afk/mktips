'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'

const links = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Planos', href: '#planos' },
  { label: 'Resultados', href: '#resultados' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar({ onStartFree: _onStartFree }: { onStartFree: () => void }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="relative z-50 h-[80px] border-b border-white/[0.04]">
      <div className="mx-auto flex h-full w-full max-w-[1840px] items-center justify-between px-6 md:px-10 lg:px-16 xl:px-20">
        <a href="#" className="flex items-baseline gap-0.5" aria-label="MK TIPS, página inicial">
          <span className="text-lg font-black tracking-tight text-white sm:text-xl">MK</span>
          <span className="text-lg font-black tracking-tight text-[#70e000] sm:text-xl">TIPS</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex lg:gap-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-[#a5afb7] transition-colors hover:text-white lg:px-3.5 lg:text-[14px]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center md:flex">
          <a
            href="/login"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#70e000]/70 bg-transparent px-5 text-sm font-semibold text-white transition-colors hover:border-[#70e000] hover:bg-[#70e000]/5"
          >
            Entrar e começar agora
            <ArrowRight className="h-4 w-4 text-[#70e000]" />
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-[80px] z-50 border-t border-white/10 bg-[#02070b]/98 backdrop-blur-xl md:hidden"
        >
          <div className="space-y-1 px-6 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm text-white/75 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3">
              <a
                href="/login"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#70e000]/70 text-sm font-semibold text-white"
              >
                Entrar e começar agora
                <ArrowRight className="h-4 w-4 text-[#70e000]" />
              </a>
              <a
                href="#planos"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[#70e000] text-sm font-bold text-[#02070b]"
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
