'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check, CreditCard, QrCode, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import { db, DBUser } from '@/lib/db'

interface CheckoutProps {
  initialPlan?: 'Free' | 'Starter' | 'Premium' | 'VIP Anual'
  onClose: () => void
}

function formatCpf(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function Checkout({ initialPlan = 'Premium', onClose }: CheckoutProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedPlan, setSelectedPlan] = useState<'Free' | 'Starter' | 'Premium' | 'VIP Anual'>(initialPlan)
  
  // Account details
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix')
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const [loading, setLoading] = useState(false)
  
  // Velana integration states (Pix)
  const [velanaPixCode, setVelanaPixCode] = useState<string>('')
  const [loadingVelana, setLoadingVelana] = useState<boolean>(false)

  const getPlanPriceValue = () => {
    if (selectedPlan === 'VIP Anual') return 497.90
    if (selectedPlan === 'Premium') return 97.90
    if (selectedPlan === 'Starter') return 49.90
    return 0
  }

  const generateVelanaPix = async () => {
    const value = getPlanPriceValue()
    if (value <= 0) return
    setLoadingVelana(true)
    try {
      const res = await fetch('/api/payment/velana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          amount: value,
          description: `Plano ${selectedPlan} - MK Tips`
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

  useEffect(() => {
    if (step === 3 && paymentMethod === 'pix' && !velanaPixCode) {
      generateVelanaPix()
    }
  }, [step, paymentMethod])

  const plans = {
    'Free': { 
      price: 'Grátis', 
      desc: '7 dias grátis - limite de 3 tips/dia',
      features: ['3 tips diárias liberadas', '7 dias de acesso grátis', 'Histórico limitado']
    },
    'Starter': { 
      price: 'R$ 49,90', 
      desc: 'Acesso parcial',
      features: ['5 tips diárias liberadas', 'Histórico de 30 dias', '2 Desafios (Starter + PRO)']
    },
    'Premium': { 
      price: 'R$ 97,90', 
      desc: 'Todas as tips e notificações',
      features: ['Tips 100% ilimitadas', 'Histórico completo e total', 'Notificações em tempo real', 'Gestão de banca completa']
    },
    'VIP Anual': { 
      price: 'R$ 497,90', 
      desc: 'Acesso total + Badge VIP',
      features: ['Tudo do Premium', 'Acesso a TODOS os Desafios', 'Chatbot IA exclusivo', 'Suporte Dedicado VIP']
    }
  }

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) return
    
    if (selectedPlan === 'Free') {
      setLoading(true)
      ;(async () => {
        try {
          const newUser = await db.createFreeTrialUser({
            name,
            email,
            phone,
            cpf,
            password,
          })
          db.attributePendingReferral({ id: newUser.id, name: newUser.name, plan: 'Free' })
          db.setActiveUser(newUser.id)
          localStorage.setItem('oddvault_user_session', 'true')
          localStorage.setItem('oddvault_pwa_show_after_login', '1')
          db.addLog('System', `Conta de teste grátis criada para ${email}`)
          setStep(4)
        } catch (err: any) {
          alert(err?.message || 'Não foi possível criar a conta.')
        } finally {
          setLoading(false)
        }
      })()
    } else {
      setStep(3)
    }
  }

  const handlePayment = () => {
    setLoading(true)
    ;(async () => {
      try {
        const amount =
          selectedPlan === 'VIP Anual' ? 497.9 : selectedPlan === 'Premium' ? 97.9 : 49.9

        // Gera Pix real — plano só libera após confirmação do gateway
        const pixRes = await fetch('/api/payment/velana', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name,
            cpf,
            amount,
            plan: selectedPlan,
            productType: 'plan',
            description: `Plano ${selectedPlan} - MK Tips`,
          }),
        })
        const pixData = await pixRes.json()
        if (!pixRes.ok || !pixData.success || !pixData.transactionId) {
          throw new Error(pixData.error || 'Falha ao gerar Pix')
        }

        setVelanaPixCode(pixData.qrCode || '')
        const statusToken = encodeURIComponent(pixData.statusToken || '')

        const maxAttempts = 60
        for (let i = 0; i < maxAttempts; i++) {
          await new Promise((r) => setTimeout(r, 5000))
          const statusRes = await fetch(
            `/api/payment/velana?id=${pixData.transactionId}&token=${statusToken}`,
          )
          const statusData = await statusRes.json()
          if (!(statusData.success && statusData.paid)) continue

          const res = await fetch('/api/payments/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              name,
              phone,
              cpf,
              amount,
              plan: selectedPlan,
              productType: 'plan',
              transactionId: pixData.transactionId,
            }),
          })
          const data = await res.json()
          if (!res.ok || !data.ok || !data.user) {
            throw new Error(data.error || 'Falha ao registrar pagamento')
          }

          const synced = data.user
          const newUser: DBUser = {
            id: synced.id,
            name: synced.name || name,
            email: synced.email || email,
            phone: synced.phone || phone,
            cpf: synced.cpf || cpf,
            city: synced.city || 'São Paulo',
            country: synced.country || 'Brasil',
            language: synced.language || 'pt-BR',
            plan: synced.plan || selectedPlan,
            role: 'User',
            status: 'Ativo',
            createdAt: synced.created_at || new Date().toISOString(),
            lastLogin: synced.last_login || new Date().toISOString(),
            lastLoginIp: synced.last_login_ip || '127.0.0.1',
            device: synced.device || 'Web App',
            os: synced.os || '',
            browser: synced.browser || '',
            daysRemaining: Number(synced.days_remaining) || (selectedPlan === 'VIP Anual' ? 365 : 30),
            revenueGenerated: Number(synced.revenue_generated) || amount,
            totalPaid: Number(synced.total_paid) || amount,
            lastPaymentDate: synced.last_payment_date || new Date().toISOString(),
            bankroll: Number(synced.bankroll) || 0,
            bankrollCurrency: synced.bankroll_currency || 'R$',
            roiIndividual: Number(synced.roi_individual) || 0,
          }

          const users = db.getUsers()
          const filtered = users.filter((u) => u.email.toLowerCase() !== email.toLowerCase() && u.id !== newUser.id)
          db.setUsers([newUser, ...filtered])
          db.setActiveUser(newUser.id)
          localStorage.setItem('oddvault_user_session', 'true')
          localStorage.setItem('oddvault_pwa_show_after_login', '1')
          db.attributePendingReferral({ id: newUser.id, name: newUser.name, plan: String(newUser.plan) })
          db.addLog('Payment', `Pagamento Pix confirmado para plano ${selectedPlan} (${email})`)
          setStep(4)
          return
        }

        throw new Error('Pagamento não detectado a tempo. Se já pagou, aguarde e entre pelo login.')
      } catch (err: any) {
        alert(err?.message || 'Erro ao confirmar pagamento.')
      } finally {
        setLoading(false)
      }
    })()
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-lg border-zinc-800 bg-zinc-950/90 text-xs relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer text-base">✕</button>
        
        {/* Steps indicator */}
        {step < 4 && (
          <div className="flex justify-between px-6 pt-6 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            <span className={step >= 1 ? 'text-emerald-400' : ''}>1. Plano</span>
            <span className={step >= 2 ? 'text-emerald-400' : ''}>2. Cadastro</span>
            <span className={step >= 3 ? 'text-emerald-400' : ''}>3. Pagamento</span>
          </div>
        )}

        {step === 1 && (
          <div>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Selecione sua Assinatura
              </CardTitle>
              <CardDescription>Escolha o plano ideal e mude suas cotações.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.keys(plans) as Array<keyof typeof plans>).map(planName => (
                <div 
                  key={planName}
                  onClick={() => setSelectedPlan(planName)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                    selectedPlan === planName 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
                      : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <h4 className="font-bold text-white text-sm">{planName}</h4>
                        <p className="text-[10px] text-zinc-500">{plans[planName].desc}</p>
                      </div>
                      <span className="font-black text-sm text-emerald-400">{plans[planName].price}</span>
                    </div>
                    {selectedPlan === planName && (
                      <div className="mt-3 pt-3 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-zinc-350">
                        {plans[planName].features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setStep(2)}
                className="w-full py-3 mt-4 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                Continuar
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </CardContent>
          </div>
        )}

        {step === 2 && (
          <div>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Criar sua Conta</CardTitle>
              <CardDescription>Insira seus dados para liberação imediata do acesso.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateAccount}>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 font-semibold mb-2">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="E.g. Henrique Blume"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-850 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-semibold mb-2">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="E.g. blume@example.com"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-850 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-semibold mb-2">Celular / WhatsApp</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={phone}
                    onChange={e => setPhone(formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-850 rounded text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-semibold mb-2">CPF</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={cpf}
                    onChange={e => setCpf(formatCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-850 rounded text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 font-semibold mb-2">Senha de Acesso</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-850 rounded text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded-lg cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg cursor-pointer"
                  >
                    Prosseguir
                  </button>
                </div>
              </CardContent>
            </form>
          </div>
        )}

        {step === 3 && (
          <div>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex justify-between">
                <span>Pagamento Seguro</span>
                <span className="text-emerald-400">{plans[selectedPlan].price}</span>
              </CardTitle>
              <CardDescription>Escolha entre PIX com liberação instantânea ou cartão.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex-1 py-2 rounded border flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'pix' ? 'border-emerald-500/30 bg-emerald-500/10 text-white' : 'border-zinc-850 bg-zinc-900/30 text-zinc-400'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  PIX
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-2 rounded border flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'card' ? 'border-emerald-500/30 bg-emerald-500/10 text-white' : 'border-zinc-850 bg-zinc-900/30 text-zinc-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Cartão
                </button>
              </div>

              {paymentMethod === 'pix' ? (
                <div className="space-y-3 flex flex-col items-center p-6 bg-zinc-900/40 border border-zinc-850 rounded-lg">
                  {loadingVelana ? (
                    <div className="w-32 h-32 flex flex-col items-center justify-center text-zinc-500 text-[10px] gap-2">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500" />
                      Gerando PIX oficial...
                    </div>
                  ) : velanaPixCode ? (
                    <div className="flex flex-col items-center gap-3">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(velanaPixCode)}`} 
                        alt="QR Code Pix Velana"
                        className="w-32 h-32 bg-white p-2 rounded-lg"
                      />
                      <p className="text-[9px] text-zinc-400 text-center font-medium max-w-[200px] break-all truncate">{velanaPixCode}</p>
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(velanaPixCode)
                          alert('Código PIX Copia e Cola copiado com sucesso!')
                        }}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded font-bold text-[10px] cursor-pointer"
                      >
                        Copiar Código PIX
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-white p-2 rounded flex items-center justify-center text-black font-extrabold select-none">
                      [ QR CODE PIX ]
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-500 text-center mt-2">Escaneie o QR Code ou use o código PIX Copia e Cola para ativar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold mb-1">Nome no Cartão</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      placeholder="E.g. Henrique Blume"
                      className="w-full p-2 bg-zinc-900 border border-zinc-855 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-semibold mb-1">Número do Cartão</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="w-full p-2 bg-zinc-900 border border-zinc-855 rounded text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold mb-1">Validade</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full p-2 bg-zinc-900 border border-zinc-855 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-semibold mb-1">CVV</label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        placeholder="000"
                        className="w-full p-2 bg-zinc-900 border border-zinc-855 rounded text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {loading ? 'Processando transação...' : 'Confirmar Pagamento'}
              </button>
            </CardContent>
          </div>
        )}

        {step === 4 && (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {selectedPlan === 'Free' ? 'Conta Gratuita Criada com Sucesso!' : 'Assinatura Liberada!'}
            </h2>
            <p className="text-zinc-400 leading-relaxed max-w-sm mx-auto">
              {selectedPlan === 'Free' 
                ? 'Sua conta de teste de 7 dias foi criada e você já pode acessar as tips do dia.'
                : 'Sua conta foi criada e o pagamento processado com sucesso. Você já pode acessar as tips do dia.'}
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Ir para o Dashboard
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
