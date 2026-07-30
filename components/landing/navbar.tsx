'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Planos', href: '#planos' },
  { label: 'Resultados', href: '#resultados' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar({ onStartFree }: { onStartFree: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/5 bg-black/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2" aria-label="MK TIPS, página inicial">
          <img src="/logo-mktips.png" alt="MK TIPS" className="h-8 w-auto object-contain" />
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center md:flex">
          <a href="/login">
            <Button
              variant="outline"
              className="cursor-pointer rounded-lg border-white/20 bg-transparent px-5 text-sm font-medium text-white hover:bg-white/5 hover:text-white"
            >
              Entrar na plataforma
            </Button>
          </a>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 bg-black/95 backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-4 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3">
              <a href="/login" className="w-full">
                <Button variant="outline" className="w-full border-white/20 text-white">
                  Entrar na plataforma
                </Button>
              </a>
              <Button
                onClick={() => {
                  setOpen(false)
                  onStartFree()
                }}
                className="w-full cursor-pointer bg-[#00E08A] text-black hover:bg-[#00E08A]/90"
              >
                Conhecer os planos
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
