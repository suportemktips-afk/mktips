'use client'

import { Star } from 'lucide-react'

const featured = {
  name: 'Mateus Silva',
  location: 'São Paulo, BR',
  since: 'Membro desde 2024',
  review:
    'Já participei de grupos que escondiam reds e mudavam o histórico. Na MK Tips tudo fica registrado com clareza — consigo acompanhar minha evolução, comparar odds e organizar a banca sem improvisar. Hoje opero com muito mais controle.',
  rating: 5,
  avatar:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
}

export function Testimonials() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-[var(--mk-bg-secondary)] py-20 sm:py-28">
      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-[var(--mk-text)] sm:text-4xl">
            Quem utiliza recomenda
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--mk-text-secondary)] sm:text-base">
            Depoimentos de membros que organizaram a rotina com a plataforma.
          </p>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-[14px] border border-[var(--mk-border)] bg-[var(--mk-card)]">
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center justify-center gap-3 border-b border-white/5 bg-[var(--mk-bg-secondary)]/60 p-8 sm:border-b-0 sm:border-r">
              <img
                src={featured.avatar}
                alt={featured.name}
                className="h-24 w-24 rounded-full object-cover ring-2 ring-[var(--mk-green)]/40"
              />
              <div className="text-center">
                <h4 className="text-sm font-bold text-[var(--mk-text)]">{featured.name}</h4>
                <span className="mt-1 block text-[11px] font-medium text-[var(--mk-text-secondary)]">
                  {featured.location}
                </span>
                <span className="mt-1 block text-[11px] font-medium text-[var(--mk-text-secondary)]">
                  {featured.since}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
              <div className="flex gap-1 text-[var(--mk-green)]">
                {Array.from({ length: featured.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-[var(--mk-text)] sm:text-base">
                &ldquo;{featured.review}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
