'use client'

const featured = {
  name: 'Mateus Silva',
  location: 'São Paulo — SP',
  since: 'Membro desde 2026',
  review:
    'Já participei de grupos que mostravam apenas os resultados positivos. Na MK Tips, consigo acompanhar todo o histórico, analisar o ROI e controlar minha banca com muito mais clareza.',
  avatar:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
}

export function Testimonials() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-[var(--mk-bg)] py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.12]"
      >
        <svg viewBox="0 0 800 160" className="h-40 w-full max-w-4xl" preserveAspectRatio="none">
          {Array.from({ length: 48 }).map((_, i) => {
            const h = 20 + Math.abs(Math.sin(i * 0.55) * 50) + (i % 3) * 8
            return (
              <rect
                key={i}
                x={i * 16 + 8}
                y={(160 - h) / 2}
                width="4"
                height={h}
                rx="2"
                fill="#a5afb7"
              />
            )
          })}
        </svg>
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            Quem utiliza recomenda
          </h2>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-[14px] border border-white/10 bg-[var(--mk-card)]/90 backdrop-blur-sm">
          <div className="grid grid-cols-1 items-center gap-6 p-6 sm:grid-cols-[120px_1fr_160px] sm:gap-8 sm:p-8 lg:p-10">
            <div className="flex justify-center sm:justify-start">
              <img
                src={featured.avatar}
                alt={featured.name}
                className="h-24 w-24 rounded-full object-cover ring-2 ring-white/80"
              />
            </div>

            <div className="relative">
              <span
                aria-hidden
                className="absolute -left-1 -top-4 font-serif text-5xl leading-none text-[var(--mk-green)]"
              >
                “
              </span>
              <p className="pl-4 text-sm leading-relaxed text-[var(--mk-text-secondary)] sm:text-base sm:text-white/85">
                {featured.review}
              </p>
            </div>

            <div className="text-center sm:text-left">
              <h4 className="text-sm font-bold text-white">{featured.name}</h4>
              <p className="mt-1 text-xs text-[var(--mk-text-secondary)]">{featured.location}</p>
              <p className="mt-1 text-xs text-[var(--mk-text-secondary)]">{featured.since}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
