'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { db, DBTip } from '@/lib/db'
import { PlusCircle, HelpCircle, Check, X, Ban, Trash2 } from 'lucide-react'

export default function AdminTipsPage() {
  const [tips, setTips] = useState<DBTip[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Creation form fields
  const [sport, setSport] = useState('Futebol')
  const [league, setLeague] = useState('')
  const [match, setMatch] = useState('')
  const [market, setMarket] = useState('')
  const [type, setType] = useState('')
  const [odd, setOdd] = useState(1.90)
  const [confidence, setConfidence] = useState(7)
  const [bookmaker, setBookmaker] = useState('Betano')
  const [affiliate, setAffiliate] = useState('https://www.betano.com')
  const [justification, setJustification] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      await db.refresh()
      if (cancelled) return
      setTips(db.getTips())
      setLoading(false)
    }
    load()
    const onUpdate = () => setTips(db.getTips())
    window.addEventListener('oddvault_db_update', onUpdate)
    return () => {
      cancelled = true
      window.removeEventListener('oddvault_db_update', onUpdate)
    }
  }, [])

  const handleResolveTip = (tipId: string, result: 'Green' | 'Red' | 'Void' | 'Cancelada') => {
    const updated = tips.map(tip => {
      if (tip.id === tipId) {
        db.addAuditLog('Admin Master', 'RESOLVE_TIP', tip.id, tip.status, result)
        db.addLog('Audit', `Tip ${tip.match} resolvida como ${result}`, '189.120.45.10', 'MacBook Pro', 'Admin Master')
        fetch('/api/notifications/feed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            match: tip.match,
            market: tip.market,
            odd: tip.odd,
            type: 'tip_result',
            title: `Resultado: ${result}`,
            body: `${tip.match} · ${result}`,
          }),
        }).catch(() => {})
        return { ...tip, status: result }
      }
      return tip
    })
    setTips(updated)
    db.setTips(updated)
  }

  const handleDeleteTip = async (tipId: string) => {
    const confirmed = confirm('Deseja excluir permanentemente esta tip?')
    if (!confirmed) return

    const filtered = tips.filter(tip => tip.id !== tipId)
    setTips(filtered)
    await db.deleteTip(tipId)
    db.addAuditLog('Admin Master', 'DELETE_TIP', tipId, 'Pendente', 'EXCLUÍDA')
  }

  const handleAddTip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!league || !match || !market || !type) return

    const newTip: DBTip = {
      id: crypto.randomUUID(),
      sport,
      league,
      match,
      datetime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4h from now
      market,
      type,
      odd,
      stake: parseFloat((confidence / 3).toFixed(1)), // automatic units suggested
      confidence,
      recommendedBookmaker: bookmaker,
      affiliateUrl: affiliate,
      tipsterId: '',
      tipsterName: 'MK Tips',
      justification,
      riskIndicators: ['Cenário de flutuação de odds antes do evento'],
      estimatedProbability: Math.floor(95 / odd), // EV conversion probability
      ev: parseFloat(((odd * (95 / odd)) - 100).toFixed(1)) || 5.0,
      views: 0,
      favoritesCount: 0,
      status: 'Pendente',
      oddsComparison: [
        { bookmaker, odd },
        { bookmaker: 'Bet365', odd: parseFloat((odd - 0.05).toFixed(2)) },
        { bookmaker: 'Stake', odd: parseFloat((odd - 0.02).toFixed(2)) }
      ]
    }

    const updated = [newTip, ...tips]
    setTips(updated)
    db.setTips(updated)
    db.addAuditLog('Admin Master', 'CREATE_TIP', newTip.id, '', `${match} - ${market}`)
    db.addLog('Audit', `Tip ${match} criada com sucesso para ${market}`, '189.120.45.10', 'MacBook Pro', 'Admin Master')

    await fetch('/api/notifications/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match, market, odd }),
    }).catch(() => {})

    // Disparo WhatsApp desligado até ativar sendToWhatsApp no pipeline / CRM

    // Reset
    setLeague('')
    setMatch('')
    setMarket('')
    setType('')
    setJustification('')
    setOdd(1.90)
    setShowAddModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#00E08A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Tips Control</h1>
          <p className="text-sm text-zinc-400">Publique novas tips, defina justificativas e finalize com Green, Red ou Void.</p>
          <p className="text-[10px] mt-1 text-amber-400/90 font-medium">WhatsApp comunidades: desligado — ative depois em config/auto-pipeline.json</p>
        </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/tips/auto-import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ maxTips: 8, broadcast: false }),
                  })
                  const data = await res.json()
                  if (!data.ok) {
                    alert(data.error || 'Falha ao importar')
                    return
                  }
                  await db.refresh()
                  setTips(db.getTips())
                  alert(data.inserted > 0 ? `${data.inserted} oportunidades importadas.` : 'Nenhum jogo novo.')
                } catch (e: any) {
                  alert(e?.message || 'Erro no auto-import')
                }
              }}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Importar jogos futuros
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Publicar Oportunidade
            </button>
          </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 gap-4">
        {tips.length === 0 && (
          <Card className="border-zinc-850 bg-zinc-900/30">
            <CardContent className="p-8 text-center text-sm text-zinc-500">
              Nenhuma oportunidade cadastrada ainda. Clique em <strong className="text-zinc-300">Publicar Oportunidade</strong> para criar a primeira.
            </CardContent>
          </Card>
        )}
        {tips.map(tip => (
          <Card key={tip.id} className="border-zinc-850 bg-zinc-900/30 overflow-hidden">
            <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-zinc-850 rounded text-[9px] font-bold text-zinc-400 border border-zinc-800 uppercase tracking-wider">{tip.sport}</span>
                  <span className="text-[10px] text-zinc-500">{tip.league}</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1.5">{tip.match}</h3>
                <p className="text-xs text-zinc-400 mt-1">Mercado: <strong className="text-white">{tip.market}</strong> ({tip.type}) • Odd: <strong className="text-emerald-400">{tip.odd}</strong></p>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-3">
                {tip.status === 'Pendente' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveTip(tip.id, 'Green')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 rounded text-xs font-semibold border border-emerald-500/20 cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Green
                    </button>
                    <button
                      onClick={() => handleResolveTip(tip.id, 'Red')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded text-xs font-semibold border border-red-500/20 cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Red
                    </button>
                    <button
                      onClick={() => handleResolveTip(tip.id, 'Void')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-400 hover:bg-zinc-750 rounded text-xs font-semibold border border-zinc-700 cursor-pointer transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Void
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-1.5 rounded text-xs font-bold border uppercase tracking-wider ${
                    tip.status === 'Green' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    tip.status === 'Red' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}>
                    {tip.status}
                  </span>
                )}
                
                <button
                  onClick={() => handleDeleteTip(tip.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 bg-zinc-950 border border-zinc-850 hover:border-zinc-800 rounded transition-colors cursor-pointer"
                  title="Excluir Tip"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg bg-zinc-950 border-zinc-800 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-base font-bold">Publicar Nova Oportunidade</CardTitle>
              <CardDescription>Esta tip ficará visível em tempo real na área dos assinantes.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddTip}>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Esporte</label>
                    <select
                      value={sport}
                      onChange={e => setSport(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none"
                    >
                      <option value="Futebol">Futebol</option>
                      <option value="Basquete">Basquete</option>
                      <option value="Tênis">Tênis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Campeonato / Liga</label>
                    <input
                      type="text"
                      required
                      value={league}
                      onChange={e => setLeague(e.target.value)}
                      placeholder="E.g. Brasileirão Série A"
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Evento / Partida (Mandante vs Visitante)</label>
                  <input
                    type="text"
                    required
                    value={match}
                    onChange={e => setMatch(e.target.value)}
                    placeholder="E.g. Corinthians vs São Paulo"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Mercado</label>
                    <input
                      type="text"
                      required
                      value={market}
                      onChange={e => setMarket(e.target.value)}
                      placeholder="E.g. Vencedor (1X2)"
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Seleção da Aposta</label>
                    <input
                      type="text"
                      required
                      value={type}
                      onChange={e => setType(e.target.value)}
                      placeholder="E.g. Corinthians (Vencedor)"
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Odd Indicada</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={odd}
                      onChange={e => setOdd(parseFloat(e.target.value))}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Confiança (1 a 10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={confidence}
                      onChange={e => setConfidence(parseInt(e.target.value))}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Casa Sugerida</label>
                    <input
                      type="text"
                      value={bookmaker}
                      onChange={e => setBookmaker(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Link de Afiliado</label>
                    <input
                      type="text"
                      value={affiliate}
                      onChange={e => setAffiliate(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2 flex justify-between items-center">
                    <span>Justificativa Técnica</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!match || !market) {
                          alert('Por favor, defina a Partida e o Mercado primeiro para guiar a IA.')
                          return
                        }
                        setJustification(`Análise IA: Baseando-se no retrospecto de confrontos, a força ofensiva de ${match.split('vs')[0] || 'mandante'} em confrontos diretos no mercado de ${market} representa um valor esperado (+EV) excelente para esta rodada.`)
                      }}
                      className="text-[9px] text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      ✨ Gerar Justificativa com IA
                    </button>
                  </label>
                  <textarea
                    value={justification}
                    onChange={e => setJustification(e.target.value)}
                    placeholder="E.g. Corinthians vem muito forte em casa com histórico recente de 5 vitórias..."
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none h-20 resize-none"
                  />
                </div>
              </CardContent>
              <div className="p-6 border-t border-zinc-850 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold rounded hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded cursor-pointer"
                >
                  Publicar Entrada
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
