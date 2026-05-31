import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, AlertTriangle, Plus, Brain,
  Users, LogOut, Settings, ChevronRight, Activity,
  ShieldAlert,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'

interface NavItem { to: string; icon: React.ElementType; label: string; adminOnly?: boolean }

const navItems: NavItem[] = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/incidents',      icon: AlertTriangle,   label: 'Incidents' },
  { to: '/incidents/new',  icon: Plus,            label: 'New Incident' },
  { to: '/ai-dashboard',   icon: Brain,           label: 'AI Analytics' },
  { to: '/users',          icon: Users,           label: 'Users', adminOnly: true },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const navigate          = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-border/50 bg-card/40 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
            <ShieldAlert className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">IMS</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">AI Incident Platform</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, adminOnly }) => {
            if (adminOnly && user?.role === 'staff') return null
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/15 text-primary border border-primary/25'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
              </NavLink>
            )
          })}
        </nav>

        {/* User card */}
        <div className="px-3 pb-4 space-y-1 border-t border-border/50 pt-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs text-muted-foreground">System Online</span>
            <Activity className="h-3 w-3 text-muted-foreground ml-auto" />
          </div>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all',
                isActive ? 'bg-accent' : 'hover:bg-accent'
              )
            }
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-8 animate-fade-in">
          {children}
        </div>
      </main>

      <Toaster />
    </div>
  )
}
