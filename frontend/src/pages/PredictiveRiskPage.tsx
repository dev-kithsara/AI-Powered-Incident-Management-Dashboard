import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  TrendingUp, AlertTriangle, Building2, Tag,
  Loader2, Flame, ShieldAlert, Activity, Zap,
  ChevronRight, BarChart3, Search, Award, FileText,
  BookOpen,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
} from 'recharts'
import { aiApi, incidentsApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { RiskAnalysis, AtRiskIncident } from '@/types'

// ── Colour helpers ────────────────────────────────────────────────────────
const SEV_COLOR: Record<string, string> = {
  LOW: '#22c55e', MEDIUM: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444',
}

const RISK_GRADIENT = (score: number) => {
  if (score >= 80) return 'from-red-500 to-red-600'
  if (score >= 60) return 'from-orange-500 to-orange-600'
  if (score >= 40) return 'from-yellow-500 to-yellow-600'
  return 'from-green-500 to-green-600'
}

const RISK_TEXT = (score: number) => {
  if (score >= 80) return 'text-red-400'
  if (score >= 60) return 'text-orange-400'
  if (score >= 40) return 'text-yellow-400'
  return 'text-green-400'
}

const riskLabel = (score: number) => {
  if (score >= 80) return 'CRITICAL'
  if (score >= 60) return 'HIGH'
  if (score >= 40) return 'MEDIUM'
  return 'LOW'
}

// ── Sub-components ────────────────────────────────────────────────────────

/** Animated gauge for a 0-100 risk score */
const RiskGauge = ({ score, size = 140 }: { score: number; size?: number }) => {
  const data = [{ name: 'risk', value: score }, { name: 'rest', value: 100 - score }]
  const colors = score >= 80 ? ['#ef4444', '#1e1e2e']
                : score >= 60 ? ['#f97316', '#1e1e2e']
                : score >= 40 ? ['#eab308', '#1e1e2e']
                : ['#22c55e', '#1e1e2e']
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx={size / 2 - 4}
          cy={size / 2 - 4}
          innerRadius={size * 0.32}
          outerRadius={size * 0.46}
          startAngle={225}
          endAngle={-45}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black ${RISK_TEXT(score)}`}>{Math.round(score)}</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">/100</span>
      </div>
    </div>
  )
}

/** Severity badge */
const SevBadge = ({ sev }: { sev: string }) => {
  const col: Record<string, string> = {
    LOW: 'bg-green-500/15 text-green-400 border-green-500/30',
    MEDIUM: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    HIGH: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/30',
  }
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide ${col[sev] ?? col.MEDIUM}`}>
      {sev}
    </span>
  )
}

/** Inline risk score bar */
const RiskBar = ({ score }: { score: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${RISK_GRADIENT(score)} transition-all duration-700`}
        style={{ width: `${score}%` }}
      />
    </div>
    <span className={`text-xs font-bold tabular-nums ${RISK_TEXT(score)}`}>{score}</span>
  </div>
)

/** Custom tooltip for line chart */
const TrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function PredictiveRiskPage() {
  // State for live predictor
  const [predTitle, setPredTitle]   = useState('')
  const [predDesc,  setPredDesc]    = useState('')
  const [predCat,   setPredCat]     = useState('')
  const [predDept,  setPredDept]    = useState('')
  const [predResult, setPredResult] = useState<{
    risk_score: number; risk_label: string; confidence: number; contributing_factors: string[]
  } | null>(null)

  // Fetch aggregated risk analysis data
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['risk-analysis'],
    queryFn:  () => aiApi.riskAnalysis(),
    staleTime: 60_000,
  })

  const data: RiskAnalysis | undefined = rawData?.data as RiskAnalysis | undefined

  // Live predictor mutation
  const predictMutation = useMutation({
    mutationFn: () => aiApi.predictRisk({
      title: predTitle, description: predDesc,
      category: predCat || undefined, department: predDept || undefined,
    }),
    onSuccess: (res) => setPredResult(res.data as any),
  })

  const [selectedCell, setSelectedCell] = useState<{
    department: string
    controlType: string
    averageRating: number
    totalControls: number
    incidents: any[]
  } | null>(null)

  const { data: heatmapRaw, isLoading: isHeatmapLoading } = useQuery({
    queryKey: ['control-effectiveness'],
    queryFn: () => incidentsApi.getControlEffectiveness(),
    staleTime: 60_000,
  })

  const heatmapData = heatmapRaw?.data?.data ?? []

  // Format monthly trend for recharts
  const trendData = useMemo(() => {
    return (data?.monthly_trend ?? []).map(p => ({
      ...p,
      month: p.month.slice(5), // "2024-06" → "06"
    }))
  }, [data])

  // Severity dist for summary pie
  const summaryPie = useMemo(() => {
    if (!data?.summary) return []
    const s = data.summary
    return [
      { name: 'Critical', value: s.critical_count, fill: '#ef4444' },
      { name: 'High',     value: s.high_count,     fill: '#f97316' },
      { name: 'Medium',   value: s.medium_count,   fill: '#eab308' },
      { name: 'Low',      value: s.low_count,      fill: '#22c55e' },
    ].filter(d => d.value > 0)
  }, [data])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading risk analysis...</p>
        </div>
      </div>
    )
  }

  const s = data?.summary

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" /> Predictive Risk Analysis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Historical pattern analysis · Department &amp; category risk scoring · Live AI predictor
        </p>
      </div>

      {/* ── Summary KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Avg Risk Score',
            value: s?.avg_risk_score?.toFixed(1) ?? '—',
            icon: Activity,
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
          {
            label: 'Open Incidents',
            value: s?.open_incidents ?? '—',
            icon: AlertTriangle,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
          },
          {
            label: 'Critical Incidents',
            value: s?.critical_count ?? '—',
            icon: Flame,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
          },
          {
            label: 'Total Incidents',
            value: s?.total_incidents ?? '—',
            icon: ShieldAlert,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className={`absolute inset-0 ${bg} opacity-50`} />
            <CardContent className="pt-5 pb-4 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                  <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
                </div>
                <div className={`rounded-xl p-2 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Row: Trend Chart + Severity Pie ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" /> Monthly Incident Risk Trend
            </CardTitle>
            <CardDescription>Incident counts by severity over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2">
                <Activity className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No trend data yet — create some incidents first.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<TrendTooltip />} />
                  <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                  <Line type="monotone" dataKey="CRITICAL" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="HIGH"     stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="MEDIUM"   stroke="#eab308" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="LOW"      stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Severity Split
            </CardTitle>
            <CardDescription>All incidents by severity</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {summaryPie.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No data</p>
              </div>
            ) : (
              <>
                <PieChart width={180} height={180}>
                  <Pie
                    data={summaryPie}
                    cx={86} cy={86}
                    innerRadius={52} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {summaryPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
                <div className="w-full space-y-1.5">
                  {summaryPie.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row: Department Risk + Category Breakdown ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Department Risk Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" /> Department Risk Scores
            </CardTitle>
            <CardDescription>Average predicted risk score per department (higher = more dangerous)</CardDescription>
          </CardHeader>
          <CardContent>
            {!data?.department_risk?.length ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2">
                <Building2 className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No department data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  layout="vertical"
                  data={data.department_risk}
                  margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="department"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
                          <p className="font-semibold text-foreground">{d.department}</p>
                          <p className="text-muted-foreground">Avg Risk: <span className={`font-bold ${RISK_TEXT(d.avg_risk_score)}`}>{d.avg_risk_score}</span></p>
                          <p className="text-muted-foreground">Total: {d.total_incidents} incidents</p>
                          <p className="text-muted-foreground">Critical: {d.critical_count}</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="avg_risk_score" radius={[0, 4, 4, 0]}>
                    {data.department_risk.map((d, i) => (
                      <Cell key={i} fill={d.avg_risk_score >= 80 ? '#ef4444' : d.avg_risk_score >= 60 ? '#f97316' : d.avg_risk_score >= 40 ? '#eab308' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Control Effectiveness Heatmap */}
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" /> Control Effectiveness Heatmap
            </CardTitle>
            <CardDescription>Average review rating per Department vs Control Type (1-5, higher = stronger)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isHeatmapLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : heatmapData.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No control data available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 text-[10px] text-muted-foreground uppercase tracking-wider">
                      <th className="py-2 px-1">Department</th>
                      <th className="py-2 px-1 text-center">Preventive</th>
                      <th className="py-2 px-1 text-center">Detective</th>
                      <th className="py-2 px-1 text-center">Corrective</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['IT', 'HR', 'Finance', 'Operations', 'Facilities', 'Security'].map(dept => (
                      <tr key={dept} className="border-b border-border/10 hover:bg-accent/10 transition-colors">
                        <td className="py-2 px-1 font-semibold text-foreground">{dept}</td>
                        {['Preventive', 'Detective', 'Corrective'].map(type => {
                          const cell = heatmapData.find((d: any) => d.department === dept && d.controlType === type)
                          const avg = cell?.averageRating ?? 0
                          const total = cell?.totalControls ?? 0

                          let colorClasses = "bg-muted/5 text-muted-foreground/30 border-border/10"
                          let label = "—"
                          if (total > 0) {
                            label = avg > 0 ? avg.toFixed(1) : "Unrated"
                            if (avg === 0) {
                              colorClasses = "bg-muted/10 text-muted-foreground/60 border-border/15 cursor-pointer hover:bg-muted/20"
                            } else if (avg <= 2.5) {
                              colorClasses = "bg-red-500/15 text-red-400 border-red-500/20 font-bold hover:bg-red-500/25 cursor-pointer"
                            } else if (avg <= 3.7) {
                              colorClasses = "bg-yellow-500/10 text-yellow-400 border-yellow-500/15 font-bold hover:bg-yellow-500/20 cursor-pointer"
                            } else {
                              colorClasses = "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 font-bold hover:bg-emerald-500/25 cursor-pointer"
                            }
                          }

                          return (
                            <td key={type} className="py-1 px-1">
                              <div
                                onClick={() => total > 0 && setSelectedCell({
                                  department: dept,
                                  controlType: type,
                                  averageRating: avg,
                                  totalControls: total,
                                  incidents: cell?.incidents ?? []
                                })}
                                className={`flex flex-col items-center justify-center rounded border p-1 text-center transition-all ${colorClasses}`}
                                style={{ minHeight: '42px' }}
                              >
                                <span className="text-xs font-bold leading-none">{label}</span>
                                <span className="text-[8px] opacity-75 mt-0.5 leading-none">{total} Ctrl{total !== 1 ? 's' : ''}</span>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Drill-down detail card for selected Heatmap cell ─────────── */}
      {selectedCell && (
        <Card className="bg-card/40 border-primary/20 backdrop-blur-md animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-lg pointer-events-none" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Control Details: {selectedCell.department} Department · {selectedCell.controlType} Controls
              </CardTitle>
              <CardDescription>
                Avg Effectiveness: <span className="font-bold text-foreground">{selectedCell.averageRating > 0 ? `${selectedCell.averageRating}/5` : 'Unrated'}</span> ({selectedCell.totalControls} registered controls)
              </CardDescription>
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-xs text-muted-foreground hover:text-foreground border border-border/50 rounded px-2 py-0.5"
            >
              Clear selection
            </button>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vulnerability Rating Card */}
              <div className={`p-4 rounded-xl border flex flex-col justify-center ${
                selectedCell.averageRating === 0 ? 'bg-muted/5 border-border/30 text-muted-foreground' :
                selectedCell.averageRating <= 2.5 ? 'bg-red-500/5 border-red-500/20 text-red-300' :
                selectedCell.averageRating <= 3.7 ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-300' :
                'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
              }`}>
                <div className="flex items-center gap-2 mb-2 font-semibold">
                  <Award className="h-4.5 w-4.5" />
                  <span className="text-xs uppercase tracking-wider">Effectiveness Diagnosis</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {selectedCell.averageRating === 0 ? 'These controls have not yet been evaluated during incident reviews.' :
                   selectedCell.averageRating <= 2.5 ? '⚠️ Critical Vulnerability detected. The average review rating is low, suggesting controls are failing or bypassed. Immediate remediation of preventive measures is required.' :
                   selectedCell.averageRating <= 3.7 ? 'Moderate effectiveness. The controls offer partial protection but have gaps. Review implementation checklists for improvement.' :
                   '✅ Excellent control strength. Average rating is high, meaning controls successfully mitigate risks and prevent recurrence in this department.'
                  }
                </p>
              </div>

              {/* Incidents List */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Related Incidents
                </p>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                  {selectedCell.incidents.map((inc: any) => (
                    <Link key={inc.id} to={`/incidents/${inc.id}`} className="block">
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/40 border border-transparent hover:border-border/30 transition-all cursor-pointer">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate">{inc.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-mono text-muted-foreground">#{inc.id}</span>
                            <span className="text-[9px] text-muted-foreground">Rating: {inc.rating}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Row: Category Breakdown + Top At-Risk Incidents ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-4 w-4 text-primary" /> Category Risk Breakdown
            </CardTitle>
            <CardDescription>Top incident categories ranked by average risk score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!data?.category_breakdown?.length ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2">
                <Tag className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No category data yet</p>
              </div>
            ) : (
              data.category_breakdown.map((cat, i) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono">#{i + 1}</span>
                      <span className="font-medium text-foreground truncate max-w-[130px]">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{cat.total} incidents</span>
                      <span className={`font-bold tabular-nums ${RISK_TEXT(cat.avg_risk_score)}`}>{cat.avg_risk_score}</span>
                    </div>
                  </div>
                  <RiskBar score={cat.avg_risk_score} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top At-Risk Open Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-red-400" /> Top At-Risk Open Incidents
            </CardTitle>
            <CardDescription>Open incidents ranked by predicted risk score — highest first</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!data?.top_at_risk?.length ? (
              <div className="h-48 flex flex-col items-center justify-center gap-2">
                <ShieldAlert className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No open incidents found</p>
              </div>
            ) : (
              data.top_at_risk.map((inc: AtRiskIncident, i) => (
                <Link key={inc.id} to={`/incidents/${inc.id}`} className="block">
                  <div className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                    {/* Rank */}
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-border text-[10px] font-bold text-muted-foreground">
                      {i + 1}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{inc.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <SevBadge sev={inc.severity} />
                        {inc.department && (
                          <span className="text-[10px] text-muted-foreground truncate">{inc.department}</span>
                        )}
                      </div>
                    </div>
                    {/* Score */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className={`text-sm font-black tabular-nums ${RISK_TEXT(inc.risk_score)}`}>
                        {inc.risk_score}
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground/40 mt-0.5 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row: Live Predictor Sandbox (Full Width) ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4 text-primary" /> Live Risk Predictor
            </CardTitle>
            <CardDescription>Describe a hypothetical incident and get an instant AI risk score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <input
                id="pred-title"
                value={predTitle}
                onChange={e => setPredTitle(e.target.value)}
                placeholder="Incident title…"
                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition"
              />
              <textarea
                id="pred-desc"
                value={predDesc}
                onChange={e => setPredDesc(e.target.value)}
                placeholder="Describe the incident in detail…"
                rows={3}
                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="pred-cat"
                  value={predCat}
                  onChange={e => setPredCat(e.target.value)}
                  placeholder="Category (optional)"
                  className="text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition"
                />
                <input
                  id="pred-dept"
                  value={predDept}
                  onChange={e => setPredDept(e.target.value)}
                  placeholder="Department (optional)"
                  className="text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition"
                />
              </div>
            </div>

            <button
              id="predict-risk-btn"
              onClick={() => predictMutation.mutate()}
              disabled={!predTitle.trim() || !predDesc.trim() || predDesc.length < 10 || predictMutation.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {predictMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</>
              ) : (
                <><Zap className="h-4 w-4" /> Predict Risk</>
              )}
            </button>

            {/* Result */}
            {predResult && (
              <div className="mt-2 rounded-xl border border-border bg-background/60 p-4 animate-fade-in">
                <div className="flex items-center gap-4">
                  <RiskGauge score={predResult.risk_score} size={110} />
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Predicted Level</p>
                      <SevBadge sev={predResult.risk_label} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence</p>
                      <p className="text-sm font-bold text-foreground">{(predResult.confidence * 100).toFixed(1)}%</p>
                    </div>
                    {predResult.contributing_factors?.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Key Factors</p>
                        <div className="flex flex-wrap gap-1">
                          {predResult.contributing_factors.map(f => (
                            <span key={f} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                              {f.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
