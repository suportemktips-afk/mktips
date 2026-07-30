'use client'

import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const bookmakers = [
  'Bet365',
  'Betano',
  'Stake',
  'KTO',
  'Superbet',
  'Betfair',
  'Novibet',
  'Betnacional',
]

export function Bookmakers() {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' })
  }

  return (
    <section className="border-y border-zinc-900/80 bg-zinc-950/50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-zinc-400 sm:text-base">
          Compare as principais casas em segundos
        </p>

        <div className="relative mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Anterior"
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:text-white sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={scrollerRef}
            className="flex flex-1 gap-3 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {bookmakers.map((name) => (
              <div
                key={name}
                className="flex h-14 min-w-[120px] shrink-0 items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-5"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 sm:text-sm">
                  {name}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Próximo"
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:text-white sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
