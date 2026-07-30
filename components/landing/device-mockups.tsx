'use client'

/** Polished HTML/CSS device stack for the hero — dark UI + neon green charts. */
export function DeviceMockups() {
  return (
    <div className="relative mx-auto h-[340px] w-full max-w-[520px] sm:h-[400px] lg:h-[440px]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:h-[360px] sm:w-[360px]"
        style={{
          background:
            'radial-gradient(circle, rgba(112,224,0,0.22) 0%, rgba(112,224,0,0.06) 45%, transparent 70%)',
        }}
      />

      {/* Laptop */}
      <div className="absolute left-1/2 top-2 z-10 w-[88%] max-w-[420px] -translate-x-1/2 sm:top-0">
        <div className="overflow-hidden rounded-[12px] border border-[var(--mk-border)] bg-[var(--mk-card)] shadow-[0_28px_80px_rgba(0,0,0,0.65)]">
          <div className="flex items-center gap-1.5 border-b border-white/5 bg-[#050d12] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-[9px] text-[var(--mk-text-secondary)]">
              app.mktips.com/dashboard
            </span>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-2 bg-[#03090e] p-2.5 sm:grid-cols-[88px_1fr] sm:p-3">
            <aside className="space-y-2 rounded-[10px] border border-white/5 bg-[#061017] p-2">
              {['Painel', 'Tips', 'Banca', 'Stats'].map((item, i) => (
                <div
                  key={item}
                  className={`rounded-md px-1.5 py-1 text-[8px] font-semibold sm:text-[9px] ${
                    i === 0
                      ? 'bg-[var(--mk-green)]/15 text-[var(--mk-green)]'
                      : 'text-[var(--mk-text-secondary)]'
                  }`}
                >
                  {item}
                </div>
              ))}
            </aside>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'ROI', value: '+18,4%', up: true },
                  { label: 'Yield', value: '+6,2%', up: true },
                  { label: 'Banca', value: 'R$ 4.280', up: true },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[10px] border border-white/5 bg-[var(--mk-card)] px-2 py-1.5"
                  >
                    <p className="text-[7px] uppercase tracking-wider text-[var(--mk-text-secondary)] sm:text-[8px]">
                      {stat.label}
                    </p>
                    <p className="font-mono text-[10px] font-bold text-[var(--mk-green)] sm:text-[11px]">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-[10px] border border-white/5 bg-[var(--mk-card)] p-2">
                <svg viewBox="0 0 240 72" className="h-14 w-full sm:h-16" aria-hidden>
                  <defs>
                    <linearGradient id="mkChartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#70e000" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#70e000" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 58 C28 52, 40 40, 60 42 C84 44, 96 22, 120 28 C148 36, 164 14, 188 18 C208 22, 224 10, 240 12 L240 72 L0 72 Z"
                    fill="url(#mkChartFill)"
                  />
                  <path
                    d="M0 58 C28 52, 40 40, 60 42 C84 44, 96 22, 120 28 C148 36, 164 14, 188 18 C208 22, 224 10, 240 12"
                    fill="none"
                    stroke="#70e000"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="hidden gap-1.5 sm:grid sm:grid-cols-2">
                {['Flamengo x Palmeiras', 'Real Madrid x Barça'].map((m) => (
                  <div
                    key={m}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-[#061017] px-2 py-1.5"
                  >
                    <span className="truncate text-[8px] text-[var(--mk-text)]">{m}</span>
                    <span className="ml-1 shrink-0 rounded bg-[var(--mk-green)]/15 px-1.5 py-0.5 font-mono text-[8px] font-bold text-[var(--mk-green)]">
                      1.92
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto h-2 w-[72%] rounded-b-md bg-[#0a1218]" />
        <div className="mx-auto h-1 w-[82%] rounded-b-sm bg-[#121a22]" />
      </div>

      {/* Tablet */}
      <div className="absolute bottom-6 left-0 z-20 hidden w-[132px] -rotate-6 overflow-hidden rounded-[14px] border border-[var(--mk-border)] bg-[var(--mk-card)] shadow-2xl sm:block">
        <div className="border-b border-white/5 bg-[#050d12] px-2 py-1.5 text-center font-mono text-[7px] text-[var(--mk-text-secondary)]">
          Tips do dia
        </div>
        <div className="space-y-1.5 bg-[#03090e] p-2">
          {[
            { t: 'Over 2.5', o: '1.85', s: '+ROI' },
            { t: 'BTTS', o: '2.10', s: 'Hot' },
            { t: 'AH -0.5', o: '1.74', s: 'Lock' },
          ].map((tip) => (
            <div
              key={tip.t}
              className="rounded-lg border border-white/5 bg-[var(--mk-bg-secondary)] px-2 py-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold text-[var(--mk-text)]">{tip.t}</span>
                <span className="font-mono text-[8px] font-bold text-[var(--mk-green)]">{tip.o}</span>
              </div>
              <span className="text-[7px] text-[var(--mk-text-secondary)]">{tip.s}</span>
            </div>
          ))}
          <svg viewBox="0 0 100 28" className="mt-1 h-6 w-full" aria-hidden>
            <path
              d="M0 22 C18 18, 28 8, 42 12 C58 16, 70 4, 100 6"
              fill="none"
              stroke="#70e000"
              strokeWidth="1.6"
            />
          </svg>
        </div>
      </div>

      {/* Phone */}
      <div className="absolute -right-1 bottom-0 z-30 w-[96px] rotate-6 overflow-hidden rounded-[18px] border border-[var(--mk-border)] bg-[#050d12] p-1.5 shadow-2xl sm:right-2 sm:w-[108px]">
        <div className="mx-auto mb-1.5 h-1.5 w-10 rounded-full bg-white/15" />
        <div className="overflow-hidden rounded-[14px] bg-[#03090e]">
          <div className="border-b border-white/5 px-2 py-1.5">
            <p className="text-[8px] font-bold text-[var(--mk-text)]">MK Tips</p>
            <p className="text-[7px] text-[var(--mk-text-secondary)]">Rendimento</p>
          </div>
          <div className="space-y-1.5 p-2">
            <div className="rounded-lg border border-[var(--mk-border-green)] bg-[var(--mk-green)]/10 px-2 py-1.5">
              <p className="text-[7px] text-[var(--mk-text-secondary)]">ROI mês</p>
              <p className="font-mono text-[12px] font-black text-[var(--mk-green)]">+24,8%</p>
            </div>
            <svg viewBox="0 0 80 36" className="h-9 w-full" aria-hidden>
              <path
                d="M0 30 C12 26, 20 18, 32 20 C46 22, 54 8, 80 10 L80 36 L0 36 Z"
                fill="rgba(112,224,0,0.18)"
              />
              <path
                d="M0 30 C12 26, 20 18, 32 20 C46 22, 54 8, 80 10"
                fill="none"
                stroke="#83f52c"
                strokeWidth="1.5"
              />
            </svg>
            <div className="grid grid-cols-2 gap-1">
              <div className="rounded-md bg-[var(--mk-card)] px-1 py-1 text-center">
                <p className="text-[6px] text-[var(--mk-text-secondary)]">Green</p>
                <p className="font-mono text-[9px] font-bold text-[var(--mk-green)]">68%</p>
              </div>
              <div className="rounded-md bg-[var(--mk-card)] px-1 py-1 text-center">
                <p className="text-[6px] text-[var(--mk-text-secondary)]">Tips</p>
                <p className="font-mono text-[9px] font-bold text-[var(--mk-text)]">142</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PhoneMockup({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative w-[220px] overflow-hidden rounded-[2.4rem] border border-[var(--mk-border)] bg-[#050d12] p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:w-[250px] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(112,224,0,0.18) 0%, transparent 65%)',
        }}
      />
      <div className="mx-auto mb-2 h-3.5 w-20 rounded-full bg-white/10" />
      <div className="overflow-hidden rounded-[1.85rem] bg-[#03090e]">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div>
            <p className="text-xs font-bold text-[var(--mk-text)]">MK Tips</p>
            <p className="text-[10px] text-[var(--mk-text-secondary)]">Painel mobile</p>
          </div>
          <span className="rounded-md bg-[var(--mk-green)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--mk-green)]">
            Live
          </span>
        </div>
        <div className="space-y-3 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-[var(--mk-border-green)] bg-[var(--mk-green)]/10 p-3">
              <p className="text-[10px] text-[var(--mk-text-secondary)]">ROI</p>
              <p className="font-mono text-lg font-black text-[var(--mk-green)]">+18,4%</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-[var(--mk-card)] p-3">
              <p className="text-[10px] text-[var(--mk-text-secondary)]">Yield</p>
              <p className="font-mono text-lg font-black text-[var(--mk-text)]">+6,2%</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-[var(--mk-card)] p-3">
            <p className="mb-2 text-[10px] font-semibold text-[var(--mk-text-secondary)]">
              Evolução da banca
            </p>
            <svg viewBox="0 0 200 70" className="h-16 w-full" aria-hidden>
              <defs>
                <linearGradient id="phoneFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#70e000" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#70e000" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 55 C30 50, 45 30, 70 34 C100 40, 120 18, 150 22 C170 25, 185 12, 200 14 L200 70 L0 70 Z"
                fill="url(#phoneFill)"
              />
              <path
                d="M0 55 C30 50, 45 30, 70 34 C100 40, 120 18, 150 22 C170 25, 185 12, 200 14"
                fill="none"
                stroke="#83f52c"
                strokeWidth="2"
              />
            </svg>
          </div>
          {[
            { match: 'Inter x Milan', odd: '1.95' },
            { match: 'PSG x Lyon', odd: '2.05' },
          ].map((row) => (
            <div
              key={row.match}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-[var(--mk-bg-secondary)] px-3 py-2.5"
            >
              <span className="text-xs text-[var(--mk-text)]">{row.match}</span>
              <span className="font-mono text-xs font-bold text-[var(--mk-green)]">{row.odd}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
