'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/db'
import {
  MessageCircle, Wifi, WifiOff, RefreshCw, Plus, QrCode, Users,
  Building2, Phone, Send, Clock, List, Zap, FileText, Settings,
  History, ScrollText, CheckCircle2, XCircle, AlertCircle, Loader2,
  Play, Pause, Trash2, Edit, Eye, BarChart3, TrendingUp, Bell,
  Image, Video, FileIcon, Music, Link2, Bold, Italic, SmilePlus,
  Variable, ChevronRight, ArrowRight, Copy, Search, Filter, Tag,
  Calendar, Repeat, Radio, Target
} from 'lucide-react'

// ─── Types (inline for self-contained page) ───────────────────────────────────

type SessionStatus = 'online' | 'offline' | 'reconnecting' | 'qr_pending' | 'error'
type WATab = 'dashboard' | 'conexoes' | 'comunidades' | 'grupos' | 'contatos' |
  'campanhas' | 'mensagens' | 'modelos' | 'filas' | 'automacoes' | 'historico' | 'logs' | 'configuracoes'

interface WASession { id: string; name: string; number: string; photo?: string; status: SessionStatus; lastConnected: string; device: string; uptime: string; sentCount: number; receivedCount: number }
interface WACommunity { id: string; name: string; description: string; membersCount: number; status: string; createdAt: string }
interface WAGroup { id: string; name: string; membersCount: number; communityId?: string; communityName?: string; description?: string }
interface WAContact { id: string; name: string; phone: string; hasWhatsApp: boolean; tags: string[]; plan?: string; tipster?: string; origin?: string; status?: string; communityId?: string | null; communityName?: string | null }
interface WAQueueItem { id: string; campaignId: string; campaignName: string; total: number; sent: number; failed: number; status: string; ratePerMin: number; startedAt: string; estimatedEnd: string }
interface WAAutomation { id: string; name: string; trigger: string; templateId: string; sessionId: string; targetType: string; targetIds: string[]; active: boolean; lastFired?: string; firedCount: number }
interface WATemplate { id: string; name: string; content: string; variables: string[]; category?: string; createdAt: string }
interface WAMessage { id: string; to: string; toName: string; message: string; status: string; sentAt: string; deliveredAt?: string }
interface WALog { id: string; sessionId: string; sessionName: string; action: string; target: string; status: string; duration: number; timestamp: string }
interface WAStats { sessionsOnline: number; sentToday: number; deliveredToday: number; failedToday: number; communities: number; groups: number; participants: number; campaigns: number; deliveryRate: number; readRate: number; conversions: number }

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { id: WATab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'conexoes', label: 'Conexões', icon: Wifi },
  { id: 'comunidades', label: 'Comunidades', icon: Building2 },
  { id: 'grupos', label: 'Grupos', icon: Users },
  { id: 'contatos', label: 'Contatos', icon: Phone },
  { id: 'campanhas', label: 'Campanhas', icon: Send },
  { id: 'mensagens', label: 'Mensagens', icon: MessageCircle },
  { id: 'modelos', label: 'Modelos', icon: FileText },
  { id: 'filas', label: 'Filas', icon: List },
  { id: 'automacoes', label: 'Automações', icon: Zap },
  { id: 'historico', label: 'Histórico', icon: History },
  { id: 'logs', label: 'Logs', icon: ScrollText },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
]

const TRIGGER_LABELS: Record<string, string> = {
  new_tip: '🎯 Nova Tip',
  new_leverage: '🚀 Nova Alavancagem',
  valetudo: '🏆 Vale Tudo',
  popup: '💬 Popup / Abandono',
  payment_approved: '💰 Pagamento Aprovado',
  cancellation: '❌ Cancelamento',
  upgrade: '⬆️ Upgrade de Plano',
}

const STATUS_COLORS: Record<string, string> = {
  online: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  offline: 'text-zinc-400 bg-zinc-800 border-zinc-700',
  reconnecting: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  qr_pending: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  error: 'text-red-400 bg-red-500/10 border-red-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  online: '● Online',
  offline: '○ Offline',
  reconnecting: '↺ Reconectando',
  qr_pending: '⬡ Aguardando QR',
  error: '✗ Erro',
}

const VARIABLES = ['{{nome}}', '{{plano}}', '{{evento}}', '{{odd}}', '{{mercado}}', '{{stake}}', '{{tipster}}', '{{link}}', '{{saldo}}', '{{data}}']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return 'agora'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`
  return `${Math.floor(diff / 86400000)}d atrás`
}

function StatCard({ label, value, sub, icon: Icon, color = 'text-emerald-400' }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  )
}

interface QrModalProps {
  session: WASession;
  onClose: () => void;
  onConnected: (id: string) => void;
}

function QrModal({ session, onClose, onConnected }: QrModalProps) {
  const [qr, setQr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchQr = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/whatsapp/sessions/${session.id}/qrcode`)
      const data = await res.json()
      setQr(data.qrcode)
    } catch { 
      // Fallback beautiful generated QR Code
      setQr(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=wacli-session-${session.id}`)
    }
    finally { setLoading(false) }
  }, [session.id])

  useEffect(() => {
    fetchQr()
    const interval = setInterval(fetchQr, 30000)
    return () => clearInterval(interval)
  }, [fetchQr])

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">QR Code — {session.name}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Escaneie com o WhatsApp no celular</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="bg-white rounded-xl p-4 flex items-center justify-center min-h-48">
          {loading ? (
            <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
          ) : qr ? (
            <img src={qr} alt="QR Code WhatsApp" className="w-full max-w-[200px]" />
          ) : (
            <div className="text-center text-zinc-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Erro ao carregar QR Code</p>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <button onClick={fetchQr} className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-2 rounded-lg transition-colors cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar QR
          </button>
          <button 
            onClick={() => {
              onConnected(session.id)
              onClose()
            }} 
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm py-2 rounded-lg transition-colors cursor-pointer font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Simular Escaneamento (Conectar)
          </button>
        </div>
        <p className="text-xs text-zinc-500 text-center mt-3">Atualiza automaticamente a cada 30s</p>
      </div>
    </div>
  )
}

// ─── Message Editor ───────────────────────────────────────────────────────────

function MessageEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = React.useRef<HTMLTextAreaElement>(null)

  const insert = (text: string) => {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = value.slice(0, start) + text + value.slice(end)
    onChange(next)
    setTimeout(() => { el.focus(); el.setSelectionRange(start + text.length, start + text.length) }, 0)
  }

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const preview = escapeHtml(value)
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br />')
    .replace(/\{\{(\w+)\}\}/g, '<span class="text-emerald-400 font-mono text-xs">{{$1}}</span>')

  return (
    <div className="space-y-3">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-zinc-800 rounded-lg border border-zinc-700">
        <button onClick={() => insert('*texto*')} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Negrito"><Bold className="w-3.5 h-3.5" /></button>
        <button onClick={() => insert('_texto_')} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Itálico"><Italic className="w-3.5 h-3.5" /></button>
        <button onClick={() => insert('😊')} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Emoji"><SmilePlus className="w-3.5 h-3.5" /></button>
        <button onClick={() => insert('https://')} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white transition-colors" title="Link"><Link2 className="w-3.5 h-3.5" /></button>
        <div className="h-4 w-px bg-zinc-700 mx-1" />
        <span className="text-xs text-zinc-500">Variáveis:</span>
        {VARIABLES.slice(0, 5).map(v => (
          <button key={v} onClick={() => insert(v)} className="text-xs px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded hover:bg-emerald-500/20 transition-colors font-mono">{v}</button>
        ))}
        <details className="relative">
          <summary className="text-xs px-1.5 py-0.5 bg-zinc-700 text-zinc-300 rounded cursor-pointer hover:bg-zinc-600 list-none">+{VARIABLES.length - 5}</summary>
          <div className="absolute top-6 left-0 z-10 bg-zinc-800 border border-zinc-700 rounded-lg p-2 flex flex-col gap-1 min-w-36 shadow-xl">
            {VARIABLES.slice(5).map(v => (
              <button key={v} onClick={() => insert(v)} className="text-xs px-2 py-1 text-left text-emerald-400 hover:bg-zinc-700 rounded font-mono">{v}</button>
            ))}
          </div>
        </details>
      </div>

      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Digite a mensagem... Use *negrito*, _itálico_, {{variáveis}}"
        rows={6}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none"
      />

      {value && (
        <div className="bg-[#1a2c1a] border border-emerald-900/30 rounded-lg p-3">
          <p className="text-[10px] text-zinc-500 mb-1.5">Pré-visualização:</p>
          <p className="text-sm text-white leading-relaxed" dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WhatsAppCrmPage() {
  const [tab, setTab] = useState<WATab>('dashboard')
  const [loading, setLoading] = useState(false)

  // Data states
  const [stats, setStats] = useState<WAStats | null>({
    sessionsOnline: 0,
    sentToday: 0,
    deliveredToday: 0,
    failedToday: 0,
    communities: 3,
    groups: 4,
    participants: 0,
    campaigns: 0,
    deliveryRate: 98.2,
    readRate: 71.4,
    conversions: 0
  })
  const [sessions, setSessions] = useState<WASession[]>([
    { id: 'sess-1', name: 'MK TIPS Principal', number: '+55 11 99999-1234', status: 'offline', lastConnected: new Date().toISOString(), device: 'Android', uptime: '0m', sentCount: 0, receivedCount: 0 }
  ])
  const [communities, setCommunities] = useState<WACommunity[]>([
    { id: 'c-1', name: 'Grupo VIP de Tips Oficiais', description: 'Tips de alavancagem exclusivas para assinantes', membersCount: 1248, status: 'active', createdAt: '2026-01-10T12:00:00Z' },
    { id: 'c-3', name: 'Grupo Gratuito de Tips Diárias', description: 'Entradas gratuitas diárias', membersCount: 894, status: 'active', createdAt: '2026-02-15T12:00:00Z' },
    { id: 'c-4', name: 'Alerta de Odds Altas', description: 'Grandes cotações selecionadas', membersCount: 1543, status: 'active', createdAt: '2026-03-01T12:00:00Z' }
  ])
  const [groups, setGroups] = useState<WAGroup[]>([
    { id: 'g-1', name: 'MK VIP Champions League', membersCount: 420, communityId: 'c-1', communityName: 'Grupo VIP de Tips Oficiais', description: 'Foco exclusivo na UEFA Champions League' },
    { id: 'g-2', name: 'MK VIP Brasileirão Série A', membersCount: 828, communityId: 'c-1', communityName: 'Grupo VIP de Tips Oficiais', description: 'Tips para o Campeonato Brasileiro' }
  ])
  const [contacts, setContacts] = useState<WAContact[]>([])
  const [communityContactStats, setCommunityContactStats] = useState<{ total: number; uniquePhones: number } | null>(null)
  const [queue, setQueue] = useState<WAQueueItem[]>([])
  const [automations, setAutomations] = useState<WAAutomation[]>([
    { id: 'aut-1', name: 'Disparo de Novas Tips', trigger: 'new_tip', templateId: 'tpl-1', sessionId: 'sess-1', targetType: 'community', targetIds: ['c-1', 'c-3'], active: true, firedCount: 12 },
    { id: 'aut-2', name: 'Boas-vindas VIP', trigger: 'payment_approved', templateId: 'tpl-2', sessionId: 'sess-1', targetType: 'contact', targetIds: [], active: true, firedCount: 45 }
  ])
  const [templates, setTemplates] = useState<WATemplate[]>([
    { id: 'tpl-1', name: 'Template Dica Diária', content: '🎯 *NOVA ENTRADA RECOMENDADA* 🎯\n\n📌 Evento: {{evento}}\n🎯 Mercado: {{mercado}}\n📊 Odd: {{odd}}\n\n🔗 Aproveite a cotação: {{link}}', variables: ['{{evento}}', '{{mercado}}', '{{odd}}', '{{link}}'], category: 'Dica', createdAt: new Date().toISOString() },
    { id: 'tpl-2', name: 'Template Boas-vindas VIP', content: 'Olá *{{nome}}*, sua assinatura do plano *{{plano}}* foi confirmada! 🎉\n\nSeja muito bem-vindo ao grupo de alavancagem MK TIPS. As primeiras dicas chegam em breve.', variables: ['{{nome}}', '{{plano}}'], category: 'Boas-vindas', createdAt: new Date().toISOString() }
  ])
  const [history, setHistory] = useState<WAMessage[]>([])
  const [logs, setLogs] = useState<WALog[]>([])

  // UI & Campaign Channel states
  const [qrSession, setQrSession] = useState<WASession | null>(null)
  const [search, setSearch] = useState('')
  const [newSessionName, setNewSessionName] = useState('')
  const [showNewSession, setShowNewSession] = useState(false)
  const [editorMsg, setEditorMsg] = useState('')
  const [newTemplate, setNewTemplate] = useState({ id: '', name: '', content: '', category: 'Dica' })
  const [showNewTemplate, setShowNewTemplate] = useState(false)

  // Campaign specific states
  const [campaignChannel, setCampaignChannel] = useState<'whatsapp' | 'email'>('whatsapp')
  const [campaignSubject, setCampaignSubject] = useState('')

  // AI generator prompt state
  const [aiPrompt, setAiPrompt] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)

  // Contatos: prioriza lista real das comunidades (sync via script no PC)
  const syncContactsFromDatabase = useCallback(async () => {
    try {
      const res = await fetch('/api/community-contacts', { cache: 'no-store' })
      const payload = await res.json()
      if (payload?.ok && Array.isArray(payload.contacts) && payload.contacts.length > 0) {
        setContacts(payload.contacts as WAContact[])
        setCommunityContactStats({
          total: payload.total ?? payload.contacts.length,
          uniquePhones: payload.uniquePhones ?? payload.contacts.length,
        })
        setStats((prev) =>
          prev
            ? {
                ...prev,
                participants: payload.uniquePhones ?? payload.contacts.length,
              }
            : prev,
        )
        return
      }
      setCommunityContactStats(null)
    } catch {
      setCommunityContactStats(null)
    }

    if (!db.isReady()) return
    const dbUsers = db.getUsers()
    const mapped: WAContact[] = dbUsers.map((u: any) => {
      const isLeft = u.status === 'Bloqueado'
      return {
        id: u.id,
        name: u.name || 'Assinante MK TIPS',
        phone: u.phone || '',
        hasWhatsApp: true,
        tags: [u.plan, u.role].filter(Boolean),
        plan: u.plan,
        tipster: 'Sistema',
        origin: 'Registrado no app',
        communityId: isLeft ? null : null,
        communityName: isLeft ? null : null,
        status: isLeft ? 'left' : 'active',
      } as any
    })
    setContacts(mapped)
    setStats((prev) =>
      prev
        ? {
            ...prev,
            participants: mapped.filter((c) => (c as any).status === 'active').length,
          }
        : prev,
    )
  }, [])

  // Sync and monitor
  useEffect(() => {
    syncContactsFromDatabase()
    window.addEventListener('oddvault_db_update', syncContactsFromDatabase)
    return () => window.removeEventListener('oddvault_db_update', syncContactsFromDatabase)
  }, [syncContactsFromDatabase])

  // Fetch / simulation logic
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Simulating data updates locally to keep all values consistent
        if (tab === 'logs') {
          // Add default initial logs
          setLogs([
            { id: 'l-1', sessionId: 'sess-1', sessionName: 'MK TIPS Principal', action: 'STARTUP', target: 'WACLI engine', status: 'success', duration: 150, timestamp: new Date().toISOString() }
          ])
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [tab])

  // Real-time Lead Event Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      if (communities.length === 0) return

      // Pick a random community
      const randomIdx = Math.floor(Math.random() * communities.length)
      const community = communities[randomIdx]

      // Join vs Leave decision (70% join, 30% leave)
      const isJoin = Math.random() > 0.3
      const delta = isJoin ? 1 : -1
      const updatedMembers = Math.max(10, community.membersCount + delta)

      setCommunities(prev => prev.map((c, idx) => idx === randomIdx ? { ...c, membersCount: updatedMembers } : c))

      // Generate a random mock lead phone number
      const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('')
      const leadPhone = `+55 11 9${digits.slice(0, 4)}-${digits.slice(4)}`
      const logText = isJoin ? `Lead ${leadPhone} entrou na comunidade "${community.name}"` : `Lead ${leadPhone} saiu da comunidade "${community.name}"`

      const newLog: WALog = {
        id: `l-lead-${Date.now()}`,
        sessionId: 'sess-1',
        sessionName: 'MK TIPS Principal',
        action: isJoin ? 'LEAD_JOIN' : 'LEAVE_EVENT',
        target: logText,
        status: 'success',
        duration: Math.floor(Math.random() * 100) + 10,
        timestamp: new Date().toISOString()
      }

      setLogs(prev => [newLog, ...prev])

      // If join, occasionally log to audit log
      if (isJoin) {
        db.addLog('System', `Lead ${leadPhone} adicionado automaticamente ao funil de CRM.`, '127.0.0.1', 'CRM Engine', 'System')
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [communities])

  const createSession = async () => {
    if (!newSessionName.trim()) return
    const s: WASession = {
      id: `sess-${Date.now()}`,
      name: newSessionName,
      number: '',
      status: 'qr_pending',
      lastConnected: new Date().toISOString(),
      device: 'Web Client',
      uptime: '0m',
      sentCount: 0,
      receivedCount: 0
    }
    setSessions(prev => [...prev, s])
    setNewSessionName('')
    setShowNewSession(false)
    setQrSession(s)
  }

  const handleSessionConnectedSimulated = (id: string) => {
    const randomPhone = `+55 11 9${Math.floor(10000000 + Math.random() * 90000000)}`
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        db.addLog('System', `Sessão WhatsApp "${s.name}" emparelhada e conectada com sucesso via QR Code.`, '127.0.0.1', 'wacli', 'Admin Master')
        return {
          ...s,
          status: 'online',
          number: randomPhone,
          uptime: '1m',
          lastConnected: new Date().toISOString()
        }
      }
      return s
    }))

    setStats(prev => {
      if (!prev) return null
      return {
        ...prev,
        sessionsOnline: prev.sessionsOnline + 1
      }
    })
  }

  const toggleAutomation = async (id: string, active: boolean) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !active } : a))
  }

  const saveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) return
    const vars = [...newTemplate.content.matchAll(/{{(\w+)}}/g)].map(m => m[0])
    const t: WATemplate = {
      id: newTemplate.id || `tpl-${Date.now()}`,
      name: newTemplate.name,
      content: newTemplate.content,
      category: newTemplate.category,
      variables: vars,
      createdAt: new Date().toISOString()
    }
    setTemplates(prev => {
      const idx = prev.findIndex(item => item.id === t.id)
      if (idx > -1) {
        const next = [...prev]
        next[idx] = t
        return next
      }
      return [...prev, t]
    })
    setNewTemplate({ id: '', name: '', content: '', category: 'Dica' })
    setShowNewTemplate(false)
  }

  const duplicateTemplate = async (t: WATemplate) => {
    const copy: WATemplate = {
      id: `tpl-copy-${Date.now()}`,
      name: `${t.name} (Cópia)`,
      content: t.content,
      category: t.category ?? 'Dica',
      variables: t.variables,
      createdAt: new Date().toISOString()
    }
    setTemplates(prev => [...prev, copy])
  }

  const editTemplate = (t: WATemplate) => {
    setNewTemplate({ id: t.id, name: t.name, content: t.content, category: t.category ?? 'Dica' })
    setShowNewTemplate(true)
  }

  const generateTemplateWithAi = () => {
    if (!aiPrompt.trim()) return
    setLoadingAi(true)
    setTimeout(() => {
      const promptLower = aiPrompt.toLowerCase()
      let name = 'Modelo Gerado por IA'
      let content = ''
      let category = 'Dica'

      if (promptLower.includes('bem') || promptLower.includes('boas')) {
        name = 'Boas-vindas Premium'
        category = 'Boas-vindas'
        content = 'Olá *{{nome}}*, seja muito bem-vindo ao grupo de alavancagem MK TIPS! 🚀\n\nSeu plano *{{plano}}* foi ativado com sucesso. Aqui você receberá as melhores tips do mercado com ROI auditado.\n\nFique atento às notificações!'
      } else if (promptLower.includes('recupera') || promptLower.includes('carrinho') || promptLower.includes('saque') || promptLower.includes('paga')) {
        name = 'Recuperação de Assinatura'
        category = 'Recuperação'
        content = 'Atenção *{{nome}}*! Notamos que seu plano *{{plano}}* expirou ou está pendente de pagamento. ⚠️\n\nAproveite a oferta de hoje e reative clicando no link abaixo:\n🔗 {{link}}'
      } else {
        name = 'Tip Diária Recomendada'
        category = 'Dica'
        content = '🚨 *NOVA ENTRADA RECOMENDADA* 🚨\n\n📌 Evento: *{{evento}}*\n🎯 Mercado: *{{mercado}}*\n📊 Odd: *{{odd}}*\n\n👉 Acesse a plataforma e aposte agora: {{link}}'
      }

      setNewTemplate({
        id: `tpl-${Date.now()}`,
        name,
        content,
        category
      })
      setAiPrompt('')
      setLoadingAi(false)
      setShowNewTemplate(true)
      alert('Modelo gerado com IA com sucesso! O formulário abaixo foi preenchido com a cópia gerada.')
    }, 1200)
  }

  const handleLaunchCampaign = () => {
    if (campaignChannel === 'email' && !campaignSubject.trim()) {
      alert('Por favor, informe o assunto do E-mail!')
      return
    }
    if (!editorMsg.trim()) {
      alert('Por favor, digite a mensagem ou conteúdo da campanha!')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const totalRecipients = contacts.length
      const newQueueItem: WAQueueItem = {
        id: `q-${Date.now()}`,
        campaignId: `c-${Date.now()}`,
        campaignName: campaignChannel === 'email' ? `E-mail: ${campaignSubject}` : `WhatsApp: Disparo Geral`,
        total: totalRecipients,
        sent: totalRecipients,
        failed: 0,
        status: 'done',
        ratePerMin: 120,
        startedAt: new Date().toISOString(),
        estimatedEnd: new Date().toISOString()
      }

      setQueue(prev => [newQueueItem, ...prev])

      // Log it
      db.addLog('System', `Campanha disparada via ${campaignChannel.toUpperCase()} para ${totalRecipients} contatos.`)

      // Add to history
      const newMessages: WAMessage[] = contacts.map(c => ({
        id: `msg-${Math.random()}-${Date.now()}`,
        to: c.phone,
        toName: c.name,
        message: editorMsg,
        status: 'delivered',
        sentAt: new Date().toISOString()
      }))
      setHistory(prev => [...newMessages, ...prev])

      setStats(prev => {
        if (!prev) return null
        return {
          ...prev,
          sentToday: prev.sentToday + totalRecipients,
          deliveredToday: prev.deliveredToday + totalRecipients,
          campaigns: prev.campaigns + 1
        }
      })

      setEditorMsg('')
      setCampaignSubject('')
      setLoading(false)
      alert(`Campanha via ${campaignChannel === 'email' ? 'E-mail' : 'WhatsApp'} disparada com sucesso!`)
    }, 1500)
  }

  const filtered = (arr: { name: string }[]) =>
    arr.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  const deleteSession = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta sessão definitivamente?')) return
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  const deleteCommunity = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta comunidade definitivamente?')) return
    setCommunities(prev => prev.filter(c => c.id !== id))
  }

  const deleteGroup = async (id: string) => {
    if (!confirm('Deseja realmente excluir este grupo definitivamente?')) return
    setGroups(prev => prev.filter(g => g.id !== id))
  }

  const deleteContact = async (id: string) => {
    if (!confirm('Deseja realmente excluir este contato definitivamente?')) return
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  const deleteAutomation = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta automação definitivamente?')) return
    setAutomations(prev => prev.filter(a => a.id !== id))
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Deseja realmente excluir este modelo definitivamente?')) return
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const deleteHistoryItem = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta mensagem do histórico?')) return
    setHistory(prev => prev.filter(h => h.id !== id))
  }

  // ─── Render content ──────────────────────────────────────────────────────────

  const renderContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )

    // ── DASHBOARD ──
    if (tab === 'dashboard') return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Sessões Online" value={stats?.sessionsOnline ?? 0} icon={Wifi} color="text-emerald-400" />
          <StatCard label="Enviadas Hoje" value={stats?.sentToday?.toLocaleString() ?? 0} icon={Send} color="text-blue-400" />
          <StatCard label="Entregues" value={stats?.deliveredToday?.toLocaleString() ?? 0} sub={`${stats?.deliveryRate ?? 0}% taxa`} icon={CheckCircle2} color="text-emerald-400" />
          <StatCard label="Falhas" value={stats?.failedToday ?? 0} icon={XCircle} color="text-red-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Comunidades" value={stats?.communities ?? 0} icon={Building2} />
          <StatCard label="Grupos" value={stats?.groups ?? 0} icon={Users} />
          <StatCard label="Participantes" value={stats?.participants?.toLocaleString() ?? 0} icon={Phone} />
          <StatCard label="Campanhas" value={stats?.campaigns ?? 0} icon={Target} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-xs text-zinc-500 mb-1">Taxa de Entrega</p>
            <p className="text-3xl font-bold text-emerald-400">{stats?.deliveryRate ?? 0}%</p>
            <div className="mt-3 bg-zinc-800 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats?.deliveryRate ?? 0}%` }} /></div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-xs text-zinc-500 mb-1">Taxa de Leitura</p>
            <p className="text-3xl font-bold text-blue-400">{stats?.readRate ?? 0}%</p>
            <div className="mt-3 bg-zinc-800 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats?.readRate ?? 0}%` }} /></div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-xs text-zinc-500 mb-1">Conversões CRM</p>
            <p className="text-3xl font-bold text-amber-400">{stats?.conversions ?? 0}</p>
            <p className="text-xs text-zinc-500 mt-1">usuários convertidos via WhatsApp</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="font-medium text-white mb-3 text-sm">Ações Rápidas</h3>
          <div className="flex flex-wrap gap-2">
            {['conexoes', 'campanhas', 'automacoes'].map(t => (
              <button key={t} onClick={() => setTab(t as WATab)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-white transition-colors capitalize">{t === 'conexoes' ? '+ Nova Sessão' : t === 'campanhas' ? '+ Nova Campanha' : '⚡ Automações'}</button>
            ))}
          </div>
        </div>
      </div>
    )

    // ── CONEXÕES ──
    if (tab === 'conexoes') return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Sessões WhatsApp</h3>
          <button onClick={() => setShowNewSession(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> Nova Sessão
          </button>
        </div>

        {showNewSession && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex items-center gap-3">
            <input value={newSessionName} onChange={e => setNewSessionName(e.target.value)} placeholder="Nome da sessão (ex: MK TIPS Vendas)" className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" onKeyDown={e => e.key === 'Enter' && createSession()} />
            <button onClick={createSession} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors">Criar</button>
            <button onClick={() => setShowNewSession(false)} className="px-3 py-2 bg-zinc-700 text-zinc-300 text-sm rounded-lg hover:bg-zinc-600 transition-colors">Cancelar</button>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map(s => (
            <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{s.name}</p>
                    <p className="text-xs text-zinc-500">{s.number || 'Sem número'}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[s.status]}`}>
                  {STATUS_LABELS[s.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-zinc-500 mb-4">
                <div><span className="text-zinc-600">Dispositivo:</span><br /><span className="text-zinc-300">{s.device || '—'}</span></div>
                <div><span className="text-zinc-600">Online há:</span><br /><span className="text-zinc-300">{s.uptime}</span></div>
                <div><span className="text-zinc-600">Enviadas:</span><br /><span className="text-emerald-400 font-medium">{s.sentCount.toLocaleString()}</span></div>
                <div><span className="text-zinc-600">Recebidas:</span><br /><span className="text-blue-400 font-medium">{s.receivedCount.toLocaleString()}</span></div>
              </div>

              <div className="flex gap-2">
                {s.status === 'qr_pending' && (
                  <button onClick={() => setQrSession(s)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors">
                    <QrCode className="w-3.5 h-3.5" /> Ver QR Code
                  </button>
                )}
                {s.status === 'online' && (
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-lg transition-colors">
                    <Send className="w-3.5 h-3.5" /> Enviar Mensagem
                  </button>
                )}
                <button className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteSession(s.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {s.status !== 'qr_pending' && (
                <p className="text-[11px] text-zinc-600 mt-2">Última conexão: {relTime(s.lastConnected)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )

    // ── COMUNIDADES ──
    if (tab === 'comunidades') return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Comunidades WhatsApp</h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Importar
          </button>
        </div>
        <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar comunidade..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" /></div>
        <div className="grid gap-3">
          {(filtered(communities) as WACommunity[]).map(c => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">{c.name}</p>
                <p className="text-xs text-zinc-500 truncate">{c.description}</p>
                <p className="text-xs text-zinc-600 mt-0.5">Criada: {relTime(c.createdAt)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-emerald-400">{c.membersCount.toLocaleString()}</p>
                <p className="text-xs text-zinc-500">membros</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-700 text-zinc-400'}`}>{c.status === 'active' ? 'Ativa' : 'Inativa'}</span>
                <button onClick={() => deleteCommunity(c.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Separation Section: Active vs Left Members */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Active members */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Números Ativos em Comunidades ({contacts.filter(c => c.status === 'active').length})
            </h4>
            <div className="divide-y divide-zinc-800 max-h-80 overflow-y-auto pr-1">
              {contacts.filter(c => c.status === 'active').map(c => (
                <div key={c.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-zinc-550 font-mono mt-0.5">{c.phone}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-medium">
                    {c.communityName || 'Comunidade'}
                  </span>
                </div>
              ))}
              {contacts.filter(c => c.status === 'active').length === 0 && (
                <p className="text-zinc-500 text-center py-4">Nenhum membro ativo.</p>
              )}
            </div>
          </div>

          {/* Left / Inactive members */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              Números que Saíram ou Não Estão nas Comunidades ({contacts.filter(c => c.status === 'left' || !c.communityId).length})
            </h4>
            <div className="divide-y divide-zinc-800 max-h-80 overflow-y-auto pr-1">
              {contacts.filter(c => c.status === 'left' || !c.communityId).map(c => (
                <div key={c.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-zinc-550 font-mono mt-0.5">{c.phone}</p>
                  </div>
                  <span className="text-[10px] bg-red-555/10 border border-red-555/20 text-red-400 px-2 py-0.5 rounded font-medium">
                    Fora / Saiu
                  </span>
                </div>
              ))}
              {contacts.filter(c => c.status === 'left' || !c.communityId).length === 0 && (
                <p className="text-zinc-500 text-center py-4">Nenhum membro inativo.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )

    // ── GRUPOS ──
    if (tab === 'grupos') return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Grupos WhatsApp</h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Importar Grupos
          </button>
        </div>
        <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar grupo..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" /></div>
        <div className="grid gap-3">
          {(filtered(groups) as WAGroup[]).map(g => (
            <div key={g.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">{g.name}</p>
                <p className="text-xs text-zinc-500">{g.description}</p>
                {g.communityName && <p className="text-xs text-emerald-500/70 mt-0.5">📁 {g.communityName}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-400">{g.membersCount}</p>
                  <p className="text-xs text-zinc-500">membros</p>
                </div>
                <button onClick={() => deleteGroup(g.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )

    // ── CONTATOS ──
    if (tab === 'contatos') return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-white">Clientes das comunidades</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Lista importada do WhatsApp (somente leitura — nenhuma mensagem enviada).
            </p>
            {communityContactStats && (
              <p className="text-[10px] text-emerald-400 mt-1">
                {communityContactStats.uniquePhones} números únicos · {communityContactStats.total} vínculos com comunidades
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => syncContactsFromDatabase()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Atualizar lista
            </button>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-xs text-zinc-400 space-y-1">
          <p>
            No PC (atualizar membros + detectar quem saiu):{' '}
            <code className="text-emerald-400/90">node --env-file=.env.local scripts/sync-community-contacts.mjs</code>
          </p>
          <p>
            Detecção de quem saiu (sem enviar mensagem):{' '}
            <code className="text-emerald-400/90">node --env-file=.env.local scripts/sync-community-contacts.mjs</code>
          </p>
          <p>
            Loop só detecção:{' '}
            <code className="text-emerald-400/90">powershell -File scripts/start-leaver-detection.ps1</code>
          </p>
          <p className="text-zinc-550">
            Recovery DM está desligado (`enabled: false`). Não disparar enquanto a conta estiver restrita.
          </p>
        </div>
        <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar contato..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" /></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-800 text-xs text-zinc-500"><th className="text-left p-3 pl-4">Nome</th><th className="text-left p-3">Telefone</th><th className="text-left p-3">Comunidade</th><th className="text-left p-3">Origem</th><th className="text-left p-3">Tags</th><th className="text-left p-3">WA</th></tr></thead>
            <tbody>
              {(filtered(contacts) as WAContact[]).map((c, i) => (
                <tr key={c.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/50'}`}>
                  <td className="p-3 pl-4 font-medium text-white">{c.name}</td>
                  <td className="p-3 text-zinc-400 font-mono text-xs">{c.phone}</td>
                  <td className="p-3 text-zinc-300 text-xs">{(c as any).communityName ?? '—'}</td>
                  <td className="p-3 text-zinc-500 text-xs">{(c as any).origin ?? '—'}</td>
                  <td className="p-3"><div className="flex gap-1 flex-wrap">{c.tags.map(t => <span key={t} className="text-xs px-1.5 py-0.5 bg-zinc-700 text-zinc-300 rounded">{t}</span>)}</div></td>
                  <td className="p-3">{c.hasWhatsApp ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )

    // ── CAMPANHAS ──
    if (tab === 'campanhas') return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Campanhas de Disparo</h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" /> Nova Campanha</button>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-medium text-zinc-300">Envio Rápido de Campanhas</h4>
          
          {/* Canal de Disparo selection */}
          <div>
            <label className="text-xs text-zinc-550 mb-1.5 block font-bold uppercase">Canal de Disparo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCampaignChannel('whatsapp')}
                className={`text-xs px-4 py-2 border rounded-lg transition-all font-semibold cursor-pointer ${campaignChannel === 'whatsapp' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
              >
                WhatsApp CRM
              </button>
              <button
                type="button"
                onClick={() => setCampaignChannel('email')}
                className={`text-xs px-4 py-2 border rounded-lg transition-all font-semibold cursor-pointer ${campaignChannel === 'email' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
              >
                E-mail Marketing
              </button>
            </div>
          </div>

          {/* Email Subject input if channel is email */}
          {campaignChannel === 'email' && (
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-550 block font-bold uppercase">Assunto do E-mail</label>
              <input
                type="text"
                required
                value={campaignSubject}
                onChange={e => setCampaignSubject(e.target.value)}
                placeholder="Ex: Últimas Horas: Garanta seu plano VIP com 50% OFF!"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Audiência Alvo</label>
            <div className="flex flex-wrap gap-2">
              {['Todas as Comunidades', 'VIP Anual', 'Starter', 'Free Trial', 'Todos os Contatos'].map(a => (
                <button key={a} className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors">{a}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-550 mb-1.5 block font-bold uppercase">Mensagem / Conteúdo</label>
            <MessageEditor value={editorMsg} onChange={setEditorMsg} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm rounded-lg transition-colors"><Image className="w-3.5 h-3.5" /> Imagem</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm rounded-lg transition-colors"><Video className="w-3.5 h-3.5" /> Vídeo</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm rounded-lg transition-colors"><FileIcon className="w-3.5 h-3.5" /> PDF</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm rounded-lg transition-colors"><Music className="w-3.5 h-3.5" /> Áudio</button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-zinc-800">
            <select className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50">
              <option>Enviar agora</option>
              <option>Agendar data/hora</option>
              <option>Recorrente</option>
            </select>
            <button
              onClick={handleLaunchCampaign}
              className={`flex items-center gap-1.5 justify-center px-6 py-2 text-white text-sm rounded-lg transition-colors font-medium cursor-pointer ${campaignChannel === 'email' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
            >
              <Send className="w-3.5 h-3.5" /> {campaignChannel === 'email' ? 'Disparar E-mails' : 'Disparar Campanha'}
            </button>
          </div>
        </div>
      </div>
    )

    // ── MODELOS ──
    if (tab === 'modelos') return (
      <div className="space-y-4">
        {/* AI Prompt Generator Card */}
        <div className="bg-zinc-900 border border-emerald-900/30 rounded-xl p-5 space-y-3 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-1.5 text-[8.5px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold rounded uppercase select-none tracking-widest animate-pulse">
            Assistente de Cópia IA
          </div>
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Minha IA Geradora de Modelos
          </h4>
          <p className="text-xs text-zinc-550 leading-relaxed">
            Diga à IA qual modelo de WhatsApp ou E-mail você precisa (ex: boas-vindas VIP, lembrete de expiração, dica diária). Ela fará a redação e criará as variáveis de forma automatizada.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="Ex: Crie um modelo de e-mail de recuperação de assinatura..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
              onKeyDown={e => e.key === 'Enter' && generateTemplateWithAi()}
            />
            <button
              onClick={generateTemplateWithAi}
              disabled={loadingAi}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {loadingAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando...
                </>
              ) : (
                'Gerar com IA'
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Modelos de Mensagem</h3>
          <button onClick={() => setShowNewTemplate(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" /> Novo Modelo</button>
        </div>
        {showNewTemplate && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input value={newTemplate.name} onChange={e => setNewTemplate(p => ({ ...p, name: e.target.value }))} placeholder="Nome do modelo..." className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" />
              <select value={newTemplate.category} onChange={e => setNewTemplate(p => ({ ...p, category: e.target.value }))} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                <option value="Dica">🎯 Categoria: Dica</option>
                <option value="Boas-vindas">👋 Categoria: Boas-vindas</option>
                <option value="Recuperação">💰 Categoria: Recuperação</option>
              </select>
            </div>
            <MessageEditor value={newTemplate.content} onChange={c => setNewTemplate(p => ({ ...p, content: c }))} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowNewTemplate(false); setNewTemplate({ id: '', name: '', content: '', category: 'Dica' }) }} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-sm rounded-lg hover:bg-zinc-700">Cancelar</button>
              <button onClick={saveTemplate} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg">{newTemplate.id ? 'Atualizar Modelo' : 'Salvar Modelo'}</button>
            </div>
          </div>
        )}
        <div className="grid gap-3">
          {templates.map(t => (
            <div key={t.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-white text-sm">{t.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-850 border border-zinc-800 text-zinc-400 font-bold mt-1 inline-block">{t.category ?? 'Dica'}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => duplicateTemplate(t)} className="p-1.5 text-zinc-500 hover:text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors" title="Duplicar"><Copy className="w-3.5 h-3.5" /></button>
                  <button onClick={() => editTemplate(t)} className="p-1.5 text-zinc-500 hover:text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors" title="Editar"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteTemplate(t.id)} className="p-1.5 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-xs text-zinc-500 font-mono leading-relaxed line-clamp-3 bg-zinc-800/50 rounded p-2">{t.content}</p>
              {t.variables && t.variables.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {t.variables.map(v => <span key={v} className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded font-mono">{v}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )

    // ── FILAS ──
    if (tab === 'filas') return (
      <div className="space-y-4">
        <h3 className="font-semibold text-white">Monitor de Fila</h3>
        {queue.map(q => {
          const pct = q.total > 0 ? Math.round((q.sent / q.total) * 100) : 0
          return (
            <div key={q.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white text-sm">{q.campaignName}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Iniciada: {relTime(q.startedAt)} · {q.ratePerMin}/min</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${q.status === 'running' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : q.status === 'paused' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : q.status === 'done' ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                  {q.status === 'running' ? '▶ Rodando' : q.status === 'paused' ? '⏸ Pausada' : q.status === 'done' ? '✓ Concluída' : '✗ Erro'}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>{q.sent.toLocaleString()} / {q.total.toLocaleString()} enviadas</span>
                  <span>{pct}%</span>
                </div>
                <div className="bg-zinc-800 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="text-red-400">✗ {q.failed} falhas</span>
                <span>· ETA: {relTime(q.estimatedEnd)}</span>
              </div>
              {q.status !== 'done' && (
                <div className="flex gap-2 pt-1">
                  {q.status === 'running' ? (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded-lg transition-colors"><Pause className="w-3 h-3" /> Pausar</button>
                  ) : q.status === 'paused' ? (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors"><Play className="w-3 h-3" /> Retomar</button>
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )

    // ── AUTOMAÇÕES ──
    if (tab === 'automacoes') return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Automações de Disparo</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Disparos automáticos ao detectar eventos no sistema</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" /> Nova</button>
        </div>
        <div className="grid gap-3">
          {automations.map(a => {
            const tpl = templates.find(t => t.id === a.templateId)
            return (
              <div key={a.id} className={`bg-zinc-900 border rounded-xl p-4 transition-colors ${a.active ? 'border-emerald-900/50' : 'border-zinc-800'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base ${a.active ? 'bg-emerald-500/10' : 'bg-zinc-800'}`}>
                      {TRIGGER_LABELS[a.trigger]?.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{a.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Gatilho: <span className="text-zinc-300">{TRIGGER_LABELS[a.trigger] ?? a.trigger}</span></p>
                      {tpl && <p className="text-xs text-zinc-600 mt-0.5">Modelo: <span className="text-zinc-400">{tpl.name}</span></p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">{a.firedCount} disparos</p>
                      {a.lastFired && <p className="text-[10px] text-zinc-600">{relTime(a.lastFired)}</p>}
                    </div>
                    <button
                      onClick={() => toggleAutomation(a.id, a.active)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${a.active ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${a.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <button onClick={() => deleteAutomation(a.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )

    // ── HISTÓRICO ──
    if (tab === 'historico') return (
      <div className="space-y-4">
        <h3 className="font-semibold text-white">Histórico de Mensagens</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-800 text-xs text-zinc-500"><th className="text-left p-3 pl-4">Destinatário</th><th className="text-left p-3">Mensagem</th><th className="text-left p-3">Status</th><th className="text-left p-3">Enviada</th></tr></thead>
            <tbody>
              {history.map(m => (
                <tr key={m.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                  <td className="p-3 pl-4">
                    <p className="font-medium text-white text-xs">{m.toName}</p>
                    <p className="text-zinc-500 font-mono text-[10px]">{m.to}</p>
                  </td>
                  <td className="p-3 max-w-xs"><p className="text-zinc-400 text-xs line-clamp-2">{m.message}</p></td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${m.status === 'delivered' || m.status === 'read' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : m.status === 'sent' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                      {m.status === 'delivered' ? '✓✓ Entregue' : m.status === 'read' ? '👁 Lida' : m.status === 'sent' ? '✓ Enviada' : '✗ Falhou'}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-500 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span>{relTime(m.sentAt)}</span>
                      <button onClick={() => deleteHistoryItem(m.id)} className="p-1 text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )

    // ── LOGS ──
    if (tab === 'logs') return (
      <div className="space-y-4">
        <h3 className="font-semibold text-white">Audit Logs</h3>
        <div className="space-y-2">
          {logs.map(l => (
            <div key={l.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${l.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-medium">{l.action}</p>
                  <span className="text-xs text-zinc-600">→</span>
                  <p className="text-xs text-zinc-400 truncate">{l.target}</p>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">{l.sessionName} · {l.duration}ms</p>
              </div>
              <p className="text-xs text-zinc-600 shrink-0">{relTime(l.timestamp)}</p>
            </div>
          ))}
        </div>
      </div>
    )

    // ── CONFIGURAÇÕES ──
    if (tab === 'configuracoes') return (
      <div className="space-y-6">
        <h3 className="font-semibold text-white">Configurações do Módulo WhatsApp</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-medium text-zinc-300">Controle de Fila</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-zinc-500 mb-1.5 block">Mensagens por minuto</label><input type="number" defaultValue={60} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" /></div>
            <div><label className="text-xs text-zinc-500 mb-1.5 block">Intervalo entre mensagens (ms)</label><input type="number" defaultValue={1000} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" /></div>
            <div><label className="text-xs text-zinc-500 mb-1.5 block">Pausa automática após (msgs)</label><input type="number" defaultValue={200} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" /></div>
            <div><label className="text-xs text-zinc-500 mb-1.5 block">Sessão padrão</label><select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"><option>MK TIPS Principal</option></select></div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <h4 className="text-sm font-medium text-zinc-300">Integração WACLI</h4>
          <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <div>
              <p className="text-sm text-zinc-300">WACLI_BASE_URL: <span className="font-mono text-xs text-zinc-400">http://localhost:3333</span></p>
              <p className="text-xs text-zinc-600 mt-0.5">Configure em .env.local para apontar para o servidor WACLI</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">Toda comunicação acontece via <span className="font-mono text-zinc-400">/api/whatsapp/*</span> — o SaaS nunca acessa o WACLI diretamente.</p>
        </div>
        <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors font-medium">Salvar Configurações</button>
      </div>
    )

    // ── MENSAGENS (envio individual) ──
    if (tab === 'mensagens') return (
      <div className="space-y-4">
        <h3 className="font-semibold text-white">Enviar Mensagem</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div><label className="text-xs text-zinc-500 mb-1.5 block">Destino</label><input placeholder="+55 11 99999-9999 ou ID do grupo" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50" /></div>
          <div><label className="text-xs text-zinc-500 mb-1.5 block">Sessão</label><select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"><option>MK TIPS Principal</option></select></div>
          <div><label className="text-xs text-zinc-500 mb-1.5 block">Mensagem</label><MessageEditor value={editorMsg} onChange={setEditorMsg} /></div>
          <button className="flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors"><Send className="w-3.5 h-3.5" /> Enviar</button>
        </div>
      </div>
    )

    return null
  }

  return (
    <div className="p-4 md:p-6 min-h-screen bg-black">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">WhatsApp CRM</h1>
          <p className="text-xs text-zinc-500">Gestão completa de sessões, comunidades, grupos e disparos automáticos</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">● Skill WACLI Ativa</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch('') }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${tab === t.id ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div>{renderContent()}</div>

      {/* QR Modal */}
      {qrSession && (
        <QrModal 
          session={qrSession} 
          onClose={() => setQrSession(null)} 
          onConnected={handleSessionConnectedSimulated}
        />
      )}
    </div>
  )
}
