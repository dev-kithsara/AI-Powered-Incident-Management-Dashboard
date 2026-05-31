import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle, CheckCircle, Clock, Eye, TrendingUp,
  Activity, ArrowRight, Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'
import { statsApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { severityClass, statusClass, formatDate } from '@/lib/utils'
import type { Stats } from '@/types'

const SEV_COLORS: Record<string, string> = {
  LOW: '#22c55e', MEDIUM: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444',
}

const KpiCard = ({
  title, value, sub, icon: Icon, color,
}: { title: string; value: number; sub?: string; icon: React.ElementType; color: string }) => (
  <Card className="relative overflow-hidden">
    <div className={`absolute inset-0 ${color} opacity-5`} />
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-bold text-foreground mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} bg-opacity-20 border border-current/20`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card-glass px-3 py-2 text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const { data: res, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn:  () => statsApi.get(),
  })

  const stats: Stats | undefined = res?.data.data

  const sevChartData = stats
    ? Object.entries(stats.bySeverity).map(([k, v]) => ({ name: k, value: v, color: SEV_COLORS[k] }))
    : []

  const statusData = stats
    ? [
        { name: 'Open',        value: stats.open,        fill: '#3b82f6' },
        { name: 'In Progress', value: stats.inProgress,  fill: '#a855f7' },
        { name: 'Under Review',value: stats.underReview, fill: '#eab308' },
        { name: 'Closed',      value: stats.closed,      fill: '#22c55e' },
      ]
    : []

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'},{' '}
            <span className="gradient-text">{user?.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here's what's happening in your incident management system.
          </p>
        </div>
        <Link
          to="/incidents/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground btn-glow hover:bg-primary/90 transition-colors"
        >
          <Zap className="h-4 w-4" /> New Incident
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total"       value={stats?.total       ?? 0} icon={Activity}      color="text-blue-400"   sub="All time" />
        <KpiCard title="Open"        value={stats?.open        ?? 0} icon={AlertTriangle}  color="text-red-400"    sub="Needs attention" />
        <KpiCard title="In Progress" value={stats?.inProgress  ?? 0} icon={Clock}         color="text-purple-400" sub="Being handled" />
        <KpiCard title="Closed"      value={stats?.closed      ?? 0} icon={CheckCircle}   color="text-green-400"  sub="Resolved" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Severity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sevChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {sevChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {sevChartData.map(s => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto font-semibold text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={statusData} barSize={36}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map(d => <Cell key={d.name} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Incidents</CardTitle>
            <Link to="/incidents" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {stats?.recentIncidents.map(inc => (
              <Link
                key={inc.id}
                to={`/incidents/${inc.id}`}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent/50 transition-colors group"
              >
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  inc.severity === 'CRITICAL' ? 'bg-red-400' :
                  inc.severity === 'HIGH'     ? 'bg-orange-400' :
                  inc.severity === 'MEDIUM'   ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {inc.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(inc.createdAt)}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 font-medium ${statusClass(inc.status)}`}>
                  {inc.status.replace('_', ' ')}
                </span>
              </Link>
            ))}
            {!stats?.recentIncidents.length && (
              <p className="text-sm text-muted-foreground text-center py-6">No incidents yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top categories */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {stats?.topCategories.map((cat, i) => (
              <div key={cat.category} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-foreground">{cat.category}</span>
                    <span className="text-xs font-semibold text-primary">{cat.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500"
                      style={{ width: `${(cat.count / (stats.total || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {!stats?.topCategories.length && (
              <p className="text-sm text-muted-foreground text-center py-6">No category data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
