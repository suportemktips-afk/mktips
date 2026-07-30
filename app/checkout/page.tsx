'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { db } from '@/lib/db'
import { captureReferralCodeFromUrl, getPendingReferralCode } from '@/lib/referral'
import { 
  CreditCard, 
  QrCode, 
  Coins, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Percent, 
  Sparkles, 
  Plus, 
  AlertCircle, 
  ShieldCheck, 
  Wallet,
  ArrowLeft
} from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  
  // URL parameters state
  const [productType, setProductType] = useState<'plan' | 'challenge' | 'valetudo' | 'deposit' | null>(null)
  const [productName, setProductName] = useState('')
  const [basePrice, setBasePrice] = useState(0)
  const [targetId, setTargetId] = useState('')

  // User session
  const [activeUser, setActiveUser] = useState<any>(null)
  const [userWallet, setUserWallet] = useState<any>(null)

  // Checkout form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [cep, setCep] = useState('')
  
  // Payment config
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'wallet'>('pix')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  // Credit card details
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [installments, setInstallments] = useState('1')
  const [detectedBrand, setDetectedBrand] = useState('Visa')
  const [freePassword, setFreePassword] = useState('')
  const [freePasswordConfirm, setFreePasswordConfirm] = useState('')

  // Upsell
  const [includeUpsell, setIncludeUpsell] = useState(false)
  const upsellPrice = 19.90
  const upsellName = 'Desafio Alavancagem Starter'

  // Digital Wallet usage details
  const [useWalletBalance, setUseWalletBalance] = useState(false)

  // Transaction execution status
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [pixCode, setPixCode] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [showPixScreen, setShowPixScreen] = useState(false)

  useEffect(() => {
    if (!db.isReady()) return

    // Parse search parameters first — keep affiliate ?ref= visible + stored
    const params = new URLSearchParams(window.location.search)
    const captured = captureReferralCodeFromUrl(window.location.search)
    const pendingRef = captured || getPendingReferralCode()
    if (pendingRef && !params.get('ref')) {
      params.set('ref', pendingRef)
      const next = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, '', next)
    }
    const plan = params.get('plan')
    const challenge = params.get('challenge')
    const valetudo = params.get('valetudo')
    const deposit = params.get('deposit')

    const isFree =
      !!plan &&
      (plan.toLowerCase() === 'free' ||
        plan.toLowerCase().includes('gratis') ||
        plan.toLowerCase().includes('gratuito'))

    if (plan) {
      setProductType('plan')
      setTargetId(plan)
      if (isFree) {
        setProductName('Teste Grátis — 7 dias')
        setBasePrice(0)
        // Never prefill Free signup with Admin/Master or any session user
        setActiveUser(null)
        setFirstName('')
        setLastName('')
        setEmail('')
        setPhone('')
        setCpf('')
        setFreePassword('')
        setFreePasswordConfirm('')
        setCep('')
      } else if (plan.toLowerCase().includes('starter')) {
        setProductName('Plano Starter Mensal')
        setBasePrice(49.90)
      } else if (plan.toLowerCase().includes('premium')) {
        setProductName('Plano Premium Mensal')
        setBasePrice(97.90)
      } else if (plan.toLowerCase().includes('vip')) {
        setProductName('Plano VIP Anual')
        setBasePrice(497.90)
      } else {
        setProductName(`Plano ${plan}`)
        setBasePrice(97.90)
      }
    } else if (challenge) {
      setProductType('challenge')
      setTargetId(challenge)
      if (challenge.toLowerCase().includes('starter')) {
        setProductName('Alavancagem Starter')
        setBasePrice(29.90)
      } else if (challenge.toLowerCase().includes('pro')) {
        setProductName('Alavancagem Pro')
        setBasePrice(97.00)
      } else if (challenge.toLowerCase().includes('elite')) {
        setProductName('Alavancagem Elite')
        setBasePrice(197.00)
      } else {
        setProductName(`Desafio ${challenge}`)
        setBasePrice(97.00)
      }
    } else if (valetudo) {
      setProductType('valetudo')
      setProductName('Acesso Vale Tudo - MK Tips')
      setBasePrice(50.00)
    } else if (deposit) {
      setProductType('deposit')
      setProductName('Adicionar Saldo - MK Tips')
      setBasePrice(Number(deposit) || 50.00)
    } else {
      setProductType('plan')
      setProductName('Plano Premium Mensal')
      setBasePrice(97.90)
    }

    // Autofill only for paid checkout + logged regular User (never Master/Admin)
    if (!isFree) {
      const session = localStorage.getItem('oddvault_user_session') === 'true'
      if (session) {
        const u = db.getActiveUser()
        if (u?.id && u.role === 'User') {
          setActiveUser(u)
          const names = u.name.split(' ')
          setFirstName(names[0] || '')
          setLastName(names.slice(1).join(' ') || '')
          setEmail(u.email || '')
          setPhone(u.phone || '')
          setCpf(u.cpf || '')
          setUserWallet(db.getWallet(u.id))
        }
      }
    }
  }, [])

  // Auto-detect card brand
  useEffect(() => {
    const cleanNum = cardNumber.replace(/\s+/g, '')
    if (cleanNum.startsWith('4')) {
      setDetectedBrand('Visa')
    } else if (/^5[1-5]/.test(cleanNum)) {
      setDetectedBrand('Mastercard')
    } else if (/^3[47]/.test(cleanNum)) {
      setDetectedBrand('American Express')
    } else if (/^(6011|622|64|65)/.test(cleanNum)) {
      setDetectedBrand('Discover')
    } else {
      setDetectedBrand('Cartão')
    }
  }, [cardNumber])

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase()
    if (code === 'GREEN10') {
      const discountVal = basePrice * 0.1
      setDiscount(discountVal)
      setAppliedCoupon('GREEN10')
      setCouponMessage('Cupom GREEN10 aplicado! 10% de desconto.')
    } else if (code === 'MKFIRST') {
      const discountVal = Math.min(20, basePrice)
      setDiscount(discountVal)
      setAppliedCoupon('MKFIRST')
      setCouponMessage('Cupom MKFIRST aplicado! R$ 20,00 de desconto.')
    } else {
      setCouponMessage('Cupom inválido ou expirado.')
      setDiscount(0)
      setAppliedCoupon(null)
    }
  }

  // Calculate final numbers
  const subtotal = basePrice + (includeUpsell ? upsellPrice : 0)
  const finalPrice = Math.max(0, subtotal - discount)
  
  // Wallet payment logic details
  const walletAvailable = userWallet?.available || 0
  const canPayFullyWithWallet = walletAvailable >= finalPrice
  const remainingToPay = Math.max(0, finalPrice - walletAvailable)

  const handleCheckoutProcess = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingPayment(true)

    const userDevice = typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'
    const deviceIP = db.getClientIp()

    try {
      // FREE TRIAL / R$ 0 — nunca chamar gateway (Velana exige mín. R$ 1,00)
      const isFreePlan =
        productType === 'plan' &&
        (targetId.toLowerCase() === 'free' ||
          targetId.toLowerCase().includes('gratis') ||
          targetId.toLowerCase().includes('gratuito') ||
          productName.toLowerCase().includes('grátis') ||
          productName.toLowerCase().includes('gratis') ||
          productName.toLowerCase().includes('teste') ||
          basePrice === 0 ||
          finalPrice < 1)

      if (isFreePlan || (productType === 'plan' && finalPrice < 1)) {
        if (!firstName.trim() || !email.trim() || !freePassword) {
          alert('Preencha nome, e-mail e senha para criar o teste grátis.')
          setLoadingPayment(false)
          return
        }
        if (freePassword.length < 6) {
          alert('A senha precisa ter pelo menos 6 caracteres.')
          setLoadingPayment(false)
          return
        }
        if (freePassword !== freePasswordConfirm) {
          alert('As senhas não coincidem.')
          setLoadingPayment(false)
          return
        }

        await db.refresh()
        const exists = db.getUsers().some((u) => u.email.toLowerCase() === email.trim().toLowerCase())
        if (exists) {
          alert('Este e-mail já está cadastrado. Faça login.')
          setLoadingPayment(false)
          router.push('/login')
          return
        }

        let newUser
        try {
          newUser = await db.createFreeTrialUser({
            name: `${firstName} ${lastName}`.trim(),
            email: email.trim(),
            phone,
            cpf,
            password: freePassword,
          })
        } catch (err: any) {
          alert(err?.message || 'Não foi possível criar a conta. Tente novamente.')
          setLoadingPayment(false)
          return
        }

        // Local attribution backup (API already tries server-side)
        db.attributePendingReferral({
          id: newUser.id,
          name: newUser.name,
          plan: 'Free',
        })

        localStorage.setItem('oddvault_user_session', 'true')
        localStorage.setItem('oddvault_pwa_show_after_login', '1')
        db.setActiveUser(newUser.id)
        db.addLog('Auth', `Conta Free Trial criada: ${newUser.email}`, deviceIP, userDevice, newUser.name)

        setPaymentSuccess(true)
        setLoadingPayment(false)
        return
      }

      if (finalPrice < 1) {
        alert('Valor mínimo para pagamento é R$ 1,00.')
        setLoadingPayment(false)
        return
      }

      // 1. Carteira local NÃO pode liberar plano (saldo forgeável no browser)
      if (paymentMethod === 'wallet') {
        alert('Pagamento com carteira temporariamente indisponível por segurança. Use Pix.')
        setLoadingPayment(false)
        return
      }

      // 2. If Pix is chosen, communicate with Velana API
      if (paymentMethod === 'pix') {
        const amountToCharge = finalPrice
        if (amountToCharge < 1) {
          alert('Valor mínimo para Pix é R$ 1,00. No teste grátis use “Ativar Teste Grátis”.')
          setLoadingPayment(false)
          return
        }
        
        let apiDescription = productName || 'Assinatura MK Tips'
        if (productType === 'valetudo') {
          apiDescription = 'Participação de Bolão'
        } else if (productType === 'deposit') {
          apiDescription = 'Adicionar Saldo'
        } else if (productType === 'challenge') {
          apiDescription = `Desafio ${productName}`
        }

        const res = await fetch('/api/payment/velana', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: `${firstName} ${lastName}`,
            amount: amountToCharge,
            cpf,
            plan: productName,
            productType,
            description: apiDescription
          })
        })
        const data = await res.json()
        if (data.success) {
          setPixCode(data.qrCode)
          setTransactionId(data.transactionId)
          if (data.statusToken && data.transactionId) {
            sessionStorage.setItem(`mktips_pay_token_${data.transactionId}`, data.statusToken)
          }
          setShowPixScreen(true)
        } else {
          alert(data.error || 'Falha ao processar Pix com o gateway Velana. Tente novamente.')
        }
        setLoadingPayment(false)
        return
      }

      // 3. Credit Card — só libera se o gateway confirmar paid
      if (paymentMethod === 'card') {
        const res = await fetch('/api/payment/cakto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: `${firstName} ${lastName}`,
            amount: finalPrice,
            plan: productName,
            productType,
            description: `Cartão ${productName} - MK Tips`,
            paymentMethod: 'credit_card',
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          alert(data.error || 'Falha ao processar cartão.')
          setLoadingPayment(false)
          return
        }
        if (!data.paid || !data.transactionId) {
          alert('Pagamento pendente no gateway. Aguarde a confirmação ou use Pix.')
          setLoadingPayment(false)
          return
        }
        setTransactionId(data.transactionId)
        // Marca via consulta/confirm somente com tx id real
        const confirmRes = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: `${firstName} ${lastName}`,
            phone,
            cpf,
            amount: finalPrice,
            plan: productType === 'plan' ? productName : null,
            productType,
            transactionId: data.transactionId,
          }),
        })
        // Se ainda não marcado paid no store, o webhook/cakto precisa marcar — tenta status
        if (!confirmRes.ok) {
          alert('Pagamento capturado no gateway, mas aguardando confirmação segura. Se o plano não liberar em 1 min, contate o suporte com o ID da transação.')
          setLoadingPayment(false)
          return
        }
        await applyPurchaseBenefits()
        db.addLog('Payment', `Compra de ${productName} aprovada via Cartão. TX ${data.transactionId}`, deviceIP, userDevice, activeUser?.name || `${firstName} ${lastName}`.trim())
        setPaymentSuccess(true)
        setLoadingPayment(false)
      }

    } catch (err) {
      console.error(err)
      alert('Houve um erro no processamento. Tente novamente.')
      setLoadingPayment(false)
    }
  }

  const checkPixPaymentStatus = async () => {
    if (!transactionId) return false
    try {
      const token = sessionStorage.getItem(`mktips_pay_token_${transactionId}`) || ''
      const qs = token
        ? `/api/payment/velana?id=${transactionId}&token=${encodeURIComponent(token)}`
        : `/api/payment/velana?id=${transactionId}`
      const res = await fetch(qs)
      const data = await res.json()
      if (data.success && data.paid) {
        // If wallet partially used
        if (paymentMethod === 'wallet' && !canPayFullyWithWallet) {
          const updatedWallet = {
            ...userWallet,
            available: 0
          }
          db.setWallet(activeUser.id, updatedWallet)
        }
        
        await applyPurchaseBenefits()
        
        const userDevice = typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'
        db.addLog('Payment', `Depósito/Compra de R$ ${finalPrice.toFixed(2)} aprovada via Velana Pix. ID: ${transactionId}`, '177.45.198.24', userDevice, activeUser?.name || `${firstName} ${lastName}`.trim() || 'Cliente')
        
        setPaymentSuccess(true)
        setShowPixScreen(false)
        return true
      }
      return false
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const handleManualVerify = async () => {
    setLoadingPayment(true)
    const isPaid = await checkPixPaymentStatus()
    setLoadingPayment(false)
    if (!isPaid) {
      alert('Pagamento ainda não foi detectado. Caso já tenha pago, aguarde alguns segundos e tente novamente.')
    }
  }

  useEffect(() => {
    if (!showPixScreen || !transactionId) return

    const interval = setInterval(async () => {
      await checkPixPaymentStatus()
    }, 5000)

    return () => clearInterval(interval)
  }, [showPixScreen, transactionId, paymentMethod, canPayFullyWithWallet, userWallet, activeUser, finalPrice])

  const applyPurchaseBenefits = async () => {
    const payerEmail = (email || activeUser?.email || '').trim().toLowerCase()
    const payerName = `${firstName} ${lastName}`.trim() || activeUser?.name || ''
    if (!payerEmail) return

    let resolvedPlan =
      productType === 'plan'
        ? targetId.toLowerCase().includes('starter')
          ? 'Starter'
          : targetId.toLowerCase().includes('vip')
            ? 'VIP Anual'
            : targetId.toLowerCase().includes('free')
              ? 'Free'
              : 'Premium'
        : null

    // Persist revenue + plan on Supabase (admin panel reads this)
    try {
      const res = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payerEmail,
          name: payerName,
          phone,
          cpf,
          amount: finalPrice,
          plan: resolvedPlan,
          productType,
          transactionId: transactionId || null,
        }),
      })
      const data = await res.json()
      if (res.ok && data.ok && data.user) {
        const synced = {
          id: data.user.id,
          name: data.user.name || payerName,
          email: data.user.email || payerEmail,
          phone: data.user.phone || phone,
          cpf: data.user.cpf || cpf,
          city: data.user.city || '',
          country: data.user.country || 'Brasil',
          language: data.user.language || 'pt-BR',
          plan: data.user.plan || resolvedPlan || 'Premium',
          role: data.user.role || 'User',
          status: data.user.status || 'Ativo',
          createdAt: data.user.created_at || new Date().toISOString(),
          lastLogin: data.user.last_login || new Date().toISOString(),
          lastLoginIp: data.user.last_login_ip || '',
          device: data.user.device || 'Web App',
          os: data.user.os || '',
          browser: data.user.browser || '',
          daysRemaining: Number(data.user.days_remaining) || 30,
          revenueGenerated: Number(data.user.revenue_generated) || finalPrice,
          totalPaid: Number(data.user.total_paid) || finalPrice,
          lastPaymentDate: data.user.last_payment_date || new Date().toISOString(),
          bankroll: Number(data.user.bankroll) || 0,
          bankrollCurrency: data.user.bankroll_currency || 'R$',
          roiIndividual: Number(data.user.roi_individual) || 0,
        }
        const others = db.getUsers().filter((u) => u.id !== synced.id && u.email.toLowerCase() !== synced.email.toLowerCase())
        db.setUsers([...others, synced as any])
        db.setActiveUser(synced.id)
        localStorage.setItem('oddvault_user_session', 'true')
        setActiveUser(synced)

        if (productType === 'plan') {
          db.attributePendingReferral({
            id: synced.id,
            name: synced.name,
            plan: String(synced.plan),
          })
        }
      } else {
        console.error('payment confirm failed:', data)
      }
    } catch (err) {
      console.error('payment confirm error:', err)
    }

    // Local extras (upsell / challenge / deposit wallet)
    if (includeUpsell) {
      const curChallenges = db.getPurchasedChallenges()
      if (!curChallenges.includes('starter')) {
        db.setPurchasedChallenges([...curChallenges, 'starter'])
      }
    }

    if (productType === 'challenge') {
      const curChallenges = db.getPurchasedChallenges()
      if (!curChallenges.includes(targetId)) {
        db.setPurchasedChallenges([...curChallenges, targetId])
      }
    } else if (productType === 'deposit' && activeUser?.id) {
      const curWallet = db.getWallet(activeUser.id)
      const updatedWallet = {
        ...curWallet,
        available: curWallet.available + basePrice,
        totalDeposit: curWallet.totalDeposit + basePrice,
      }
      db.setWallet(activeUser.id, updatedWallet)
      const txs = db.getWalletTransactions(activeUser.id)
      const newTx = {
        id: `tx-${Date.now()}`,
        type: 'Depósito',
        amount: basePrice,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString().slice(0, 5),
        status: 'Aprovado',
        txId: transactionId || `TX-VEL-${Date.now().toString().slice(-6)}`,
      }
      db.setWalletTransactions(activeUser.id, [newTx, ...txs])
    }
  }

  const isFreeCheckout =
    productType === 'plan' &&
    (targetId.toLowerCase() === 'free' ||
      targetId.toLowerCase().includes('gratis') ||
      targetId.toLowerCase().includes('gratuito') ||
      productName.toLowerCase().includes('grátis') ||
      productName.toLowerCase().includes('gratis') ||
      productName.toLowerCase().includes('teste') ||
      basePrice === 0 ||
      finalPrice < 1)

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 text-center p-6 space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">
              {isFreeCheckout || finalPrice === 0 ? 'Teste Grátis Ativado!' : 'Pagamento Confirmado!'}
            </h1>
            <p className="text-xs text-zinc-400">
              {isFreeCheckout || finalPrice === 0
                ? 'Você tem 7 dias de acesso. Após o prazo a conta bloqueia automaticamente até o upgrade.'
                : 'Seu acesso e benefícios foram liberados de forma instantânea na sua conta.'}
            </p>
          </div>
          <div className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-850 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-550">Produto:</span>
              <strong className="text-white">{productName}</strong>
            </div>
            {includeUpsell && (
              <div className="flex justify-between">
                <span className="text-zinc-550">Adicional:</span>
                <strong className="text-white">{upsellName}</strong>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-550">Valor:</span>
              <strong className="text-emerald-400">
                {finalPrice === 0 ? 'R$ 0,00 (7 dias grátis)' : `R$ ${finalPrice.toFixed(2)}`}
              </strong>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Ir para o Painel
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl flex items-center justify-between mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo-mktips.png" alt="MK Tips" className="w-8 h-8 rounded-lg" />
          <span className="font-extrabold text-white text-sm tracking-widest">MK TIPS</span>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pix display screen */}
          {showPixScreen ? (
            <Card className="bg-zinc-950 border-zinc-800 text-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-500" />
                  Aguardando Pagamento Pix
                </CardTitle>
                <CardDescription>Escaneie o QR Code oficial abaixo para liberar imediatamente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex flex-col items-center p-6">
                <div className="p-3 bg-zinc-900/50 rounded border border-zinc-850 flex justify-between items-center w-full text-left">
                  <div>
                    <span className="font-bold text-white block">Checkout MK Tips</span>
                    <span className="text-[9px] text-zinc-500">Gateway Velana</span>
                  </div>
                  <strong className="text-emerald-400 text-sm">R$ {paymentMethod === 'wallet' ? remainingToPay.toFixed(2) : finalPrice.toFixed(2)}</strong>
                </div>

                {loadingPayment ? (
                  <div className="w-36 h-36 flex flex-col items-center justify-center text-zinc-500 gap-2">
                    <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
                    Gerando QR Code...
                  </div>
                ) : pixCode ? (
                  <div className="flex flex-col items-center gap-4 w-full">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixCode)}`}
                      alt="Pix QR Code"
                      className="w-36 h-36 bg-white p-2 rounded-xl"
                    />
                    
                    <div className="w-full max-w-sm space-y-2">
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase text-center">Pix Copia e Cola</label>
                      <div className="flex gap-2 bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg items-center">
                        <input
                          type="text"
                          readOnly
                          value={pixCode}
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                          className="bg-transparent text-[11px] text-zinc-300 flex-1 outline-none select-all truncate font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(pixCode)
                            alert('Código copia e cola copiado com sucesso!')
                          }}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-[9px] rounded uppercase cursor-pointer transition-colors"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="w-full flex gap-3 pt-4 border-t border-zinc-900">
                  <button
                    onClick={() => setShowPixScreen(false)}
                    className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleManualVerify}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg cursor-pointer"
                  >
                    Verificar Pagamento
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <form
              onSubmit={handleCheckoutProcess}
              className="space-y-6"
              autoComplete={isFreeCheckout ? 'off' : 'on'}
            >
              
              {/* Client Info Card */}
              <Card className="bg-zinc-950 border-zinc-850 text-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-white">1. Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1.5">Nome</label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      autoComplete={isFreeCheckout ? 'off' : 'given-name'}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1.5">Sobrenome</label>
                    <input
                      type="text"
                      required
                      placeholder="Seu sobrenome"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      autoComplete={isFreeCheckout ? 'off' : 'family-name'}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1.5">E-mail</label>
                    <input
                      type="email"
                      required
                      placeholder="seu-email@exemplo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete={isFreeCheckout ? 'off' : 'email'}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1.5">CPF</label>
                    <input
                      type="text"
                      required={!isFreeCheckout}
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={e => setCpf(e.target.value)}
                      autoComplete="off"
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1.5">Celular</label>
                    <input
                      type="text"
                      required={!isFreeCheckout}
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      autoComplete={isFreeCheckout ? 'off' : 'tel'}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                  {isFreeCheckout ? (
                    <>
                      <div>
                        <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1.5">Senha</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          placeholder="Mínimo 6 caracteres"
                          value={freePassword}
                          onChange={e => setFreePassword(e.target.value)}
                          className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1.5">Confirmar Senha</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          placeholder="Repita a senha"
                          value={freePasswordConfirm}
                          onChange={e => setFreePasswordConfirm(e.target.value)}
                          className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </>
                  ) : (
                  <div>
                    <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1.5">CEP</label>
                    <input
                      type="text"
                      required
                      placeholder="00000-000"
                      value={cep}
                      onChange={e => setCep(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Methods Selection — hidden for Free trial */}
              {!isFreeCheckout && (
              <Card className="bg-zinc-950 border-zinc-855 text-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-white">2. Método de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3 rounded-lg border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === 'pix' 
                          ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400 font-bold'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 text-zinc-400'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                      <span>PIX</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-lg border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400 font-bold'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 text-zinc-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Cartão</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`p-3 rounded-lg border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === 'wallet'
                          ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400 font-bold'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 text-zinc-400'
                      }`}
                    >
                      <Wallet className="w-5 h-5" />
                      <span>Carteira</span>
                    </button>
                  </div>

                  {/* Wallet context info */}
                  {paymentMethod === 'wallet' && (
                    <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-850 space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500 font-bold uppercase">Saldo Disponível:</span>
                        <strong className="text-white text-xs">R$ {walletAvailable.toFixed(2)}</strong>
                      </div>
                      {canPayFullyWithWallet ? (
                        <p className="text-[10px] text-emerald-400 font-medium">Saldo suficiente! O valor será debitado integralmente da sua carteira.</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[10px] text-amber-400">Saldo insuficiente para quitar o total. Pague o restante de <strong>R$ {remainingToPay.toFixed(2)}</strong> via PIX!</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Credit Card inputs */}
                  {paymentMethod === 'card' && (
                    <div className="p-4 bg-zinc-900/20 rounded-lg border border-zinc-850 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-550 uppercase">Dados do Cartão</span>
                        <span className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-black tracking-wider uppercase">{detectedBrand}</span>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1">Nome no Cartão</label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          placeholder="E.g. Henrique Blume"
                          value={cardName}
                          onChange={e => setCardName(e.target.value)}
                          className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1">Número do Cartão</label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded text-white"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1">Validade</label>
                          <input
                            type="text"
                            required={paymentMethod === 'card'}
                            placeholder="MM/AA"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                            className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1">CVV</label>
                          <input
                            type="text"
                            required={paymentMethod === 'card'}
                            placeholder="123"
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value)}
                            className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1">Parcelamento</label>
                        <select
                          value={installments}
                          onChange={e => setInstallments(e.target.value)}
                          className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded text-white cursor-pointer"
                        >
                          <option value="1">1x de R$ {finalPrice.toFixed(2)} (Sem Juros)</option>
                          <option value="2">2x de R$ {(finalPrice / 2).toFixed(2)} (Sem Juros)</option>
                          <option value="3">3x de R$ {(finalPrice / 3).toFixed(2)} (Sem Juros)</option>
                          <option value="6">6x de R$ {(finalPrice / 6).toFixed(2)} (Sem Juros)</option>
                          <option value="12">12x de R$ {(finalPrice / 12).toFixed(2)} (Sem Juros)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              )}

              {/* Upsell Offer Card */}
              {!isFreeCheckout && productType !== 'challenge' && (
                <Card className="border-emerald-500/20 bg-gradient-to-r from-zinc-950 to-emerald-950/20 p-4 flex items-center justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-500/20 shrink-0">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">OFERTA ESPECIAL</span>
                      <strong className="text-white text-xs block">Desafio Alavancagem Starter por R$ 19,90!</strong>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Habilite o desafio de alavancagem com desconto único.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIncludeUpsell(!includeUpsell)}
                    className={`px-4 py-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer border ${
                      includeUpsell 
                        ? 'bg-emerald-500 text-black border-emerald-500'
                        : 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700'
                    }`}
                  >
                    {includeUpsell ? 'Adicionado!' : 'Adicionar'}
                  </button>
                </Card>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loadingPayment}
                className="w-full min-h-[48px] py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-850 text-black font-extrabold rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loadingPayment ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                    Processando...
                  </>
                ) : (
                  <>
                    {isFreeCheckout ? 'Ativar Teste Grátis (7 dias)' : 'Finalizar Pagamento Seguro'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Right Side: Order Summary */}
        <div className="space-y-6">
          <Card className="bg-zinc-950 border-zinc-850 text-xs">
            <CardHeader className="border-b border-zinc-900 pb-4">
              <CardTitle className="text-sm font-bold text-white">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              <div className="flex justify-between items-center">
                <div>
                  <strong className="text-white block">{productName}</strong>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Item principal</span>
                </div>
                <strong className="text-white">R$ {basePrice.toFixed(2)}</strong>
              </div>

              {includeUpsell && (
                <div className="flex justify-between items-center">
                  <div>
                    <strong className="text-white block">{upsellName}</strong>
                    <span className="text-[10px] text-zinc-550 block mt-0.5">Oferta Upsell</span>
                  </div>
                  <strong className="text-white">R$ {upsellPrice.toFixed(2)}</strong>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span>Desconto ({appliedCoupon})</span>
                  <strong>- R$ {discount.toFixed(2)}</strong>
                </div>
              )}

              <div className="border-t border-zinc-900 pt-4 space-y-2">
                <div className="flex justify-between items-center text-white font-bold text-sm">
                  <span>Total</span>
                  <span className="text-emerald-400">R$ {finalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon box */}
              <div className="border-t border-zinc-900 pt-4 space-y-2">
                <label className="block text-[10px] text-zinc-550 font-bold uppercase mb-1">Cupom de Desconto</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.g. GREEN10"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="flex-1 p-2 bg-zinc-900 border border-zinc-800 rounded text-white text-xs uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-[10px] cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-[9px] mt-1 ${couponMessage.includes('aplicado') ? 'text-emerald-400' : 'text-red-400'}`}>{couponMessage}</p>
                )}
              </div>

            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-900 p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-zinc-550 text-[10px] font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              Ambiente 100% Seguro
            </div>
            <p className="text-[10px] text-zinc-500">MK Tips utiliza tecnologias de ponta com tokenização de chaves e criptografia ponta a ponta para proteger todas as transações.</p>
          </Card>
        </div>

      </div>
    </div>
  )
}
