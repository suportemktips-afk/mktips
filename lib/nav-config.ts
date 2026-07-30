import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Bookmark,
  History,
  BarChart3,
  Coins,
  TrendingUp,
  Trophy,
  Rocket,
  Sparkles,
  Gift,
  Bell,
  User,
  CreditCard,
  LifeBuoy,
  Settings,
  Calendar as CalendarIcon,
  Users,
  Award,
  Radio,
  Building,
  MessageCircle,
  BarChart3 as TipsterIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type NavGroup = {
  title?: string
  items: NavItem[]
}

export const userNavGroups: NavGroup[] = [
  {
    title: 'Dashboard',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Favoritos', href: '/dashboard/favorites', icon: Bookmark },
      { label: 'Histórico', href: '/dashboard/history', icon: History },
      { label: 'Estatísticas', href: '/dashboard/stats', icon: BarChart3 },
      { label: 'Gestão da Banca', href: '/dashboard/bankroll', icon: Coins },
    ],
  },
  {
    title: 'Tips',
    items: [
      { label: 'Tips do Dia', href: '/dashboard/tips', icon: TrendingUp },
      { label: 'Vale Tudo', href: '/dashboard/valetudo', icon: Trophy },
      { label: 'Alavancagens', href: '/dashboard/leveraging', icon: Rocket },
      { label: 'Central de IA', href: '/dashboard/ai-assistant', icon: Sparkles },
      { label: 'Gamificação', href: '/dashboard/gamification', icon: Trophy },
    ],
  },
  {
    title: 'Conta',
    items: [
      { label: 'Comunidades', href: '/dashboard/referrals', icon: Gift },
      { label: 'Notificações', href: '/dashboard/notifications', icon: Bell },
      { label: 'Minha Conta', href: '/dashboard/account', icon: User },
      { label: 'Assinatura', href: '/dashboard/subscription', icon: CreditCard },
    ],
  },
  {
    title: 'Suporte',
    items: [
      { label: 'Suporte', href: '/dashboard/support', icon: LifeBuoy },
      { label: 'Configurações', href: '/dashboard/account', icon: Settings },
    ],
  },
]

/** Flat list for desktop sidebar — original order preserved */
export const userNavFlat: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tips do Dia', href: '/dashboard/tips', icon: TrendingUp },
  { label: 'Desafios', href: '/dashboard/leveraging', icon: Rocket },
  { label: 'VALE TUDO', href: '/dashboard/valetudo', icon: Trophy },
  { label: 'Minha Carteira', href: '/dashboard/wallet', icon: Coins },
  { label: 'Indique e Ganhe', href: '/dashboard/referrals', icon: Gift },
  { label: 'Central de IA', href: '/dashboard/ai-assistant', icon: Sparkles },
  { label: 'Calendário', href: '/dashboard/calendar', icon: CalendarIcon },
  { label: 'Favoritas', href: '/dashboard/favorites', icon: Bookmark },
  { label: 'Histórico', href: '/dashboard/history', icon: History },
  { label: 'Estatísticas', href: '/dashboard/stats', icon: BarChart3 },
  { label: 'Gestão de Banca', href: '/dashboard/bankroll', icon: Coins },
  { label: 'Gamificação', href: '/dashboard/gamification', icon: Trophy },
  { label: 'Notificações', href: '/dashboard/notifications', icon: Bell },
  { label: 'Minha Conta', href: '/dashboard/account', icon: User },
  { label: 'Assinatura', href: '/dashboard/subscription', icon: CreditCard },
  { label: 'Suporte', href: '/dashboard/support', icon: LifeBuoy },
]

export const adminNavFlat: NavItem[] = [
  { label: 'Dashboard', href: '/mktipsadmin/dashboard', icon: LayoutDashboard },
  { label: 'CRM & Funis', href: '/mktipsadmin/dashboard/crm', icon: TrendingUp },
  { label: 'WhatsApp CRM', href: '/mktipsadmin/dashboard/crm/whatsapp', icon: MessageCircle },
  { label: 'Usuários', href: '/mktipsadmin/dashboard/users', icon: Users },
  { label: 'Tickets Suporte', href: '/mktipsadmin/dashboard/support', icon: LifeBuoy },
  { label: 'Notificações', href: '/mktipsadmin/dashboard/notifications', icon: Bell },
  { label: 'Tipsters', href: '/mktipsadmin/dashboard/tipsters', icon: Award },
  { label: 'Tips Control', href: '/mktipsadmin/dashboard/tips', icon: Radio },
  { label: 'Casas de Apostas', href: '/mktipsadmin/dashboard/bookmakers', icon: Building },
  { label: 'Alavancagem', href: '/mktipsadmin/dashboard/leveraging', icon: Rocket },
  { label: 'VALE TUDO', href: '/mktipsadmin/dashboard/valetudo', icon: Trophy },
  { label: 'Carteiras & Saques', href: '/mktipsadmin/dashboard/wallet', icon: Coins },
  { label: 'Indique e Ganhe', href: '/mktipsadmin/dashboard/referrals', icon: Gift },
  { label: 'Painel de IA', href: '/mktipsadmin/dashboard/ai-panel', icon: Sparkles },
  { label: 'Segurança & Configs', href: '/mktipsadmin/dashboard/settings', icon: Settings },
]

export const adminNavGroups: NavGroup[] = [
  { title: 'Admin', items: adminNavFlat.slice(0, 5) },
  { title: 'Operações', items: adminNavFlat.slice(5, 11) },
  { title: 'Sistema', items: adminNavFlat.slice(11) },
]

export const tipsterNavFlat: NavItem[] = [
  { label: 'Painel Geral', href: '/tipster/dashboard', icon: TipsterIcon },
]

export function isNavActive(pathname: string, href: string) {
  if (href === '/dashboard' || href === '/mktipsadmin/dashboard' || href === '/tipster/dashboard') {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}
