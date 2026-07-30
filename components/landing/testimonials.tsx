'use client'

import React from 'react'
import { Star } from 'lucide-react'

const featured = {
  name: 'Mateus Silva',
  since: 'Membro desde 2026',
  review:
    'A transparência do histórico é o maior diferencial. Já passei por grupos que apagavam reds — na MK Tips tudo fica registrado com clareza. Consigo acompanhar minha evolução e tomar decisões com muito mais organização.',
  rating: 5,
  avatar:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
}

export function Testimonials() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-900/40 bg-black py-20 sm:py-28">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
            Quem utiliza recomenda
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Depoimentos de membros que organizaram a rotina com a plataforma.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60">
          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center justify-center gap-3 border-b border-zinc-800 bg-zinc-900/40 p-8 sm:border-b-0 sm:border-r">
              <img
                src={featured.avatar}
                alt={featured.name}
                className="h-24 w-24 rounded-full object-cover ring-2 ring-[#00E08A]/40"
              />
              <div className="text-center">
                <h4 className="text-sm font-bold text-white">{featured.name}</h4>
                <span className="mt-1 block text-[11px] font-medium text-zinc-500">
                  {featured.since}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
              <div className="flex gap-1 text-[#00E08A]">
                {Array.from({ length: featured.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">
                &ldquo;{featured.review}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
