'use client'

/** Device stack matching hero reference: laptop + tablet + phone with ROI/Yield UI. */
export function DeviceMockups() {
  return (
    <div className="relative mx-auto h-[360px] w-full max-w-[540px] sm:h-[420px] lg:h-[460px]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:h-[380px] sm:w-[380px]"
        style={{
          background:
            'radial-gradient(circle, rgba(112,224,0,0.28) 0%, rgba(112,224,0,0.08) 42%, transparent 70%)',
        }}
      />

      {/* Laptop */}
      <div className="absolute left-1/2 top-0 z-10 w-[90%] max-w-[440px] -translate-x-1/2">
        <div className="overflow-hidden rounded-[12px] border border-white/10 bg-[#081219] shadow-[0_28px_80px_rgba(0,0,0,0.65)]">
          <div className="flex items-center gap-1.5 border-b border-white/5 bg-[#050d12] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-[9px] text-[#a5afb7]">app.mktips.com/dashboard</span>
          </div>
          <div className="space-y-2 bg-[#03090e] p-2.5 sm:p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[10px] border border-white/5 bg-[#081219] px-3 py-2">
                <p className="text-[8px] uppercase tracking-wider text-[#a5afb7]">ROI</p>
                <p className="font-mono text-sm font-bold text-white sm:text-base">12,45%</p>
                <p className="text-[8px] text-[var(--mk-green)]">+2,1% semana</p>
              </div>
              <div className="rounded-[10px] border border-white/5 bg-[#081219] px-3 py-2">
                <p className="text-[8px] uppercase tracking-wider text-[#a5afb7]">Yield</p>
                <p className="font-mono text-sm font-bold text-white sm:text-base">8,21%</p>
                <p className="text-[8px] text-[var(--mk-green)]">+1,4% semana</p>
              </div>
            </div>
            <div className="rounded-[10px] border border-white/5 bg-[#081219] p-2">
              <p className="mb-1 text-[8px] font-semibold text-[#a5afb7]">Desempenho</p>
              <svg viewBox="0 0 260 70" className="h-14 w-full sm:h-[58px]" aria-hidden>
                <defs>
                  <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#70e000" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#70e000" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 55 C35 50, 50 38, 75 40 C105 43, 120 22, 150 26 C180 30, 200 14, 230 16 C245 17, 255 12, 260 10 L260 70 L0 70 Z"
                  fill="url(#heroChartFill)"
                />
                <path
                  d="M0 55 C35 50, 50 38, 75 40 C105 43, 120 22, 150 26 C180 30, 200 14, 230 16 C245 17, 255 12, 260 10"
                  fill="none"
                  stroke="#70e000"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="hidden gap-2 sm:grid sm:grid-cols-2">
              <div className="rounded-lg border border-white/5 bg-[#061017] px-2 py-1.5">
                <p className="text-[8px] text-[#a5afb7]">Resultados recentes</p>
                <div className="mt-1 flex items-center justify-between text-[9px]">
                  <span className="text-white">Flamengo x Palmeiras</span>
                  <span className="font-semibold text-[var(--mk-green)]">Green</span>
                </div>
              </div>
              <div className="rounded-lg border border-white/5 bg-[#061017] px-2 py-1.5">
                <p className="text-[8px] text-[#a5afb7]">Comparador de odds</p>
                <div className="mt-1 flex items-center justify-between text-[9px]">
                  <span className="text-white">Melhor: 1.92</span>
                  <span className="rounded bg-[var(--mk-green)]/15 px-1.5 py-0.5 font-bold text-[var(--mk-green)]">
                    Ver
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto h-2 w-[70%] rounded-b-md bg-[#0a1218]" />
        <div className="mx-auto h-1 w-[80%] rounded-b-sm bg-[#121a22]" />
      </div>

      {/* Tablet */}
      <div className="absolute bottom-8 left-0 z-20 hidden w-[138px] -rotate-6 overflow-hidden rounded-[14px] border border-white/10 bg-[#081219] shadow-2xl sm:block">
        <div className="border-b border-white/5 bg-[#050d12] px-2 py-1.5 text-center font-mono text-[7px] text-[#a5afb7]">
          Tips do dia
        </div>
        <div className="space-y-1.5 bg-[#03090e] p-2">
          {[
            { t: 'Over 2.5', o: '1.85' },
            { t: 'BTTS', o: '2.10' },
            { t: 'AH -0.5', o: '1.74' },
          ].map((tip) => (
            <div key={tip.t} className="rounded-lg border border-white/5 bg-[#061017] px-2 py-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold text-white">{tip.t}</span>
                <span className="font-mono text-[8px] font-bold text-[var(--mk-green)]">{tip.o}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phone */}
      <div className="absolute -right-1 bottom-0 z-30 w-[100px] rotate-6 overflow-hidden rounded-[18px] border border-white/10 bg-[#050d12] p-1.5 shadow-2xl sm:right-1 sm:w-[112px]">
        <div className="mx-auto mb-1.5 h-1.5 w-10 rounded-full bg-white/15" />
        <div className="overflow-hidden rounded-[14px] bg-[#03090e]">
          <div className="border-b border-white/5 px-2 py-1.5">
            <p className="text-[8px] font-bold text-white">Dashboard</p>
          </div>
          <div className="space-y-1.5 p-2">
            <div className="grid grid-cols-2 gap-1">
              <div className="rounded-md border border-white/5 bg-[#081219] px-1 py-1 text-center">
                <p className="text-[6px] text-[#a5afb7]">ROI</p>
                <p className="font-mono text-[9px] font-bold text-white">12,45%</p>
              </div>
              <div className="rounded-md border border-white/5 bg-[#081219] px-1 py-1 text-center">
                <p className="text-[6px] text-[#a5afb7]">Yield</p>
                <p className="font-mono text-[9px] font-bold text-white">8,21%</p>
              </div>
            </div>
            <svg viewBox="0 0 80 32" className="h-8 w-full" aria-hidden>
              <path
                d="M0 26 C16 22, 24 14, 40 16 C56 18, 64 8, 80 6 L80 32 L0 32 Z"
                fill="rgba(112,224,0,0.2)"
              />
              <path
                d="M0 26 C16 22, 24 14, 40 16 C56 18, 64 8, 80 6"
                fill="none"
                stroke="#83f52c"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PhoneMockup({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative w-[240px] overflow-hidden rounded-[2.5rem] border border-white/15 bg-[#0a0f14] p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:w-[270px] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(112,224,0,0.2) 0%, transparent 65%)',
        }}
      />
      <div className="mx-auto mb-2 h-3.5 w-24 rounded-full bg-white/10" />
      <div className="overflow-hidden rounded-[2rem] bg-[#03090e]">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-bold text-white">Dashboard</p>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5afb7" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" />
          </svg>
        </div>
        <div className="space-y-3 px-3 pb-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/5 bg-[#081219] p-3">
              <p className="text-[10px] text-[#a5afb7]">ROI</p>
              <p className="font-mono text-lg font-black text-white">12,45%</p>
              <p className="text-[10px] text-[var(--mk-green)]">↑ +2,1%</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#081219] p-3">
              <p className="text-[10px] text-[#a5afb7]">Yield</p>
              <p className="font-mono text-lg font-black text-white">8,21%</p>
              <p className="text-[10px] text-[var(--mk-green)]">↑ +1,4%</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-[#081219] p-3">
            <svg viewBox="0 0 200 70" className="h-16 w-full" aria-hidden>
              <defs>
                <linearGradient id="phoneAppFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#70e000" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#70e000" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 55 C30 50, 45 30, 70 34 C100 40, 120 18, 150 22 C170 25, 185 12, 200 14 L200 70 L0 70 Z"
                fill="url(#phoneAppFill)"
              />
              <path
                d="M0 55 C30 50, 45 30, 70 34 C100 40, 120 18, 150 22 C170 25, 185 12, 200 14"
                fill="none"
                stroke="#70e000"
                strokeWidth="2.2"
              />
            </svg>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold text-[#a5afb7]">Resultados recentes</p>
            <div className="space-y-1.5">
              {[
                { m: 'Flamengo x Palmeiras', r: 'Green', ok: true },
                { m: 'Real Madrid x Barça', r: 'Red', ok: false },
                { m: 'Inter x Milan', r: 'Green', ok: true },
              ].map((row) => (
                <div
                  key={row.m}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-[#061017] px-2.5 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-white/10" />
                    <span className="text-[10px] text-white">{row.m}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold ${row.ok ? 'text-[var(--mk-green)]' : 'text-[#ff3b30]'}`}
                  >
                    {row.r}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 border-t border-white/5 bg-[#050d12] px-1 py-2.5 text-center">
          {['Dashboard', 'Tips', 'Banca', 'Perfil'].map((label, i) => (
            <div key={label} className="space-y-0.5">
              <div
                className={`mx-auto h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-[var(--mk-green)]' : 'bg-white/25'}`}
              />
              <p
                className={`text-[8px] ${i === 0 ? 'font-semibold text-[var(--mk-green)]' : 'text-[#a5afb7]'}`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
