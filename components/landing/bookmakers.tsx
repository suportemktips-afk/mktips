'use client'

import { useEffect, useRef, useState } from 'react'
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

function LogoChip({ name }: { name: string }) {
  return (
    <div className="flex h-14 min-w-[140px] shrink-0 items-center justify-center rounded-[12px] border border-[var(--mk-border)] bg-[var(--mk-card)] px-6">
      <span className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--mk-text-secondary)]">
        {name}
      </span>
    </div>
  )
}

export function Bookmakers() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const offsetRef = useRef(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let raf = 0
    const speed = 0.45

    const tick = () => {
      const track = trackRef.current
      if (track && !paused) {
        offsetRef.current += speed
        const half = track.scrollWidth / 2
        if (half > 0 && offsetRef.current >= half) {
          offsetRef.current -= half
        }
        track.style.transform = `translateX(-${offsetRef.current}px)`
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [paused])

  const nudge = (dir: 'left' | 'right') => {
    const track = trackRef.current
    if (!track) return
    const delta = dir === 'left' ? -220 : 220
    offsetRef.current = Math.max(0, offsetRef.current + delta)
    const half = track.scrollWidth / 2
    if (half > 0 && offsetRef.current >= half) offsetRef.current -= half
    track.style.transform = `translateX(-${offsetRef.current}px)`
  }

  const loop = [...bookmakers, ...bookmakers]

  return (
    <section className="border-y border-white/5 bg-[var(--mk-bg-secondary)] py-12 sm:py-14">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-bold text-[var(--mk-text)] sm:text-2xl">
            Compare as principais casas em segundos
          </h2>
          <p className="mt-2 text-sm text-[var(--mk-text-secondary)]">
            Encontre a melhor odd entre as casas mais usadas no mercado brasileiro.
          </p>
        </div>

        <div className="relative mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => nudge('left')}
            aria-label="Casas anteriores"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--mk-border)] bg-[var(--mk-card)] text-[var(--mk-text-secondary)] transition-colors hover:text-[var(--mk-text)] sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            className="relative min-w-0 flex-1 overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--mk-bg-secondary)] to-transparent sm:w-16"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--mk-bg-secondary)] to-transparent sm:w-16"
            />

            <div ref={trackRef} className="flex w-max gap-3 py-1 will-change-transform">
              {loop.map((name, i) => (
                <LogoChip key={`${name}-${i}`} name={name} />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => nudge('right')}
            aria-label="Próximas casas"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--mk-border)] bg-[var(--mk-card)] text-[var(--mk-text-secondary)] transition-colors hover:text-[var(--mk-text)] sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
