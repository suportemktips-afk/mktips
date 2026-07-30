'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const bookmakers = [
  { name: 'bet365', color: '#00B140', accent: '#FFDF1B', display: 'bet365' },
  { name: 'Betano', color: '#FF6A00', accent: '#FF6A00', display: 'Betano' },
  { name: 'Stake', color: '#FFFFFF', accent: '#FFFFFF', display: 'Stake' },
  { name: 'KTO', color: '#E10600', accent: '#E10600', display: 'KTO' },
  { name: 'SUPERBET', color: '#E30613', accent: '#E30613', display: 'SUPERBET' },
  { name: 'betfair', color: '#FFB80C', accent: '#FFB80C', display: 'betfair' },
  { name: 'novibet', color: '#00C2FF', accent: '#00C2FF', display: 'novibet' },
  { name: 'betnacional', color: '#1E90FF', accent: '#1E90FF', display: 'betnacional' },
]

function LogoChip({
  name,
  color,
  display,
}: {
  name: string
  color: string
  display: string
}) {
  return (
    <div className="flex h-16 min-w-[148px] shrink-0 items-center justify-center rounded-[12px] border border-white/10 bg-[#0b1218] px-5">
      {name === 'bet365' ? (
        <span className="text-sm font-black tracking-tight">
          <span style={{ color: '#00B140' }}>bet</span>
          <span style={{ color: '#FFDF1B' }}>365</span>
        </span>
      ) : name === 'betnacional' ? (
        <span className="flex items-center gap-2 text-sm font-bold text-white">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black text-white"
            style={{ background: color }}
          >
            BN
          </span>
          betnacional
        </span>
      ) : (
        <span className="text-sm font-bold tracking-wide" style={{ color }}>
          {display}
        </span>
      )}
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
    const speed = 0.4

    const tick = () => {
      const track = trackRef.current
      if (track && !paused) {
        offsetRef.current += speed
        const half = track.scrollWidth / 2
        if (half > 0 && offsetRef.current >= half) offsetRef.current -= half
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
    offsetRef.current = Math.max(0, offsetRef.current + (dir === 'left' ? -220 : 220))
    const half = track.scrollWidth / 2
    if (half > 0 && offsetRef.current >= half) offsetRef.current -= half
    track.style.transform = `translateX(-${offsetRef.current}px)`
  }

  const loop = [...bookmakers, ...bookmakers]

  return (
    <section className="border-y border-white/5 bg-[var(--mk-bg)] py-14 sm:py-16">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-[1.75rem]">
            Compare as principais casas em segundos
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--mk-text-secondary)] sm:text-[15px]">
            A MK Tips identifica onde está a melhor cotação para cada oportunidade, evitando
            pesquisas manuais em diferentes plataformas.
          </p>
        </div>

        <div className="relative mt-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => nudge('left')}
            aria-label="Casas anteriores"
            className="hidden h-10 w-10 shrink-0 items-center justify-center text-white/70 transition-colors hover:text-white sm:flex"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
          </button>

          <div
            className="relative min-w-0 flex-1 overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-[var(--mk-bg)] to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-[var(--mk-bg)] to-transparent"
            />

            <div ref={trackRef} className="flex w-max gap-3 py-1 will-change-transform">
              {loop.map((bm, i) => (
                <LogoChip key={`${bm.name}-${i}`} name={bm.name} color={bm.color} display={bm.display} />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => nudge('right')}
            aria-label="Próximas casas"
            className="hidden h-10 w-10 shrink-0 items-center justify-center text-white/70 transition-colors hover:text-white sm:flex"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  )
}
