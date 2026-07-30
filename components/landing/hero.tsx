'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  Bell,
  BarChart2,
  Wallet,
  Zap,
} from 'lucide-react'
import Image from 'next/image'

const benefits = [
  { icon: Wallet, label: 'Gestão Inteligente da Banca' },
  { icon: Check, label: 'Histórico 100% Transparente' },
  { icon: BarChart2, label: 'Comparação Automática de Odds' },
  { icon: TrendingUp, label: 'Dashboard de ROI e Yield' },
  { icon: Zap, label: 'Aplicativo para Celular (PWA)' },
  { icon: Bell, label: 'Alertas em Tempo Real' },
]

const proofItems = [
  'Dashboard Inteligente',
  'Histórico Auditável',
  'Gestão de Banca',
  'Estatísticas em Tempo Real',
]

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const dots: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const count = 48
    for (let i = 0; i < count; i++) {
      dots.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4,
        a: Math.random() * 0.35 + 0.05,
      })
    }

    const tick = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        d.x += d.vx
        d.y += d.vy
        if (d.x < 0) d.x = w
        if (d.x > w) d.x = 0
        if (d.y < 0) d.y = h
        if (d.y > h) d.y = 0
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,224,138,${d.a})`
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-70" aria-hidden />
}

function FloatingCard({
  className,
  delay,
  children,
}: {
  className: string
  delay: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`pointer-events-none absolute z-20 hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:flex ${className}`}
      style={{ animation: `mkFloat 5.5s ease-in-out ${delay} infinite` }}
    >
      {children}
    </div>
  )
}

export function Hero({ onStartFree }: { onStartFree: () => void }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <section className="relative overflow-hidden bg-black pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-28">
      {/* Background: estádio desfocado + luzes + vinheta (5–10%) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 55% at 75% 35%, rgba(0,224,138,0.09) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 15% 70%, rgba(0,180,100,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 90% 70% at 50% 100%, rgba(0,80,40,0.12) 0%, transparent 55%),
            linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, rgba(0,0,0,0.55) 100%)
          `,
        }}
      />
      {/* Silhueta de arquibancada / estádio bem discreta */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[45%] opacity-[0.07]"
        style={{
          background: `
            repeating-linear-gradient(90deg, transparent 0 18px, rgba(0,224,138,0.35) 18px 19px),
            linear-gradient(to top, rgba(0,224,138,0.25) 0%, transparent 70%)
          `,
          maskImage: 'linear-gradient(to top, black 0%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 85%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 45%, transparent 35%, rgba(0,0,0,0.75) 100%)',
        }}
      />
      <ParticleField />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 sm:px-20 lg:px-[120px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* ── ESQUERDA ── */}
          <div
            className={`lg:col-span-6 space-y-6 transition-all duration-700 ease-out ${
              ready ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-[#00E08A] backdrop-blur-md transition-all duration-300 hover:border-emerald-400/55 hover:bg-emerald-500/15 hover:shadow-[0_0_20px_rgba(0,224,138,0.18)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative h-2 w-2 rounded-full bg-[#00E08A]" />
              </span>
              Plataforma SaaS para Gestão de Banca Esportiva
            </div>

            {/* Headline — tamanho original da identidade */}
            <h1 className="max-w-[640px] text-balance text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Pare de perder tempo procurando oportunidades.
              <span className="mt-1 block">
                Receba tudo organizado em{' '}
                <span className="text-[#00E08A]" style={{ textShadow: '0 0 28px rgba(0,224,138,0.28)' }}>
                  uma única plataforma.
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-[620px] text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
              A MK Tips reúne análises esportivas, histórico completo de tips, comparação automática de odds,
              gestão inteligente de banca e métricas de desempenho para que você acompanhe sua evolução com
              muito mais organização e consistência.
            </p>

            {/* Benefícios — grid 2 colunas */}
            <div className="grid max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
              {benefits.map((b, i) => {
                const Icon = b.icon
                return (
                  <div
                    key={b.label}
                    className={`group flex items-center gap-2.5 rounded-xl border border-transparent px-2 py-2 text-[13px] font-semibold text-white transition-all duration-300 hover:border-emerald-500/25 hover:bg-emerald-500/[0.06] hover:shadow-[0_0_18px_rgba(0,224,138,0.1)] ${
                      ready ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                    }`}
                    style={{ transitionDelay: `${120 + i * 70}ms` }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-[#00E08A] transition-colors group-hover:bg-emerald-500/20">
                      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </span>
                    {b.label}
                  </div>
                )
              })}
            </div>

            {/* Prova social */}
            <div className="space-y-2.5 pt-1">
              <p className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 sm:text-[13px]">
                <span className="tracking-[0.15em] text-amber-400">★★★★★</span>
                <span>
                  Plataforma utilizada diariamente por apostadores que valorizam organização, análise e gestão.
                </span>
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {proofItems.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                    <Check className="h-3 w-3 text-[#00E08A]" strokeWidth={3} />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onStartFree}
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#00E08A] px-8 text-sm font-extrabold uppercase tracking-wider text-black shadow-[0_8px_28px_rgba(0,224,138,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-[#1AFF9C] hover:shadow-[0_12px_40px_rgba(0,224,138,0.45)]"
              >
                Começar Agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#como-funciona"
                className="inline-flex h-14 items-center justify-center rounded-xl border border-white/30 bg-transparent px-8 text-sm font-extrabold uppercase tracking-wider text-white transition-all duration-300 hover:scale-[1.03] hover:border-white hover:bg-white hover:text-black"
              >
                Ver a Plataforma
              </a>
            </div>
          </div>

          {/* ── DIREITA — Dashboard original + melhorias ── */}
          <div
            className={`relative flex items-center justify-center pt-6 lg:col-span-6 lg:pt-0 transition-all duration-1000 ease-out ${
              ready ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {/* Glow pulsante atrás do dashboard */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[2rem] blur-3xl"
              style={{
                background: 'radial-gradient(ellipse 70% 65% at 50% 50%, rgba(0,224,138,0.14) 0%, transparent 70%)',
                animation: 'mkGlow 4s ease-in-out infinite',
              }}
            />

            {/* Cards flutuantes glassmorphism */}
            <FloatingCard className="right-0 top-[2%]" delay="0s">
              <div className="leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">ROI</p>
                <p className="text-lg font-black text-[#00E08A]">+34,7%</p>
              </div>
            </FloatingCard>
            <FloatingCard className="-left-2 top-[22%]" delay="0.7s">
              <div className="leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Yield</p>
                <p className="text-lg font-black text-emerald-300">18,2%</p>
              </div>
            </FloatingCard>
            <FloatingCard className="-right-1 bottom-[36%]" delay="1.4s">
              <Bell className="h-3.5 w-3.5 shrink-0 text-[#00E08A]" />
              <span className="text-[11px] font-semibold text-zinc-200 whitespace-nowrap">Nova Tip Publicada</span>
            </FloatingCard>
            <FloatingCard className="bottom-[8%] left-[2%]" delay="2.1s">
              <Wallet className="h-3.5 w-3.5 shrink-0 text-[#00E08A]" />
              <span className="text-[11px] font-semibold text-zinc-200 whitespace-nowrap">Gestão da Banca Atualizada</span>
            </FloatingCard>
            <FloatingCard className="right-[4%] top-[48%]" delay="0.35s">
              <Bell className="h-3.5 w-3.5 shrink-0 text-[#00E08A]" />
              <span className="text-[11px] font-semibold text-zinc-200 whitespace-nowrap">Notificação Recebida</span>
            </FloatingCard>

            {/* Estrutura ORIGINAL do dashboard (desktop + tablet + mobile) */}
            <div
              className="relative w-full max-w-md overflow-visible rounded-2xl border border-zinc-800/90 bg-zinc-950/85 shadow-[0_32px_80px_rgba(0,0,0,0.72),0_0_60px_rgba(0,224,138,0.07)] backdrop-blur-2xl"
              style={{ animation: ready ? 'mkRise 1.1s ease-out forwards' : undefined }}
            >
              {/* Reflexo superior */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(0,224,138,0.45) 25%, rgba(255,255,255,0.2) 50%, rgba(0,224,138,0.45) 75%, transparent)',
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-4 top-0 z-10 h-16 rounded-b-3xl opacity-40"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%)',
                }}
              />

              <div className="flex items-center gap-1.5 border-b border-zinc-900 bg-zinc-950/95 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 flex items-center gap-1 font-mono text-[9px] text-zinc-500">
                  <Monitor className="h-3 w-3" /> app.mktips.com/dashboard
                </span>
              </div>

              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                <Image
                  src="/dashboard-mockup.png"
                  alt="Dashboard da MK Tips"
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* Tablet mockup — estrutura original */}
              <div className="absolute -bottom-8 -left-12 hidden w-32 -rotate-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl sm:block">
                <div className="flex items-center gap-1 border-b border-zinc-900 bg-zinc-950 px-2 py-1.5">
                  <Tablet className="h-2.5 w-2.5 text-zinc-500" />
                  <span className="font-mono text-[6px] text-zinc-600">Tablet</span>
                </div>
                <div className="relative aspect-[3/4] bg-zinc-950">
                  <Image src="/tips-mockup.png" alt="Tips no tablet" fill className="object-cover" />
                </div>
              </div>

              {/* Mobile mockup — estrutura original */}
              <div className="absolute -bottom-10 -right-8 w-24 rotate-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
                <div className="flex items-center justify-center border-b border-zinc-900 bg-zinc-950 py-1">
                  <Smartphone className="h-2.5 w-2.5 text-zinc-500" />
                </div>
                <div className="relative h-36 aspect-[9/16] bg-zinc-950">
                  <Image src="/tips-mockup.png" alt="Tips no celular" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mkFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes mkGlow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes mkRise {
          from { transform: translateY(18px); }
          to { transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
