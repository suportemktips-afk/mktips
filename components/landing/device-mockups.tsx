'use client'

/** Hero device stack: laptop (back) + tablet odds (right) + phone (left), soft green glow. */
export function DeviceMockups() {
  const bookies = [
    { name: 'bet365', color: '#00B140' },
    { name: 'Betano', color: '#FF6A00' },
    { name: 'KTO', color: '#E10600' },
    { name: '1xBet', color: '#1B5E20' },
    { name: 'Sportingbet', color: '#C8102E' },
  ]

  const oddsRows = [
    ['1.92', '1.88', '1.85', '1.90', '1.87'],
    ['2.10', '2.05', '2.15', '2.08', '2.02'],
    ['1.74', '1.78', '1.70', '1.76', '1.72'],
    ['3.40', '3.25', '3.50', '3.30', '3.20'],
  ]

  const recent = [
    { match: 'Flamengo x Palmeiras', status: 'Green', ok: true },
    { match: 'Real Madrid x Barça', status: 'Red', ok: false },
    { match: 'Inter x Milan', status: 'Green', ok: true },
    { match: 'City x Arsenal', status: 'Green', ok: true },
  ]

  return (
    <div className="relative mx-auto h-[380px] w-full max-w-[560px] sm:h-[440px] lg:h-[480px] lg:max-w-none lg:translate-x-6 xl:translate-x-10">
      {/* Soft radial green glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[48%] top-[45%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:h-[400px] sm:w-[400px]"
        style={{
          background:
            'radial-gradient(circle, rgba(112,224,0,0.32) 0%, rgba(112,224,0,0.10) 40%, transparent 70%)',
        }}
      />

      {/* Laptop — center / back */}
      <div className="absolute left-[4%] top-2 z-10 w-[78%] max-w-[420px] sm:left-[6%] sm:top-0 lg:left-0">
        <div className="overflow-hidden rounded-[12px] border border-white/12 bg-[#071018] shadow-[0_32px_90px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between border-b border-white/5 bg-[#050d12] px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
              <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
              <span className="h-2 w-2 rounded-full bg-[#28c840]" />
            </div>
            <p className="text-[9px] font-bold tracking-wide text-white/90">
              <span className="text-white">MK</span>
              <span className="text-[var(--mk-green)]"> TIPS</span>
              <span className="ml-1 font-medium text-[#a5afb7]">Dashboard</span>
            </p>
            <span className="w-10" />
          </div>

          <div className="space-y-2 bg-[#03090e] p-2.5 sm:p-3">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="rounded-[10px] border border-white/6 bg-[#081219] px-2 py-1.5 sm:px-2.5">
                <p className="text-[7px] uppercase tracking-wider text-[#a5afb7]">ROI</p>
                <p className="font-mono text-[11px] font-bold text-white sm:text-sm">12,45%</p>
                <p className="text-[7px] font-semibold text-[var(--mk-green)]">+23% semana</p>
              </div>
              <div className="rounded-[10px] border border-white/6 bg-[#081219] px-2 py-1.5 sm:px-2.5">
                <p className="text-[7px] uppercase tracking-wider text-[#a5afb7]">Yield</p>
                <p className="font-mono text-[11px] font-bold text-white sm:text-sm">8,21%</p>
                <p className="text-[7px] font-semibold text-[var(--mk-green)]">+14% semana</p>
              </div>
              <div className="rounded-[10px] border border-white/6 bg-[#081219] px-2 py-1.5 sm:px-2.5">
                <p className="text-[7px] uppercase tracking-wider text-[#a5afb7]">Banca</p>
                <p className="font-mono text-[10px] font-bold text-white sm:text-[12px]">
                  R$ 28.560
                </p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-[var(--mk-green)]" />
                </div>
              </div>
            </div>

            <div className="rounded-[10px] border border-white/6 bg-[#081219] p-2">
              <p className="mb-1 text-[8px] font-semibold text-white">Desempenho</p>
              <svg viewBox="0 0 280 72" className="h-12 w-full sm:h-14" aria-hidden>
                <defs>
                  <linearGradient id="heroDashFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#70e000" stopOpacity="0.42" />
                    <stop offset="100%" stopColor="#70e000" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 58 C30 52, 48 40, 70 42 C98 45, 118 24, 148 28 C178 32, 200 16, 230 18 C250 20, 265 12, 280 10 L280 72 L0 72 Z"
                  fill="url(#heroDashFill)"
                />
                <path
                  d="M0 58 C30 52, 48 40, 70 42 C98 45, 118 24, 148 28 C178 32, 200 16, 230 18 C250 20, 265 12, 280 10"
                  fill="none"
                  stroke="#70e000"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="rounded-[10px] border border-white/6 bg-[#081219] px-2 py-1.5">
              <p className="mb-1 text-[8px] font-semibold text-[#a5afb7]">Resultados recentes</p>
              <div className="space-y-1">
                {recent.map((row) => (
                  <div
                    key={row.match}
                    className="flex items-center justify-between gap-2 border-t border-white/5 pt-1 first:border-0 first:pt-0"
                  >
                    <span className="truncate text-[8px] text-white/90 sm:text-[9px]">
                      {row.match}
                    </span>
                    <span
                      className={`shrink-0 text-[8px] font-bold sm:text-[9px] ${
                        row.ok ? 'text-[var(--mk-green)]' : 'text-[#ff3b30]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto h-2.5 w-[68%] rounded-b-md bg-[#0a1218]" />
        <div className="mx-auto h-1 w-[78%] rounded-b-sm bg-[#141c24]" />
      </div>

      {/* Smartphone — left / foreground */}
      <div className="absolute bottom-2 left-0 z-30 w-[108px] -rotate-6 overflow-hidden rounded-[22px] border border-white/15 bg-[#050d12] p-1.5 shadow-2xl sm:bottom-4 sm:w-[122px]">
        <div className="mx-auto mb-1.5 h-1.5 w-10 rounded-full bg-white/20" />
        <div className="overflow-hidden rounded-[16px] bg-[#03090e]">
          <div className="border-b border-white/5 px-2 py-1.5">
            <p className="text-[8px] font-bold text-white">Dashboard</p>
          </div>
          <div className="space-y-1.5 p-1.5">
            <div className="rounded-lg border border-white/8 bg-[#081219] p-1.5">
              <p className="text-[7px] text-[#a5afb7]">ROI</p>
              <p className="font-mono text-[13px] font-black text-white">12,45%</p>
              <svg viewBox="0 0 80 22" className="mt-1 h-5 w-full" aria-hidden>
                <path
                  d="M0 16 C14 14, 22 8, 36 10 C52 12, 62 4, 80 3"
                  fill="none"
                  stroke="#70e000"
                  strokeWidth="1.6"
                />
              </svg>
            </div>
            <div className="rounded-lg border border-white/8 bg-[#081219] p-1.5">
              <p className="text-[7px] text-[#a5afb7]">Yield</p>
              <p className="font-mono text-[13px] font-black text-white">8,21%</p>
              <svg viewBox="0 0 80 22" className="mt-1 h-5 w-full" aria-hidden>
                <path
                  d="M0 14 C18 15, 28 9, 44 10 C58 11, 68 5, 80 4"
                  fill="none"
                  stroke="#83f52c"
                  strokeWidth="1.6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet — right / foreground (odds comparator) */}
      <div className="absolute -right-2 bottom-0 z-20 w-[168px] rotate-[7deg] overflow-hidden rounded-[16px] border border-white/12 bg-[#071018] shadow-2xl sm:-right-4 sm:bottom-2 sm:w-[196px] lg:-right-8 xl:-right-12">
        <div className="border-b border-white/5 bg-[#050d12] px-2.5 py-2">
          <p className="text-[9px] font-bold text-white">Comparador de odds</p>
        </div>
        <div className="bg-[#03090e] p-2">
          <div className="mb-1.5 grid grid-cols-5 gap-0.5">
            {bookies.map((b) => (
              <div
                key={b.name}
                className="truncate rounded px-0.5 py-1 text-center text-[5px] font-black leading-tight text-white sm:text-[6px]"
                style={{ background: `${b.color}33`, color: b.color }}
                title={b.name}
              >
                {b.name === 'Sportingbet' ? 'SB' : b.name.slice(0, 5)}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {oddsRows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-5 gap-0.5">
                {row.map((odd, ci) => {
                  const isBest = Number(odd) === Math.max(...row.map((v) => Number(v)))
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      className={`rounded px-0.5 py-1 text-center font-mono text-[7px] font-bold sm:text-[8px] ${
                        isBest
                          ? 'bg-[var(--mk-green)] text-[#02070b]'
                          : 'bg-[#0b1520] text-white/80'
                      }`}
                    >
                      {odd}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between rounded-md border border-white/8 bg-[#081219] px-2 py-1.5">
            <span className="text-[7px] text-[#a5afb7]">Melhor odd</span>
            <span className="font-mono text-[9px] font-black text-[var(--mk-green)]">3.50</span>
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
              <p className="text-[10px] text-[var(--mk-green)]">↑ +23%</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#081219] p-3">
              <p className="text-[10px] text-[#a5afb7]">Yield</p>
              <p className="font-mono text-lg font-black text-white">8,21%</p>
              <p className="text-[10px] text-[var(--mk-green)]">↑ +14%</p>
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
