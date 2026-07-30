'use client';

import { supabase, isSupabaseConfigured } from './supabase';
import {
  getUserReferralCode,
  buildReferralLink,
  getPendingReferralCode,
  clearPendingReferralCode,
  findUserIdByReferralCode,
  captureReferralCodeFromUrl,
} from './referral';

// =============================================
// Interfaces (mantidas idênticas)
// =============================================

export interface DBUser {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  language: string;
  plan: 'Free' | 'Starter' | 'Premium' | 'VIP Anual';
  role: 'Master' | 'Admin' | 'Gerente' | 'Suporte' | 'Financeiro' | 'Tipster' | 'Moderador' | 'User';
  status: 'Ativo' | 'Bloqueado' | 'Pendente';
  createdAt: string;
  lastLogin: string;
  lastLoginIp: string;
  device: string;
  os: string;
  browser: string;
  daysRemaining: number;
  revenueGenerated: number;
  totalPaid: number;
  lastPaymentDate: string;
  bankroll: number;
  bankrollCurrency: string;
  roiIndividual: number;
  tipsterId?: string;
  cpf?: string;
}

export interface DBTipster {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  sports: string[];
  markets: string[];
  bio: string;
  socials: { twitter?: string; telegram?: string; instagram?: string };
  status: 'Ativo' | 'Bloqueado' | 'Pendente';
  verified: boolean;
  badge: string;
  color: string;
  stats: {
    tipsCount: number;
    greens: number;
    reds: number;
    voids: number;
    roi: number;
    yield: number;
    profit: number;
    avgStake: number;
    avgOdd: number;
    accuracy: number;
    maxGreen: number;
    maxRed: number;
    currentStreak: number;
  };
}

export interface DBTip {
  id: string;
  sport: string;
  league: string;
  match: string;
  datetime: string;
  market: string;
  type: string;
  odd: number;
  stake: number;
  confidence: number;
  recommendedBookmaker: string;
  affiliateUrl: string;
  tipsterId: string;
  tipsterName: string;
  justification: string;
  riskIndicators: string[];
  estimatedProbability: number;
  ev: number;
  views: number;
  favoritesCount: number;
  status: 'Green' | 'Red' | 'Void' | 'Pendente' | 'Cancelada';
  oddsComparison: { bookmaker: string; odd: number }[];
}

export interface DBLog {
  id: string;
  timestamp: string;
  type: 'Auth' | 'System' | 'Payment' | 'Audit' | 'Error';
  message: string;
  ip: string;
  device: string;
  user: string;
}

export interface DBAuditLog {
  id: string;
  timestamp: string;
  author: string;
  operation: string;
  target: string;
  oldValue: string;
  newValue: string;
  ip: string;
  session: string;
}

export interface DBTicket {
  id: string;
  subject: string;
  category: string;
  status: 'Aberto' | 'Respondido' | 'Fechado';
  createdAt: string;
  messages: { sender: string; text: string; timestamp: string }[];
}

// =============================================
// Helpers: Supabase row <-> App interface mapping
// =============================================

function mapUserFromRow(row: any): DBUser {
  return {
    id: row.id,
    name: row.name || '',
    avatar: row.avatar || undefined,
    email: row.email || '',
    phone: row.phone || '',
    city: row.city || '',
    country: row.country || 'Brasil',
    language: row.language || 'pt-BR',
    plan: row.plan || 'Free',
    role: row.role || 'User',
    status: row.status || 'Ativo',
    createdAt: row.created_at || '',
    lastLogin: row.last_login || '',
    lastLoginIp: row.last_login_ip || '',
    device: row.device || '',
    os: row.os || '',
    browser: row.browser || '',
    daysRemaining: Number(row.days_remaining) || 0,
    revenueGenerated: Number(row.revenue_generated) || 0,
    totalPaid: Number(row.total_paid) || 0,
    lastPaymentDate: row.last_payment_date || '',
    bankroll: Number(row.bankroll) || 0,
    bankrollCurrency: row.bankroll_currency || 'R$',
    roiIndividual: Number(row.roi_individual) || 0,
    tipsterId: row.tipster_id || undefined,
    cpf: row.cpf || '',
  };
}

function mapUserToRow(user: Partial<DBUser>): any {
  const row: any = {};
  if (user.name !== undefined) row.name = user.name;
  if (user.avatar !== undefined) row.avatar = user.avatar;
  if (user.email !== undefined) row.email = user.email;
  if (user.phone !== undefined) row.phone = user.phone;
  if (user.city !== undefined) row.city = user.city;
  if (user.country !== undefined) row.country = user.country;
  if (user.language !== undefined) row.language = user.language;
  if (user.plan !== undefined) row.plan = user.plan;
  if (user.role !== undefined) row.role = user.role;
  if (user.status !== undefined) row.status = user.status;
  if (user.lastLogin !== undefined) row.last_login = user.lastLogin;
  if (user.lastLoginIp !== undefined) row.last_login_ip = user.lastLoginIp;
  if (user.device !== undefined) row.device = user.device;
  if (user.os !== undefined) row.os = user.os;
  if (user.browser !== undefined) row.browser = user.browser;
  if (user.daysRemaining !== undefined) row.days_remaining = user.daysRemaining;
  if (user.revenueGenerated !== undefined) row.revenue_generated = user.revenueGenerated;
  if (user.totalPaid !== undefined) row.total_paid = user.totalPaid;
  if (user.lastPaymentDate !== undefined) row.last_payment_date = user.lastPaymentDate || null;
  if (user.bankroll !== undefined) row.bankroll = user.bankroll;
  if (user.bankrollCurrency !== undefined) row.bankroll_currency = user.bankrollCurrency;
  if (user.roiIndividual !== undefined) row.roi_individual = user.roiIndividual;
  if (user.tipsterId !== undefined) row.tipster_id = user.tipsterId || null;
  if (user.cpf !== undefined) row.cpf = user.cpf;
  return row;
}

function mapTipsterFromRow(row: any): DBTipster {
  return {
    id: row.id,
    name: row.name || '',
    avatar: row.avatar || '',
    specialty: row.specialty || '',
    sports: row.sports || [],
    markets: row.markets || [],
    bio: row.bio || '',
    socials: row.socials || {},
    status: row.status || 'Ativo',
    verified: row.verified || false,
    badge: row.badge || '',
    color: row.color || '#10B981',
    stats: row.stats || {
      tipsCount: 0, greens: 0, reds: 0, voids: 0,
      roi: 0, yield: 0, profit: 0, avgStake: 0,
      avgOdd: 0, accuracy: 0, maxGreen: 0, maxRed: 0,
      currentStreak: 0,
    },
  };
}

function mapTipFromRow(row: any): DBTip {
  return {
    id: row.id,
    sport: row.sport || '',
    league: row.league || '',
    match: row.match || '',
    datetime: row.datetime || '',
    market: row.market || '',
    type: row.type || '',
    odd: Number(row.odd) || 0,
    stake: Number(row.stake) || 0,
    confidence: row.confidence || 0,
    recommendedBookmaker: row.recommended_bookmaker || '',
    affiliateUrl: row.affiliate_url || '',
    tipsterId: row.tipster_id || '',
    tipsterName: row.tipster_name || '',
    justification: row.justification || '',
    riskIndicators: row.risk_indicators || [],
    estimatedProbability: Number(row.estimated_probability) || 0,
    ev: Number(row.ev) || 0,
    views: row.views || 0,
    favoritesCount: row.favorites_count || 0,
    status: row.status || 'Pendente',
    oddsComparison: row.odds_comparison || [],
  };
}

function mapTipToRow(tip: Partial<DBTip>): any {
  const row: any = {};
  if (tip.sport !== undefined) row.sport = tip.sport;
  if (tip.league !== undefined) row.league = tip.league;
  if (tip.match !== undefined) row.match = tip.match;
  if (tip.datetime !== undefined) row.datetime = tip.datetime;
  if (tip.market !== undefined) row.market = tip.market;
  if (tip.type !== undefined) row.type = tip.type;
  if (tip.odd !== undefined) row.odd = tip.odd;
  if (tip.stake !== undefined) row.stake = tip.stake;
  if (tip.confidence !== undefined) row.confidence = tip.confidence;
  if (tip.recommendedBookmaker !== undefined) row.recommended_bookmaker = tip.recommendedBookmaker;
  if (tip.affiliateUrl !== undefined) row.affiliate_url = tip.affiliateUrl;
  if (tip.tipsterId !== undefined) row.tipster_id = tip.tipsterId || null;
  if (tip.tipsterName !== undefined) row.tipster_name = tip.tipsterName;
  if (tip.justification !== undefined) row.justification = tip.justification;
  if (tip.riskIndicators !== undefined) row.risk_indicators = tip.riskIndicators;
  if (tip.estimatedProbability !== undefined) row.estimated_probability = tip.estimatedProbability;
  if (tip.ev !== undefined) row.ev = tip.ev;
  if (tip.views !== undefined) row.views = tip.views;
  if (tip.favoritesCount !== undefined) row.favorites_count = tip.favoritesCount;
  if (tip.status !== undefined) row.status = tip.status;
  if (tip.oddsComparison !== undefined) row.odds_comparison = tip.oddsComparison;
  return row;
}

function mapLogFromRow(row: any): DBLog {
  return {
    id: row.id,
    timestamp: row.timestamp || '',
    type: row.type || 'System',
    message: row.message || '',
    ip: row.ip || '',
    device: row.device || '',
    user: row.user || 'System',
  };
}

function mapAuditLogFromRow(row: any): DBAuditLog {
  return {
    id: row.id,
    timestamp: row.timestamp || '',
    author: row.author || '',
    operation: row.operation || '',
    target: row.target || '',
    oldValue: row.old_value || '',
    newValue: row.new_value || '',
    ip: row.ip || '',
    session: row.session || '',
  };
}

function mapTicketFromRow(row: any): DBTicket {
  return {
    id: row.id,
    subject: row.subject || '',
    category: row.category || '',
    status: row.status || 'Aberto',
    createdAt: row.created_at || '',
    messages: row.messages || [],
  };
}

// =============================================
// Period filter helper
// =============================================

export function getPeriodFilter(period: string): string {
  const now = new Date();
  switch (period) {
    case 'hoje': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return start.toISOString();
    }
    case '7d': {
      const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString();
    }
    case '30d': {
      const d = new Date(now); d.setDate(d.getDate() - 30); return d.toISOString();
    }
    case '90d': {
      const d = new Date(now); d.setDate(d.getDate() - 90); return d.toISOString();
    }
    case '12m': {
      const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d.toISOString();
    }
    default: return new Date(0).toISOString();
  }
}

// =============================================
// Local cache: syncs from Supabase on init, writes through
// This allows existing sync code to work while data flows from Supabase
// =============================================

let _cache: {
  users: DBUser[];
  tipsters: DBTipster[];
  tips: DBTip[];
  logs: DBLog[];
  auditLogs: DBAuditLog[];
  tickets: DBTicket[];
  favorites: string[];
  bankrollLogs: { date: string; value: number }[];
  referrals: any[];
  challengeStages: any[];
  initialized: boolean;
  bookmakers: any[];
} = {
  users: [],
  tipsters: [],
  tips: [],
  logs: [],
  auditLogs: [],
  tickets: [],
  favorites: [],
  bankrollLogs: [],
  referrals: [],
  challengeStages: [],
  initialized: false,
  bookmakers: [],
};

const ACTIVE_USER_KEY = 'mktips_active_user_id';

function isBrowserAdminSession(): boolean {
  return typeof window !== 'undefined' && localStorage.getItem('oddvault_admin_session') === 'true';
}

function isBrowserClientSession(): boolean {
  return typeof window !== 'undefined' && localStorage.getItem('oddvault_user_session') === 'true';
}

/** Área do cliente: só a própria conta no cache/localStorage — nunca a base de leads. */
function persistPrivateUserCache(users: DBUser[]) {
  _cache.users = users;
  if (typeof window === 'undefined') return;
  if (isBrowserClientSession() && !isBrowserAdminSession()) {
    const activeId = localStorage.getItem(ACTIVE_USER_KEY);
    const mine = activeId ? users.filter((u) => u.id === activeId) : [];
    localStorage.setItem('mktips_mock_users', JSON.stringify(mine));
    return;
  }
  localStorage.setItem('mktips_mock_users', JSON.stringify(users));
}

// Background sync: fetches data from Supabase into cache
async function syncFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured. Running with mock data fallback.');
    const defaultAdmin: DBUser = {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Admin Master',
      email: 'mktips@gmail.com',
      phone: '11999999999',
      city: 'São Paulo',
      country: 'Brasil',
      language: 'pt-BR',
      plan: 'VIP Anual',
      role: 'Master',
      status: 'Ativo',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      lastLoginIp: '189.120.45.10',
      device: 'MacBook Pro',
      os: 'macOS',
      browser: 'Chrome',
      daysRemaining: 365,
      revenueGenerated: 0,
      totalPaid: 0,
      lastPaymentDate: '',
      bankroll: 0,
      bankrollCurrency: 'R$',
      roiIndividual: 0
    };
    // No seeded client accounts — clients only via Free trial (7 days) or paid signup

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mktips_mock_users');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as DBUser[];
          // Cliente nunca deve herdar lista antiga com telefones de terceiros
          if (isBrowserClientSession() && !isBrowserAdminSession()) {
            const activeId = localStorage.getItem(ACTIVE_USER_KEY);
            _cache.users = activeId ? parsed.filter((u) => u.id === activeId) : [];
            localStorage.setItem('mktips_mock_users', JSON.stringify(_cache.users));
          } else {
            _cache.users = parsed;
          }
        } catch {
          _cache.users = [defaultAdmin];
        }
      } else {
        _cache.users = isBrowserClientSession() ? [] : [defaultAdmin];
        localStorage.setItem('mktips_mock_users', JSON.stringify(_cache.users));
      }
    } else {
      _cache.users = [defaultAdmin];
    }
    _cache.initialized = true;
    return;
  }
  try {
    const clientOnly = isBrowserClientSession() && !isBrowserAdminSession();
    const activeId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_USER_KEY) : null;

    const usersPromise = clientOnly
      ? activeId
        ? supabase.from('users').select('*').eq('id', activeId).maybeSingle()
        : Promise.resolve({ data: null, error: null })
      : supabase.from('users').select('*').order('created_at', { ascending: false });

    const [usersRes, tipstersRes, tipsRes, logsRes, auditRes, ticketsRes, refsRes] = await Promise.all([
      usersPromise,
      supabase.from('tipsters').select('*').order('created_at', { ascending: false }),
      supabase.from('tips').select('*').order('created_at', { ascending: false }),
      clientOnly
        ? Promise.resolve({ data: [], error: null })
        : supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(100),
      clientOnly
        ? Promise.resolve({ data: [], error: null })
        : supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100),
      supabase.from('tickets').select('*').order('created_at', { ascending: false }),
      supabase.from('referrals').select('*').order('created_at', { ascending: false }),
    ]);

    let dbUsers: DBUser[] = [];
    if (clientOnly) {
      const row = (usersRes as { data: any }).data;
      dbUsers = row ? [mapUserFromRow(row)] : [];
    } else {
      dbUsers = ((usersRes as { data: any[] | null }).data || []).map(mapUserFromRow);
    }

    if (clientOnly) {
      // Só a conta logada — sem merge de lista antiga com outros telefones
      persistPrivateUserCache(dbUsers);
    } else {
      const localUsersStr = typeof window !== 'undefined' ? localStorage.getItem('mktips_mock_users') : null;
      const localUsers: DBUser[] = localUsersStr ? JSON.parse(localUsersStr) : [];
      const combinedUsers = [...dbUsers];
      for (const lu of localUsers) {
        if (!combinedUsers.some((u) => u.email.toLowerCase() === lu.email.toLowerCase())) {
          combinedUsers.push(lu);
        }
      }
      persistPrivateUserCache(combinedUsers);
    }
    
    // Seed default admin user if database is completely empty so that the dashboard doesn't lock
    if (_cache.users.length === 0 && !clientOnly) {
      const defaultAdmin: DBUser = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Admin Master',
        email: 'mktips@gmail.com',
        phone: '11999999999',
        city: 'São Paulo',
        country: 'Brasil',
        language: 'pt-BR',
        plan: 'VIP Anual',
        role: 'Master',
        status: 'Ativo',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        lastLoginIp: '189.120.45.10',
        device: 'MacBook Pro',
        os: 'macOS',
        browser: 'Chrome',
        daysRemaining: 365,
        revenueGenerated: 0,
        totalPaid: 0,
        lastPaymentDate: '',
        bankroll: 0,
        bankrollCurrency: 'R$',
        roiIndividual: 0
      };
      _cache.users = [defaultAdmin];
      if (isSupabaseConfigured) {
        supabase.from('users').insert({ id: defaultAdmin.id, ...mapUserToRow(defaultAdmin) }).then();
      }
    }

    _cache.tipsters = (tipstersRes.data || []).map(mapTipsterFromRow);
    if (tipsRes.error) {
      console.error('Tips sync error:', tipsRes.error.message);
    }
    _cache.tips = (tipsRes.data || []).map(mapTipFromRow);

    const me = _cache.users[0];
    const myEmail = (me?.email || '').toLowerCase();
    const myName = me?.name || '';

    if (clientOnly) {
      // Cliente não vê logs/auditoria/tickets de outras pessoas
      _cache.logs = [];
      _cache.auditLogs = [];
      _cache.tickets = (ticketsRes.data || [])
        .map(mapTicketFromRow)
        .filter((t) => {
          const cat = (t.category || '').toLowerCase();
          const first = t.messages[0]?.sender || '';
          return (
            (myEmail && (cat === myEmail || first.toLowerCase().includes(myEmail))) ||
            (myName && first.includes(myName))
          );
        });
      _cache.referrals = (refsRes.data || []).filter(
        (r: any) => !me?.id || r.referrer_id === me.id || r.referrerId === me.id,
      );
    } else {
      _cache.logs = (logsRes.data || []).map(mapLogFromRow);
      _cache.auditLogs = (auditRes.data || []).map(mapAuditLogFromRow);
      _cache.tickets = (ticketsRes.data || []).map(mapTicketFromRow);
      _cache.referrals = refsRes.data || [];
    }
    _cache.initialized = true;
  } catch (e) {
    console.error('Supabase sync error:', e);
    // Fallback seed on connection failure
    _cache.users = [
      {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Admin Master',
        email: 'mktips@gmail.com',
        phone: '11999999999',
        city: 'São Paulo',
        country: 'Brasil',
        language: 'pt-BR',
        plan: 'VIP Anual',
        role: 'Master',
        status: 'Ativo',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        lastLoginIp: '189.120.45.10',
        device: 'MacBook Pro',
        os: 'macOS',
        browser: 'Chrome',
        daysRemaining: 365,
        revenueGenerated: 0,
        totalPaid: 0,
        lastPaymentDate: '',
        bankroll: 0,
        bankrollCurrency: 'R$',
        roiIndividual: 0
      }
    ];
    _cache.initialized = true;
  }
}

// Initialize on first import
let _initPromise: Promise<void> | null = null;
function ensureInit(): Promise<void> {
  if (_cache.initialized) return Promise.resolve();
  if (!_initPromise) {
    _initPromise = syncFromSupabase();
  }
  return _initPromise;
}

// Auto-init when module loads on client
if (typeof window !== 'undefined') {
  ensureInit().then(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('oddvault_db_update'));
    }
  });
}

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('oddvault_db_update'));
  }
}

// =============================================
// DB API — Hybrid sync (cache) + async (Supabase write-through)
// All getters are SYNC reading from cache.
// All setters write to Supabase AND update cache, then emit event.
// =============================================

export const db = {
  // --- Sync Init Check ---
  isReady: () => _cache.initialized,
  waitForInit: () => ensureInit(),
  refresh: async () => {
    await syncFromSupabase();
    emitUpdate();
  },

  // --- Users ---
  getUsers: (): DBUser[] => {
    if (isBrowserClientSession() && !isBrowserAdminSession()) {
      const activeId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_USER_KEY) : null;
      if (!activeId) return [];
      return _cache.users.filter((u) => u.id === activeId);
    }
    return _cache.users;
  },

  setUsers: (users: DBUser[]): void => {
    // Sort so that non-admin normal users are preferred first for simulation fallback if key is empty
    let sorted = [...users].sort((a, b) => {
      if (a.role === 'Master' && b.role !== 'Master') return 1;
      if (b.role === 'Master' && a.role !== 'Master') return -1;
      return 0;
    });
    // Cliente só pode persistir a própria conta
    if (isBrowserClientSession() && !isBrowserAdminSession()) {
      const activeId = localStorage.getItem(ACTIVE_USER_KEY);
      sorted = activeId ? sorted.filter((u) => u.id === activeId) : sorted.slice(0, 1);
    }
    persistPrivateUserCache(sorted);
    // Write-through async (fire-and-forget)
    if (isSupabaseConfigured) {
      for (const user of sorted) {
        const row = { id: user.id, created_at: user.createdAt || undefined, ...mapUserToRow(user) };
        supabase
          .from('users')
          .upsert(row, { onConflict: 'id' })
          .then(({ error }) => {
            if (error) console.error('users upsert error:', error.message, user.email);
          });
      }
    }
    emitUpdate();
  },

  /** Remove usuário de verdade no Supabase (não só do cache). */
  deleteUser: async (userId: string): Promise<void> => {
    const target = _cache.users.find((u) => u.id === userId);
    _cache.users = _cache.users.filter((u) => u.id !== userId);
    if (typeof window !== 'undefined') {
      if (isBrowserAdminSession()) {
        localStorage.setItem('mktips_mock_users', JSON.stringify(_cache.users));
      } else {
        persistPrivateUserCache(_cache.users);
      }
      if (localStorage.getItem(ACTIVE_USER_KEY) === userId) {
        localStorage.removeItem(ACTIVE_USER_KEY);
      }
    }
    if (isSupabaseConfigured) {
      if (target?.email) {
        await supabase.from('user_credentials').delete().eq('email', target.email.toLowerCase());
      }
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) console.error('users delete error:', error.message);
    }
    emitUpdate();
  },

  getActiveUser: (): DBUser => {
    const empty: DBUser = {
      id: '',
      name: '',
      email: '',
      phone: '',
      city: '',
      country: '',
      language: 'pt-BR',
      plan: 'Free',
      role: 'User',
      status: 'Ativo',
      createdAt: '',
      lastLogin: '',
      lastLoginIp: '',
      device: '',
      os: '',
      browser: '',
      daysRemaining: 0,
      revenueGenerated: 0,
      totalPaid: 0,
      lastPaymentDate: '',
      bankroll: 0,
      bankrollCurrency: 'R$',
      roiIndividual: 0,
    };
    if (typeof window === 'undefined') return empty;

    const adminSession = localStorage.getItem('oddvault_admin_session') === 'true';
    const activeId = localStorage.getItem(ACTIVE_USER_KEY);

    if (activeId) {
      const found = _cache.users.find((u) => u.id === activeId);
      if (found) {
        const isStaff = ['Master', 'Admin', 'Gerente', 'Suporte', 'Financeiro', 'Moderador'].includes(
          found.role,
        );
        // Staff identity only when admin session is active
        if (isStaff && !adminSession) {
          localStorage.removeItem(ACTIVE_USER_KEY);
        } else if (!isStaff || adminSession) {
          return found;
        }
      }
    }

    // Sem fallback para “primeiro usuário da lista” — isso vazava dados de terceiros
    return empty;
  },

  clearActiveUser: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
    emitUpdate();
  },

  setUserPassword: (email: string, _password?: string): void => {
    if (typeof window === 'undefined') return;
    // Nunca persistir senha em claro no browser — só marca que a conta tem credencial server-side
    const key = 'mktips_user_credentials';
    const raw = localStorage.getItem(key);
    const map = raw ? JSON.parse(raw) : {};
    map[email.trim().toLowerCase()] = { hashed: true, at: Date.now() };
    localStorage.setItem(key, JSON.stringify(map));
  },

  loginWithCredentials: (
    email: string,
    _password: string,
  ): { ok: boolean; user?: DBUser; error?: string } => {
    // Login local desativado por segurança — use loginWithCredentialsAsync (API)
    return { ok: false, error: 'Faça login pela API do servidor.' };
  },

  loginWithCredentialsAsync: async (
    email: string,
    password: string,
  ): Promise<{ ok: boolean; user?: DBUser; error?: string }> => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.user) {
        const user = mapUserFromRow(data.user);
        persistPrivateUserCache([user]);
        if (typeof window !== 'undefined') {
          db.setUserPassword(user.email);
          // limpa senhas legadas em claro
          try {
            const raw = localStorage.getItem('mktips_user_credentials');
            if (raw && typeof JSON.parse(raw)[email.trim().toLowerCase()] === 'string') {
              db.setUserPassword(user.email);
            }
          } catch {
            /* ignore */
          }
        }
        emitUpdate();
        return { ok: true, user };
      }
      return { ok: false, error: data.error || 'E-mail ou senha incorretos.' };
    } catch {
      return { ok: false, error: 'Falha de conexão no login.' };
    }
  },

  isFreeTrialExpired: (user: DBUser): boolean => {
    if (user.plan !== 'Free') return false;
    if (user.daysRemaining <= 0) return true;
    if (!user.createdAt) return user.daysRemaining <= 0;
    const start = new Date(user.createdAt).getTime();
    if (Number.isNaN(start)) return user.daysRemaining <= 0;
    const msLeft = start + 7 * 24 * 60 * 60 * 1000 - Date.now();
    return msLeft <= 0;
  },

  getFreeTrialDaysLeft: (user: DBUser): number => {
    if (user.plan !== 'Free') return user.daysRemaining;
    if (!user.createdAt) return Math.max(0, user.daysRemaining);
    const start = new Date(user.createdAt).getTime();
    if (Number.isNaN(start)) return Math.max(0, user.daysRemaining);
    const days = Math.ceil((start + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000));
    return Math.max(0, days);
  },

  blockExpiredFreeUser: (userId: string): void => {
    const updated = _cache.users.map((u) =>
      u.id === userId && u.plan === 'Free'
        ? { ...u, status: 'Bloqueado' as const, daysRemaining: 0 }
        : u,
    );
    db.setUsers(updated);
  },

  createFreeTrialUser: async (payload: {
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
    password: string;
    referrerCode?: string | null;
  }): Promise<DBUser> => {
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone || '',
        cpf: payload.cpf || '',
        password: payload.password,
        plan: 'Free',
        referrerCode: payload.referrerCode || getPendingReferralCode(),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok || !data.user) {
      throw new Error(data.error || 'Falha ao criar conta no banco.');
    }

    const newUser = mapUserFromRow(data.user);
    const withoutDup = _cache.users.filter(
      (u) => u.email.toLowerCase() !== newUser.email.toLowerCase() && u.id !== newUser.id,
    );
    _cache.users = [...withoutDup, newUser];
    if (typeof window !== 'undefined') {
      localStorage.setItem('mktips_mock_users', JSON.stringify(_cache.users));
    }
    db.setUserPassword(newUser.email);
    emitUpdate();
    return newUser;
  },

  setActiveUser: (id: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_USER_KEY, id);
    }
    emitUpdate();
  },

  // --- Tipsters ---
  getTipsters: (): DBTipster[] => _cache.tipsters,

  setTipsters: (tipsters: DBTipster[]): void => {
    _cache.tipsters = tipsters;
    if (isSupabaseConfigured) {
      for (const t of tipsters) {
        supabase.from('tipsters').upsert({
          id: t.id, name: t.name, avatar: t.avatar, specialty: t.specialty,
          sports: t.sports, markets: t.markets, bio: t.bio, socials: t.socials,
          status: t.status, verified: t.verified, badge: t.badge, color: t.color, stats: t.stats,
        }, { onConflict: 'id' }).then();
      }
    }
    emitUpdate();
  },

  // --- Tips ---
  getTips: (): DBTip[] => _cache.tips,

  setTips: (tips: DBTip[]): void => {
    _cache.tips = tips;
    if (isSupabaseConfigured) {
      for (const tip of tips) {
        supabase.from('tips').upsert({ id: tip.id, ...mapTipToRow(tip) }, { onConflict: 'id' }).then();
      }
    }
    emitUpdate();
  },

  deleteTip: async (tipId: string): Promise<void> => {
    _cache.tips = _cache.tips.filter(t => t.id !== tipId);
    if (isSupabaseConfigured) {
      await supabase.from('tips').delete().eq('id', tipId);
    }
    emitUpdate();
  },

  // --- Logs ---
  getLogs: (): DBLog[] => _cache.logs,

  setLogs: (logs: DBLog[]): void => {
    _cache.logs = logs;
    emitUpdate();
  },

  addLog: (type: DBLog['type'], message: string, ip = '127.0.0.1', device = 'Web App', user = 'System'): void => {
    const newLog: DBLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type, message, ip, device, user,
    };
    _cache.logs = [newLog, ..._cache.logs];
    // Write-through
    if (isSupabaseConfigured) {
      supabase.from('logs').insert({ type, message, ip, device, user }).then();
    }
    emitUpdate();
  },

  // --- Bookmakers ---
  getBookmakers: (): any[] => _cache.bookmakers || [],
  setBookmakers: (books: any[]): void => {
    _cache.bookmakers = books;
    emitUpdate();
  },

  // --- Audit Logs ---
  getAuditLogs: (): DBAuditLog[] => _cache.auditLogs,

  setAuditLogs: (logs: DBAuditLog[]): void => {
    _cache.auditLogs = logs;
    emitUpdate();
  },

  addAuditLog: (author: string, operation: string, target: string, oldValue: string, newValue: string): void => {
    const newLog: DBAuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author, operation, target, oldValue, newValue,
      ip: '127.0.0.1',
      session: 'sess_' + Math.floor(Math.random() * 100000),
    };
    _cache.auditLogs = [newLog, ..._cache.auditLogs];
    if (isSupabaseConfigured) {
      supabase.from('audit_logs').insert({
        author, operation, target, old_value: oldValue, new_value: newValue,
        ip: '127.0.0.1', session: newLog.session,
      }).then();
    }
    emitUpdate();
  },

  clearAllLogs: async (): Promise<void> => {
    _cache.logs = [];
    _cache.auditLogs = [];
    if (isSupabaseConfigured) {
      try {
        await Promise.all([
          supabase.from('logs').delete().neq('id', ''),
          supabase.from('audit_logs').delete().neq('id', '')
        ]);
      } catch (e) {
        console.error('Erro ao limpar logs no Supabase:', e);
      }
    }
    emitUpdate();
  },

  // --- Tickets ---
  getTickets: (): DBTicket[] => _cache.tickets,

  setTickets: (tickets: DBTicket[]): void => {
    _cache.tickets = tickets;
    if (isSupabaseConfigured) {
      for (const t of tickets) {
        supabase.from('tickets').upsert({
          id: t.id, subject: t.subject, category: t.category, status: t.status, messages: t.messages,
        }, { onConflict: 'id' }).then();
      }
    }
    emitUpdate();
  },

  addTicket: (input: {
    subject: string;
    description: string;
    category?: string;
    userName?: string;
    userEmail?: string;
  }): DBTicket => {
    const sender =
      input.userName && input.userEmail
        ? `${input.userName} <${input.userEmail}>`
        : input.userName || input.userEmail || 'Cliente';
    const ticket: DBTicket = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `ticket-${Date.now()}`,
      subject: input.subject.trim(),
      category: input.category || input.userEmail || 'Suporte',
      status: 'Aberto',
      createdAt: new Date().toISOString(),
      messages: [
        {
          sender,
          text: input.description.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
    };
    const next = [ticket, ..._cache.tickets];
    db.setTickets(next);
    return ticket;
  },

  replyTicket: (ticketId: string, text: string, sender = 'Suporte MK Tips'): DBTicket | null => {
    const tickets = _cache.tickets.map((t) => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        status: 'Respondido' as const,
        messages: [
          ...t.messages,
          { sender, text: text.trim(), timestamp: new Date().toISOString() },
        ],
      };
    });
    const updated = tickets.find((t) => t.id === ticketId) || null;
    if (updated) db.setTickets(tickets);
    return updated;
  },

  updateTicketStatus: (ticketId: string, status: DBTicket['status']): void => {
    const tickets = _cache.tickets.map((t) => (t.id === ticketId ? { ...t, status } : t));
    db.setTickets(tickets);
  },

  // --- Favorites (por usuário — não compartilha entre contas no mesmo browser) ---
  getFavorites: (userId?: string): string[] => {
    if (typeof window === 'undefined') return [];
    const uid = userId || localStorage.getItem(ACTIVE_USER_KEY) || '';
    if (!uid) return [];
    const keyed = localStorage.getItem(`mktips_favorites_${uid}`);
    if (keyed) {
      try {
        return JSON.parse(keyed);
      } catch {
        return [];
      }
    }
    // Migração one-shot da chave antiga global
    const legacy = localStorage.getItem('mktips_favorites');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        localStorage.setItem(`mktips_favorites_${uid}`, legacy);
        localStorage.removeItem('mktips_favorites');
        return parsed;
      } catch {
        return [];
      }
    }
    return [];
  },
  setFavorites: (favorites: string[], userId?: string): void => {
    if (typeof window !== 'undefined') {
      const uid = userId || localStorage.getItem(ACTIVE_USER_KEY) || '';
      if (uid) {
        localStorage.setItem(`mktips_favorites_${uid}`, JSON.stringify(favorites));
      }
    }
    emitUpdate();
  },

  /** Tips que o cliente acompanhou (favoritou). Sem favoritos = desempenho zerado. */
  getFollowedTips: (userId?: string): DBTip[] => {
    const favs = new Set(db.getFavorites(userId));
    if (favs.size === 0) return [];
    return _cache.tips.filter((t) => favs.has(t.id));
  },

  // --- Bankroll Logs ---
  getBankrollLogs: (): { date: string; value: number }[] => _cache.bankrollLogs,
  setBankrollLogs: (logs: { date: string; value: number }[]): void => {
    _cache.bankrollLogs = logs;
    emitUpdate();
  },

  // --- Referrals ---
  getReferrals: (userId?: string): any[] => {
    if (!userId) return _cache.referrals
    return _cache.referrals.filter(
      (r: any) => r.referrer_id === userId || r.referrerId === userId,
    )
  },
  setReferrals: (list: any[]): void => {
    _cache.referrals = list
    emitUpdate()
  },
  getReferralCode: (userId: string): string => getUserReferralCode(userId),
  getReferralLink: (userId: string): string => buildReferralLink(userId),
  addReferral: (payload: {
    name: string
    plan: string
    status?: string
    referrerId: string
  }): void => {
    const entry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `ref_${Date.now()}`,
      name: payload.name,
      date: new Date().toISOString().slice(0, 10),
      plan: payload.plan,
      status: payload.status || 'Ativo',
      referrer_id: payload.referrerId,
      referrerId: payload.referrerId,
      created_at: new Date().toISOString(),
    }
    _cache.referrals = [entry, ..._cache.referrals]
    emitUpdate()
    if (isSupabaseConfigured) {
      supabase.from('referrals').insert({
        id: entry.id,
        name: entry.name,
        date: entry.date,
        plan: entry.plan,
        status: entry.status,
        referrer_id: entry.referrer_id,
      }).then()
    }
  },
  attributePendingReferral: (newUser: { id: string; name: string; plan: string }): boolean => {
    if (typeof window === 'undefined') return false

    // Prefer ?ref= in URL, then stored code
    captureReferralCodeFromUrl()
    const code = getPendingReferralCode()
    if (!code) return false

    const referrerId = findUserIdByReferralCode(_cache.users, code)
    if (!referrerId || referrerId === newUser.id) {
      return false
    }

    const already = _cache.referrals.some(
      (r: any) =>
        (r.referrer_id === referrerId || r.referrerId === referrerId) &&
        (r.name === newUser.name || r.referred_user_id === newUser.id),
    )
    if (!already) {
      db.addReferral({
        name: newUser.name,
        plan: newUser.plan,
        status: 'Ativo',
        referrerId,
      })
    }
    clearPendingReferralCode()
    return true
  },

  // --- Challenges (localStorage) ---
  getPurchasedChallenges: (): string[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mktips_purchased_challenges');
    return stored ? JSON.parse(stored) : [];
  },
  setPurchasedChallenges: (list: string[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mktips_purchased_challenges', JSON.stringify(list));
    emitUpdate();
  },

  getChallengeStages: (): any[] => _cache.challengeStages,
  setChallengeStages: (stages: any[]): void => {
    _cache.challengeStages = stages;
    emitUpdate();
  },

  // --- Leverage ---
  getFreeLeverageUsedCount: (): number => {
    if (typeof window === 'undefined') return 0;
    return Number(localStorage.getItem('mktips_free_leverage_used') || '0');
  },
  setFreeLeverageUsedCount: (val: number): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mktips_free_leverage_used', String(val));
    emitUpdate();
  },

  // --- Vale Tudo Tournaments ---
  getTournaments: (): any[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mktips_tournaments');
    if (!stored) {
      localStorage.setItem('mktips_tournaments', JSON.stringify([]));
      return [];
    }
    return JSON.parse(stored);
  },
  setTournaments: (list: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mktips_tournaments', JSON.stringify(list));
    emitUpdate();
  },

  getTournamentParticipants: (tournamentId?: string): any[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mktips_tournament_participants');
    const list = stored ? JSON.parse(stored) : [];
    if (!stored) {
      localStorage.setItem('mktips_tournament_participants', JSON.stringify([]));
    }
    return tournamentId ? list.filter((p: any) => p.tournamentId === tournamentId) : list;
  },
  setTournamentParticipants: (list: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mktips_tournament_participants', JSON.stringify(list));
    emitUpdate();
  },

  getTournamentPhases: (tournamentId?: string): any[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mktips_tournament_phases');
    const list = stored ? JSON.parse(stored) : [];
    if (!stored) {
      localStorage.setItem('mktips_tournament_phases', JSON.stringify([]));
    }
    return tournamentId ? list.filter((p: any) => p.tournamentId === tournamentId) : list;
  },
  setTournamentPhases: (list: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mktips_tournament_phases', JSON.stringify(list));
    emitUpdate();
  },

  getParticipantPredictions: (): any[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mktips_participant_predictions');
    const list = stored ? JSON.parse(stored) : [];
    return list;
  },
  setParticipantPredictions: (list: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mktips_participant_predictions', JSON.stringify(list));
    emitUpdate();
  },

  // --- Wallet & Transactions ---
  getWallet: (userId: string): any => {
    if (typeof window === 'undefined') return { available: 0, blocked: 0, prize: 0, totalDeposit: 0, totalWithdraw: 0, totalBet: 0 };
    const stored = localStorage.getItem(`mktips_wallet_${userId}`);
    if (!stored) {
      const defaultWallet = {
        userId,
        available: 0.00,
        blocked: 0.00,
        prize: 0.00,
        totalDeposit: 0.00,
        totalWithdraw: 0.00,
        totalBet: 0.00
      };
      localStorage.setItem(`mktips_wallet_${userId}`, JSON.stringify(defaultWallet));
      return defaultWallet;
    }
    return JSON.parse(stored);
  },
  setWallet: (userId: string, wallet: any): void => {
    if (typeof window === 'undefined') return;
    // Anti-tamper: saldo só pode DIMINUIR no client (depósitos vêm do gateway verificado)
    const prev = (() => {
      try {
        const raw = localStorage.getItem(`mktips_wallet_${userId}`);
        return raw ? JSON.parse(raw) : { available: 0, prize: 0, totalDeposit: 0 };
      } catch {
        return { available: 0, prize: 0, totalDeposit: 0 };
      }
    })();
    const safe = {
      ...wallet,
      userId,
      available: Math.min(Number(wallet?.available) || 0, Number(prev.available) || 0),
      prize: Math.min(Number(wallet?.prize) || 0, Number(prev.prize) || 0),
      totalDeposit: Math.min(Number(wallet?.totalDeposit) || 0, Number(prev.totalDeposit) || 0),
    };
    localStorage.setItem(`mktips_wallet_${userId}`, JSON.stringify(safe));
    emitUpdate();
  },

  getWalletTransactions: (userId: string): any[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`mktips_transactions_${userId}`);
    if (!stored) {
      const initialTransactions: any[] = [];
      localStorage.setItem(`mktips_transactions_${userId}`, JSON.stringify(initialTransactions));
      return initialTransactions;
    }
    return JSON.parse(stored);
  },
  setWalletTransactions: (userId: string, list: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`mktips_transactions_${userId}`, JSON.stringify(list));
    emitUpdate();
  },

  getWithdrawalRequests: (): any[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mktips_withdrawals');
    return stored ? JSON.parse(stored) : [];
  },
  setWithdrawalRequests: (list: any[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mktips_withdrawals', JSON.stringify(list));
    emitUpdate();
  },

  getWalletConfig: (): any => {
    if (typeof window === 'undefined') return { minDeposit: 15, maxDeposit: 10000, minWithdraw: 30, withdrawFee: 0, processingTime: '24h' };
    const stored = localStorage.getItem('mktips_wallet_config');
    if (!stored) {
      const defaultConfig = { minDeposit: 15, maxDeposit: 10000, minWithdraw: 30, withdrawFee: 0, processingTime: '24h' };
      localStorage.setItem('mktips_wallet_config', JSON.stringify(defaultConfig));
      return defaultConfig;
    }
    return JSON.parse(stored);
  },
  setWalletConfig: (config: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mktips_wallet_config', JSON.stringify(config));
    emitUpdate();
  },

  // --- IP Blacklist & Security ---
  getBlockedIps: (): string[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mktips_blocked_ips');
    return stored ? JSON.parse(stored) : ['103.245.12.89'];
  },
  setBlockedIps: (ips: string[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mktips_blocked_ips', JSON.stringify(ips));
    emitUpdate();
  },
  blockIp: (ip: string, reason: string): void => {
    if (typeof window === 'undefined') return;
    const blocked = db.getBlockedIps();
    if (!blocked.includes(ip)) {
      const updated = [...blocked, ip];
      localStorage.setItem('mktips_blocked_ips', JSON.stringify(updated));
      db.addLog('Error', `BLOQUEIO AUTOMÁTICO: IP ${ip} bloqueado. Motivo: ${reason}`, ip, 'Firewall Auto', 'System');
      db.addAuditLog('System', 'IP_AUTO_BLOCK', ip, 'Liberado', 'Bloqueado');
      emitUpdate();
    }
  },
  unblockIp: (ip: string): void => {
    if (typeof window === 'undefined') return;
    const blocked = db.getBlockedIps().filter((b) => b !== ip);
    localStorage.setItem('mktips_blocked_ips', JSON.stringify(blocked));
    db.addLog('System', `IP ${ip} removido da blacklist.`, ip, 'Firewall', 'System');
    emitUpdate();
  },
  clearOwnIpBan: (): void => {
    if (typeof window === 'undefined') return;
    const ip = db.getClientIp();
    db.unblockIp(ip);
  },
  getClientIp: (): string => {
    if (typeof window === 'undefined') return '127.0.0.1';
    let ip = localStorage.getItem('mktips_client_ip');
    if (!ip) {
      ip = '127.0.0.1';
      localStorage.setItem('mktips_client_ip', ip);
    }
    return ip;
  },
  setClientIp: (ip: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mktips_client_ip', ip);
    emitUpdate();
  }
};
