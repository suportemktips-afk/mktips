'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { db } from '@/lib/db'
import { Rocket, ArrowRight, Lock } from 'lucide-react'
import { AreaChart } from '@/components/ui/charts'

export default function LeveragingPage() {
  const router = useRouter()
  const [purchased, setPurchased] = useState<string[]>([])
  const [stages, setStages] = useState<any[]>([])
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  
  // Checkout modal state
  const [showCheckout, setShowCheckout] = useState<string | null>(null)
  const [pixCode, setPixCode] = useState(false)
  const [loading, setLoading] = useState(false)

  // Velana integration states (Pix)
  const [velanaPixCode, setVelanaPixCode] = useState<string>('')
  const [loadingVelana, setLoadingVelana] = useState<boolean>(false)

  const challenges = [
    { id: 'starter', name: 'Alavancagem Starter', price: 29.90, bank: 50, duration: 10, level: 'Iniciante', badge: 'Starter', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
    { id: 'pro', name: 'Alavancagem Pro', price: 97.00, bank: 100, duration: 5, level: 'Intermediário', badge: 'PRO', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' },
    { id: 'elite', name: 'Alavancagem Elite', price: 197.00, bank: 200, duration: 10, level: 'Avançado', badge: 'ELITE', color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/10' }
  ]

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('reset') === 'true') {
      localStorage.removeItem('mktips_purchased_challenges');
      localStorage.removeItem('mktips_free_leverage_used');
      const active = db.getActiveUser();
      if (active) {
        const users = db.getUsers();
        const updated = users.map(u => {
          if (u.id === active.id) {
            return { ...u, plan: 'Free' as const, daysRemaining: 0 }
          }
          return u;
        });
        db.setUsers(updated);
      }
      window.location.href = window.location.pathname;
      return
    }

    setPurchased(db.getPurchasedChallenges())
    setStages(db.getChallengeStages())
    setUser(db.getActiveUser())
  }, [activeChallenge])

  const generateVelanaPix = async (chalId: string) => {
    const selectedChal = challenges.find(c => c.id === chalId)
    if (!selectedChal) return
    setLoadingVelana(true)
    try {
      const res = await fetch('/api/payment/velana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'cliente@mktips.com',
          name: user?.name || 'Cliente MK Tips',
          amount: selectedChal.price,
          cpf: user?.cpf || '00000000000',
          description: `Desafio ${selectedChal.name} - MK Tips`
        })
      })
      const data = await res.json()
      if (data.success) {
        setVelanaPixCode(data.qrCode)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingVelana(false)
    }
  }

  const handleBuy = (challengeId: string) => {
    router.push(`/checkout?challenge=${challengeId}`)
  }

  const confirmPurchase = () => {
    if (!showCheckout) return
    setLoading(true)
    setTimeout(() => {
      const nextList = [...purchased, showCheckout]
      db.setPurchasedChallenges(nextList)
      setPurchased(nextList)
      db.addLog('Payment', `Desafio ${showCheckout} comprado com sucesso.`)
      
      setLoading(false)
      setActiveChallenge(showCheckout)
      setShowCheckout(null)
      setPixCode(false)
      setVelanaPixCode('')
    }, 2000)
  }

  const selectedChallengeData = challenges.find(c => c.id === activeChallenge)
  const activeStages = stages.filter(s => s.challengeId === activeChallenge)

  // Calculations for dashboard
  const currentStep = activeStages.filter(s => s.status === 'Pendente')[0]?.stepNumber || activeStages.length + 1
  const greensCount = activeStages.filter(s => s.status === 'Green').length
  const redsCount = activeStages.filter(s => s.status === 'Red').length

  const mockChartData = [
    { label: 'Início', value: selectedChallengeData?.bank || 50 },
    { label: 'Etapa 1', value: (selectedChallengeData?.bank || 50) + (greensCount * 25) }
  ]

  const hasPaidPlan = Boolean(user?.plan && user.plan !== 'Free')
  const hasPurchasedChallenge = purchased.length > 0
  // Cliente novo (Free) fica bloqueado até pagar plano ou um desafio
  const isAccessLocked = !hasPaidPlan && !hasPurchasedChallenge



  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Rocket className="w-7 h-7 text-emerald-500" />
            Desafios de Alavancagem
          </h1>
          <p className="text-sm text-zinc-400">Entre em estratégias fechadas de alavancagem com gestão e metas claras.</p>
        </div>
        {activeChallenge && (
          <button
            onClick={() => setActiveChallenge(null)}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold rounded text-xs hover:bg-zinc-850 cursor-pointer"
          >
            Ver Todos os Desafios
          </button>
        )}
      </div>

      {isAccessLocked ? (
        /* Bloqueio para cliente novo / Free até pagar */
        <Card className="border-zinc-850 bg-zinc-950/80 p-8 text-center space-y-6 max-w-2xl mx-auto border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Desafio de Alavancagem Bloqueado</h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
              Clientes novos no plano Free não têm acesso liberado. Pague um plano ativo ou um desafio para desbloquear as gestões de alavancagem.
            </p>
          </div>

          <a
            href="/dashboard/subscription"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Fazer Upgrade do Plano
          </a>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {challenges.map(chal => (
              <div key={chal.id} className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-850 flex flex-col justify-between text-left space-y-3">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">{chal.level}</span>
                  <span className="font-bold text-white text-xs block mt-1">{chal.name}</span>
                </div>
                <span className="text-emerald-400 font-black text-sm block">R$ {chal.price.toFixed(2)}</span>
                <button
                  onClick={() => handleBuy(chal.id)}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-bold rounded cursor-pointer transition-colors"
                >
                  Pagar e Desbloquear
                </button>
              </div>
            ))}
          </div>
        </Card>
      ) : !activeChallenge ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {challenges.map(chal => {
              const hasAccess = purchased.includes(chal.id)
              return (
                <Card key={chal.id} className="border-zinc-850 bg-zinc-900/30 flex flex-col justify-between">
                  <CardHeader className="flex flex-row justify-between items-start pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{chal.name}</h3>
                      <p className="text-[10px] text-zinc-550 mt-1">{chal.level} • {chal.duration} dias</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${chal.color} ${chal.border} ${chal.bg}`}>
                      {chal.badge}
                    </span>
                  </CardHeader>
                  <CardContent className="py-4 space-y-3 text-xs">
                    <div className="p-3 bg-zinc-950 rounded border border-zinc-900/80">
                      <span className="text-zinc-500 uppercase tracking-wider text-[9px] block">Meta Inicial</span>
                      <span className="text-base font-black text-white">R$ {chal.bank}</span>
                    </div>
                    <p className="text-zinc-450 leading-relaxed">Multiplicação de banca controlada por analistas profissionais da OddVault.</p>
                  </CardContent>
                  <div className="p-4 border-t border-zinc-850">
                    {hasAccess ? (
                      <button
                        onClick={() => setActiveChallenge(chal.id)}
                        className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-semibold rounded text-xs cursor-pointer transition-colors"
                      >
                        Acessar Desafio
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(chal.id)}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        Comprar Agora - R$ {chal.price.toFixed(2)}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )
                  }
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        /* Challenge details page unlocked */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Steps tracker card */}
            <Card className="border-zinc-850 bg-zinc-900/30">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Sequência das Etapas</CardTitle>
                <CardDescription>Siga cada uma das entradas recomendadas pelos analistas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {activeStages.length > 0 ? (
                  activeStages.map(stage => (
                    <div key={stage.id} className="p-4 bg-zinc-950/60 rounded-lg border border-zinc-900 flex justify-between items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-850 rounded text-[9px] font-bold text-zinc-400">Etapa {stage.stepNumber}</span>
                          <span className="text-[10px] text-zinc-550">{stage.time}</span>
                        </div>
                        <h4 className="font-bold text-white mt-2 leading-tight">{stage.match}</h4>
                        <p className="text-[10px] text-zinc-400 mt-1">Aposta: <strong className="text-white">{stage.market}</strong> • Odd: <strong className="text-emerald-400">{stage.odd}</strong></p>
                        <p className="text-[10px] text-zinc-500 italic mt-2">"{stage.justification}"</p>
                      </div>

                      {/* Status */}
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${
                        stage.status === 'Green' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        stage.status === 'Red' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}>
                        {stage.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-zinc-550">Aguardando a liberação da primeira etapa pela equipe técnica.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Dashboard metrics */}
            <Card className="border-zinc-850 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Progresso da Alavancagem</CardTitle>
                <CardDescription>Confira sua curva de saldo e etapas cumpridas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-900/40 rounded border border-zinc-850">
                    <span className="text-[9px] text-zinc-550 uppercase tracking-wider block">Etapa Atual</span>
                    <span className="text-lg font-black text-white">{currentStep}</span>
                  </div>
                  <div className="p-3 bg-zinc-900/40 rounded border border-zinc-850">
                    <span className="text-[9px] text-zinc-550 uppercase tracking-wider block">Resultado (G/R)</span>
                    <span className="text-lg font-black text-emerald-400">{greensCount}G <span className="text-red-400">{redsCount}R</span></span>
                  </div>
                </div>

                {/* Simulated growth chart */}
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold block mb-2">Evolução do Saldo</span>
                  <AreaChart data={mockChartData} height={150} color="#10B981" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Purchase Modal checkout */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 text-xs">
            <CardHeader className="flex justify-between flex-row items-center border-b border-zinc-900 pb-4">
              <div>
                <CardTitle className="text-base font-bold">Comprar Desafio Premium</CardTitle>
                <CardDescription>Liberação automática e acesso permanente.</CardDescription>
              </div>
              <button onClick={() => { setShowCheckout(null); setPixCode(false); setVelanaPixCode(''); }} className="text-zinc-550 hover:text-white">✕</button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="p-3 bg-zinc-900/50 rounded border border-zinc-850 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Checkout de Alavancagem</span>
                  <span className="text-[9px] text-zinc-500">Transação criptografada segura</span>
                </div>
                <span className="text-emerald-400 font-bold">R$ {challenges.find(c => c.id === showCheckout)?.price.toFixed(2)}</span>
              </div>

              <div className="space-y-4 flex flex-col items-center pt-2">
                {loadingVelana ? (
                  <div className="w-28 h-28 flex flex-col items-center justify-center text-zinc-500 text-[10px] gap-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500" />
                    Gerando PIX oficial...
                  </div>
                ) : velanaPixCode ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(velanaPixCode)}`} 
                      alt="QR Code Pix"
                      className="w-32 h-32 bg-white p-2 rounded-lg"
                    />
                    
                    <div className="w-full space-y-1.5">
                      <label className="block text-[9px] text-zinc-550 font-bold uppercase text-center">Pix Copia e Cola</label>
                      <div className="flex gap-2 bg-zinc-900 border border-zinc-850 p-2 rounded items-center">
                        <input
                          type="text"
                          readOnly
                          value={velanaPixCode}
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                          className="bg-transparent text-[10px] text-zinc-300 flex-1 outline-none select-all truncate font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(velanaPixCode)
                            alert('Código PIX Copia e Cola copiado com sucesso!')
                          }}
                          className="px-2.5 py-0.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-[9px] rounded uppercase cursor-pointer transition-colors"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-white p-2 rounded flex items-center justify-center text-black font-extrabold select-none">
                    [ QR CODE PIX ]
                  </div>
                )}
                <p className="text-[10px] text-zinc-500 text-center">Pague o PIX para habilitar o Desafio instantaneamente no seu perfil.</p>
                <button
                  onClick={confirmPurchase}
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded text-xs transition-colors cursor-pointer"
                >
                  {loading ? 'Confirmando recebimento...' : 'Confirmar Pagamento'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
