import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Brain, Activity, CheckCircle2, XCircle, RefreshCw, GitBranch, Target, Loader2, Database, Play, Sparkles, AlertCircle, ChevronRight, TrendingUp, ShieldCheck, ClipboardList, PenTool, Check, Copy, AlertTriangle, Building2, Tag, Flame, ShieldAlert, Zap, BarChart3, Search, Award, FileText, BookOpen, Navigation, Settings, Radar, Map
} from 'lucide-react'
import {
  ScatterChart, Scatter as ReScatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, Legend, AreaChart, Area, CartesianGrid, LineChart, Line, BarChart, Bar, PieChart, Pie, RadialBarChart, RadialBar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as ReRadar
} from 'recharts'
import { aiApi, incidentsApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ClusterPoint, ModelStatus, RiskAnalysis, AtRiskIncident } from '@/types'

// ── Color helpers ────────────────────────────────────────────────────────
const SEV_COLOR: Record<string, string> = {
  LOW: '#22c55e', MEDIUM: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444',
}
const SEV_DOT = SEV_COLOR

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

const StatRow = ({ label, value }: { label: string; value: string | number | undefined }) =>
  value != null ? (
    <div className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  ) : null

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props
  return (
    <circle cx={cx} cy={cy} r={6} fill={SEV_DOT[payload.severity] ?? '#64748b'}
      fillOpacity={0.85} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
  )
}

const ClusterTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d: ClusterPoint = payload[0].payload
  return (
    <div className="card-glass px-3 py-2 text-xs max-w-[200px]">
      <p className="font-semibold text-foreground truncate">{d.title}</p>
      <p className="text-muted-foreground">{d.severity} · Cluster {d.cluster}</p>
      {d.category && <p className="text-muted-foreground">{d.category}</p>}
    </div>
  )
}

const PipelineAlert = ({ msg, type }: { msg: string; type: 'success' | 'error' | 'info' }) => {
  const styles = {
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error:   'bg-red-500/10   border-red-500/30   text-red-400',
    info:    'bg-blue-500/10  border-blue-500/30  text-blue-400',
  }
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? XCircle : AlertCircle
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs ${styles[type]}`}>
      <Icon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
      <p>{msg}</p>
    </div>
  )
}

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

// ── Main Page Component ─────────────────────────────────────────────────
export default function AnalyticsHubPage() {
  const user = useAuthStore(s => s.user)
  const qc = useQueryClient()
  
  const [activeTab, setActiveTab] = useState<'ai' | 'overview' | 'predictive' | 'velocity' | 'controls' | 'heatmap' | 'decisions' | 'lessons'>('overview')
  const [pipelineMsg, setPipelineMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Risk Analyst Specific State
  const [selectedCategory, setSelectedCategory] = useState('Infrastructure')
  const [forecastPeriod, setForecastPeriod] = useState(30)
  const [forecastRunning, setForecastRunning] = useState(false)
  const [forecastData, setForecastData] = useState<any>(null)

  // Advanced Controls Evaluation
  const [ctrlPreventive, setCtrlPreventive] = useState(70)
  const [ctrlDetective, setCtrlDetective] = useState(60)
  const [ctrlCorrective, setCtrlCorrective] = useState(50)
  const [ctrlDirective, setCtrlDirective] = useState(80)
  const [ctrlCompensating, setCtrlCompensating] = useState(65)

  // Lessons Learned Draft
  const [assistantCluster, setAssistantCluster] = useState('Cluster 1')
  const [findingsInput, setFindingsInput] = useState('')
  const [draftResult, setDraftResult] = useState<string>('')
  const [drafting, setDrafting] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Decision Log
  const [decisionLog, setDecisionLog] = useState<{time: Date, text: string}[]>([])
  const [newDecision, setNewDecision] = useState('')

  // Live Predictor
  const [predTitle, setPredTitle]   = useState('')
  const [predDesc,  setPredDesc]    = useState('')
  const [predCat,   setPredCat]     = useState('')
  const [predDept,  setPredDept]    = useState('')
  const [predResult, setPredResult] = useState<{
    risk_score: number; risk_label: string; confidence: number; contributing_factors: string[]
  } | null>(null)

  // ── Queries ────────────────────────────────────────────────────────────
  const { data: mapData, isLoading: mapLoading } = useQuery({ queryKey: ['cluster-map'], queryFn: () => aiApi.clusterMap() })
  const { data: statsData } = useQuery({ queryKey: ['cluster-stats'], queryFn: () => aiApi.clusterStats() })
  const { data: statusData, isLoading: statusLoading } = useQuery({ queryKey: ['model-status'], queryFn: () => aiApi.modelStatus(), refetchInterval: 15_000 })
  const { data: rawData, isLoading: riskLoading } = useQuery({ queryKey: ['risk-analysis'], queryFn: () => aiApi.riskAnalysis(), staleTime: 60_000 })
  const { data: heatmapRaw, isLoading: isHeatmapLoading } = useQuery({ queryKey: ['control-effectiveness'], queryFn: () => incidentsApi.getControlEffectiveness(), staleTime: 60_000 })

  const data: RiskAnalysis | undefined = rawData?.data as RiskAnalysis | undefined
  const clusterMap: { clusters: ClusterPoint[]; cluster_labels: Record<string,string>; total_incidents: number; num_clusters: number } | undefined = mapData?.data
  const modelStatus: ModelStatus | undefined = statusData?.data
  const clusterStats = statsData?.data?.stats ?? []
  const heatmapData = heatmapRaw?.data?.data ?? []

  // ── Data Processing ────────────────────────────────────────────────────
  const uniqueClusters = [...new Set((clusterMap?.clusters ?? []).map(c => c.cluster))].sort()
  const byCluster = uniqueClusters.reduce<Record<number, ClusterPoint[]>>((acc, k) => {
    acc[k] = (clusterMap?.clusters ?? []).filter(c => c.cluster === k)
    return acc
  }, {})

  const trendData = useMemo(() => {
    return (data?.monthly_trend ?? []).map(p => ({
      ...p,
      month: p.month.slice(5),
    }))
  }, [data])

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

  // ── Mutations ──────────────────────────────────────────────────────────
  const showResult = (res: any, isError = false) => {
    const msg = res?.data?.message ?? res?.message ?? (isError ? 'Operation failed — check logs.' : 'Done.')
    setPipelineMsg({ text: msg, type: isError ? 'error' : 'success' })
    setTimeout(() => setPipelineMsg(null), 8000)
    qc.invalidateQueries({ queryKey: ['model-status'] })
    qc.invalidateQueries({ queryKey: ['cluster-map'] })
    qc.invalidateQueries({ queryKey: ['cluster-stats'] })
  }

  const seedMutation = useMutation({
    mutationFn: () => aiApi.seedBaseline(),
    onSuccess:  (res) => showResult(res),
    onError:    (err: any) => showResult(err.response ?? err, true),
  })

  const pipelineMutation = useMutation({
    mutationFn: () => aiApi.runPipeline(),
    onSuccess:  (res) => showResult(res),
    onError:    (err: any) => showResult(err.response ?? err, true),
  })

  const predictMutation = useMutation({
    mutationFn: () => aiApi.predictRisk({
      title: predTitle, description: predDesc,
      category: predCat || undefined, department: predDept || undefined,
    }),
    onSuccess: (res) => setPredResult(res.data as any),
  })

  const isRunning = seedMutation.isPending || pipelineMutation.isPending

  // ── Handlers ───────────────────────────────────────────────────────────
  const runForecast = () => {
    setForecastRunning(true)
    setTimeout(() => {
      const baseVal = selectedCategory === 'Infrastructure' ? 8 : selectedCategory === 'Cyber Security' ? 12 : 5
      const dataPoints = Array.from({ length: 6 }, (_, i) => {
        const factor = Math.sin(i) * 3 + Math.random() * 2
        return {
          name: `Wk ${i + 1}`,
          historical: i < 3 ? Math.round(baseVal + factor) : null,
          projected: i >= 2 ? Math.round(baseVal + factor + (i * 0.8)) : null,
        }
      })
      setForecastData(dataPoints)
      setForecastRunning(false)
    }, 800)
  }

  const generateDraft = () => {
    setDrafting(true)
    setTimeout(() => {
      setDraftResult(`### 📝 AI-Drafted Lessons Learned Documentation

**Incident Area:** ${selectedCategory} / Cluster: ${assistantCluster}
**Synthesized Findings:** ${findingsInput || 'Systemic failures in configurations combined with delayed detection controls.'}

---

#### 1. Root Cause Summary
- **Primary Category:** Process Gap & System Control Failure
- **Key Factor:** Insufficient automated health checking coupled with delayed alerting mechanisms. The current response time threshold is set too high.

#### 2. Actionable Control Recommendations
- **[Preventive]** Implement automated continuous configuration state drift detection with auto-rollback.
- **[Detective]** Create real-time notification hooks connected to the incident manager dashboard for active severity escalation.
- **[Corrective]** Standardize the post-incident playbook, requiring all root-causes to be documented in the Lessons Library within 48 hours of resolution.
- **[Directive]** Update organizational policy Section 4.2.
- **[Compensating]** Add manual log review checks until automated system is deployed.

#### 3. Standard Operating Procedure (SOP) Updates
- Revise Section 4.2 of the Incident Management Playbook to specify mandatory Investigator assignments upon initial triaging.
- **KPI to Monitor:** Aim for < 15m MTTR for this category moving forward.`)
      setDrafting(false)
    }, 1200)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddDecision = () => {
    if (!newDecision.trim()) return
    setDecisionLog([{time: new Date(), text: newDecision}, ...decisionLog])
    setNewDecision('')
  }

  // Calculate advanced residual risk
  const residualRisk = Math.max(
    10,
    Math.round(95 - (ctrlPreventive * 0.35 + ctrlDetective * 0.25 + ctrlCorrective * 0.20 + ctrlDirective * 0.10 + ctrlCompensating * 0.10))
  )

  const s = data?.summary
  const isLoadingAny = mapLoading || statusLoading || riskLoading || isHeatmapLoading

  const tabs = [
    { id: 'overview', label: 'Intelligence Overview', icon: Target },
    { id: 'predictive', label: 'Predictive Analysis', icon: TrendingUp },
    { id: 'heatmap', label: 'Risk Heatmap', icon: Map },
    { id: 'velocity', label: 'Threat Velocity', icon: Activity },
    { id: 'controls', label: 'Control Evaluation', icon: ShieldCheck },
    { id: 'ai', label: 'AI Models', icon: Brain },
    { id: 'decisions', label: 'Decision Log', icon: PenTool },
    { id: 'lessons', label: 'SOP Publisher', icon: BookOpen },
  ] as const

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Radar className="h-6 w-6 text-primary" /> Analytics &amp; Command Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Advanced risk forecasting, systemic pattern modeling, and control evaluation
          </p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'risk_analyst' && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Sparkles className="h-4 w-4" /> Risk Analyst Mode
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs Navigation ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 border-b border-border/50 pb-px">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 ${isActive ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'}`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab Content Container ──────────────────────────────────────── */}
      <div className="min-h-[500px]">
        {isLoadingAny ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading intelligence data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── TAB 1: OVERVIEW ────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Risk Health Index', value: '78', sub: '/100', icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10' },
                    { label: 'Control Coverage', value: '82%', sub: 'System-wide', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Active Threats', value: s?.open_incidents ?? '—', sub: 'Open Incidents', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                    { label: 'Critical Risks', value: s?.critical_count ?? '—', sub: 'Urgent', icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'Avg Risk Score', value: s?.avg_risk_score?.toFixed(1) ?? '—', sub: 'Historical', icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                    <Card key={label} className="relative overflow-hidden group">
                      <div className={`absolute inset-0 ${bg} opacity-50`} />
                      <CardContent className="pt-5 pb-4 relative">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <p className={`text-2xl font-black ${color}`}>{value}</p>
                          <p className="text-xs text-muted-foreground">{sub}</p>
                        </div>
                        <Icon className={`absolute right-4 top-5 h-6 w-6 ${color} opacity-40`} />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Health Index Gauge */}
                  <Card className="flex flex-col items-center justify-center py-8">
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-base">System Risk Health Index</CardTitle>
                      <CardDescription>Composite score of all active controls</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      <RiskGauge score={78} size={180} />
                      <p className="mt-4 text-sm text-center text-muted-foreground max-w-[200px]">
                        The system is currently <strong className="text-green-400">Stable</strong>. Preventive controls are operating normally.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Top At-Risk Open Incidents */}
                  <Card className="lg:col-span-2">
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
                            <div className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer border border-transparent hover:border-border/30">
                              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-border text-[10px] font-bold text-muted-foreground">
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">{inc.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <SevBadge sev={inc.severity} />
                                  {inc.department && (
                                    <span className="text-[10px] text-cyan-400 truncate">{inc.department}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end flex-shrink-0">
                                <span className={`text-sm font-black tabular-nums ${RISK_TEXT(inc.risk_score)}`}>
                                  {inc.risk_score}
                                </span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground/40 mt-0.5 group-hover:text-foreground transition-colors" />
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ── TAB 2: PREDICTIVE ANALYSIS ──────────────────────────────── */}
            {activeTab === 'predictive' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                          <p className="text-sm text-muted-foreground">No trend data yet</p>
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" /> Severity Split
                      </CardTitle>
                      <CardDescription>All incidents by severity</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                      {summaryPie.length === 0 ? (
                        <div className="h-48 flex items-center justify-center"><p className="text-sm text-muted-foreground">No data</p></div>
                      ) : (
                        <>
                          <PieChart width={180} height={180}>
                            <Pie data={summaryPie} cx={86} cy={86} innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Building2 className="h-4 w-4 text-primary" /> Department Risk Scores
                      </CardTitle>
                      <CardDescription>Average predicted risk score per department</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!data?.department_risk?.length ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-2">
                          <Building2 className="h-10 w-10 text-muted-foreground/30" />
                          <p className="text-sm text-muted-foreground">No department data yet</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart layout="vertical" data={data.department_risk} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="department" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={90} />
                            <Tooltip content={({ active, payload }) => {
                              if (!active || !payload?.length) return null
                              const d = payload[0].payload
                              return (
                                <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
                                  <p className="font-semibold text-foreground">{d.department}</p>
                                  <p className="text-muted-foreground">Avg Risk: <span className={`font-bold ${RISK_TEXT(d.avg_risk_score)}`}>{d.avg_risk_score}</span></p>
                                  <p className="text-muted-foreground">Total: {d.total_incidents}</p>
                                </div>
                              )
                            }} />
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
                </div>
                
                {/* Live Predictor Box */}
                <Card className="relative overflow-hidden bg-card/60 border-primary/20">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Search className="h-4 w-4 text-primary" /> Live Risk Predictor Sandbox
                    </CardTitle>
                    <CardDescription>Describe a hypothetical incident to test the model</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <input
                          value={predTitle} onChange={e => setPredTitle(e.target.value)} placeholder="Incident title…"
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                        <textarea
                          value={predDesc} onChange={e => setPredDesc(e.target.value)} placeholder="Describe the incident…" rows={3}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                        />
                        <div className="flex gap-2">
                          <input value={predCat} onChange={e => setPredCat(e.target.value)} placeholder="Category" className="w-1/2 text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                          <input value={predDept} onChange={e => setPredDept(e.target.value)} placeholder="Department" className="w-1/2 text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                        </div>
                        <button
                          onClick={() => predictMutation.mutate()} disabled={!predTitle.trim() || !predDesc.trim() || predictMutation.isPending}
                          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary/20 border border-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/30 disabled:opacity-50 transition-all"
                        >
                          {predictMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                          Run Model
                        </button>
                      </div>
                      
                      <div className="bg-background/80 rounded-lg border border-border p-4 flex items-center justify-center">
                        {predResult ? (
                          <div className="flex items-center gap-4 w-full animate-fade-in">
                            <RiskGauge score={predResult.risk_score} size={100} />
                            <div className="flex-1 space-y-2">
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Level</p>
                                <SevBadge sev={predResult.risk_label} />
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence</p>
                                <p className="text-sm font-bold text-foreground">{(predResult.confidence * 100).toFixed(1)}%</p>
                              </div>
                              {predResult.contributing_factors?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {predResult.contributing_factors.map(f => (
                                    <span key={f} className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">{f.replace(/_/g, ' ')}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center">Run prediction to see results</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── TAB 3: HEATMAP ────────────────────────────────────────── */}
            {activeTab === 'heatmap' && (
              <div className="space-y-6 animate-fade-in">
                {/* 5x5 Matrix (UI Only Simulation) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Map className="h-4 w-4 text-primary" /> Risk Probability × Impact Matrix
                    </CardTitle>
                    <CardDescription>ISO 31000 standard 5×5 risk mapping based on incident clusters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <div className="flex flex-col justify-between items-center text-[10px] uppercase font-bold text-muted-foreground tracking-widest py-4">
                        <span className="rotate-[-90deg] whitespace-nowrap -mt-6">High Probability</span>
                        <span className="rotate-[-90deg] whitespace-nowrap mb-2">Low Probability</span>
                      </div>
                      
                      <div className="grid grid-cols-5 grid-rows-5 gap-1 flex-1 max-w-3xl aspect-square">
                        {/* 25 cells rendering logic */}
                        {Array.from({ length: 25 }).map((_, i) => {
                          const row = Math.floor(i / 5);
                          const col = i % 5;
                          // Heatmap logic: bottom-left (low/low) = green, top-right (high/high) = red
                          // row 0 = highest prob, row 4 = lowest prob
                          // col 0 = lowest impact, col 4 = highest impact
                          const score = ((4 - row) + col) / 8; // 0 to 1
                          
                          let bg = "bg-green-500/10 hover:bg-green-500/20";
                          if (score > 0.7) bg = "bg-red-500/10 hover:bg-red-500/20";
                          else if (score > 0.4) bg = "bg-yellow-500/10 hover:bg-yellow-500/20";
                          
                          // Simulate data points
                          const incidents = Math.floor(Math.random() * (score > 0.7 ? 5 : 15));
                          
                          return (
                            <div 
                              key={i} 
                              className={`${bg} rounded border border-foreground/5 cursor-pointer flex flex-col items-center justify-center transition-colors`}
                            >
                              <span className="text-sm font-bold text-foreground/70">{incidents > 0 ? incidents : ''}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex justify-between pl-12 text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-2 max-w-3xl">
                      <span>Low Impact</span>
                      <span>High Impact</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── TAB 4: THREAT VELOCITY ───────────────────────────────────── */}
            {activeTab === 'velocity' && (
              <div className="space-y-6 animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Systemic Pattern &amp; Forecasting Simulator
                    </CardTitle>
                    <CardDescription>Simulate future incident patterns based on historical data clusters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] text-muted-foreground uppercase font-semibold">Incident Category</label>
                        <select
                          value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        >
                          <option value="Infrastructure">Infrastructure</option>
                          <option value="Cyber Security">Cyber Security</option>
                          <option value="Environmental">Environmental</option>
                          <option value="Health &amp; Safety">Health &amp; Safety</option>
                          <option value="HR &amp; Compliance">HR &amp; Compliance</option>
                        </select>
                      </div>
                      <div className="w-28 space-y-1.5">
                        <label className="text-[10px] text-muted-foreground uppercase font-semibold">Forecast Period</label>
                        <select
                          value={forecastPeriod} onChange={e => setForecastPeriod(Number(e.target.value))}
                          className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        >
                          <option value={30}>30 Days</option>
                          <option value={60}>60 Days</option>
                          <option value={90}>90 Days</option>
                        </select>
                      </div>
                      <button
                        onClick={runForecast} disabled={forecastRunning}
                        className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                      >
                        {forecastRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        Simulate
                      </button>
                    </div>

                    {forecastData ? (
                      <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={forecastData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip content={({ active, payload }: any) => {
                              if (!active || !payload?.length) return null
                              return (
                                <div className="card-glass px-2 py-1.5 text-[10px]">
                                  <p className="font-semibold text-foreground">{payload[0].payload.name}</p>
                                  {payload[0].value !== null && <p className="text-blue-400">Historical: {payload[0].value}</p>}
                                  {payload[1]?.value !== null && <p className="text-purple-400">Forecasted: {payload[1]?.value}</p>}
                                </div>
                              )
                            }} />
                            <Area type="monotone" dataKey="historical" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHist)" strokeWidth={2} />
                            <Area type="monotone" dataKey="projected" stroke="#a855f7" strokeDasharray="3 3" fillOpacity={1} fill="url(#colorProj)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                        <div className="flex gap-4 justify-center text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><span className="h-1.5 w-3 bg-blue-500 rounded" /> Historical Data</span>
                          <span className="flex items-center gap-1"><span className="h-1.5 w-3 bg-purple-500 border-dashed border-t rounded" /> Projected (AI Forecast)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-lg bg-card/20">
                        <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground font-medium">No simulation active</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── TAB 5: CONTROLS ────────────────────────────────────────── */}
            {activeTab === 'controls' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" /> Advanced Control Evaluator
                      </CardTitle>
                      <CardDescription>Multi-dimensional control strength mapping</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-3">
                        {[
                          { label: 'Preventive', val: ctrlPreventive, set: setCtrlPreventive, col: 'accent-blue-500' },
                          { label: 'Detective', val: ctrlDetective, set: setCtrlDetective, col: 'accent-cyan-500' },
                          { label: 'Corrective', val: ctrlCorrective, set: setCtrlCorrective, col: 'accent-green-500' },
                          { label: 'Directive', val: ctrlDirective, set: setCtrlDirective, col: 'accent-purple-500' },
                          { label: 'Compensating', val: ctrlCompensating, set: setCtrlCompensating, col: 'accent-orange-500' },
                        ].map(c => (
                          <div key={c.label} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-foreground">{c.label} Control</span>
                              <span className="font-bold">{c.val}%</span>
                            </div>
                            <input
                              type="range" min="0" max="100" value={c.val} onChange={e => c.set(Number(e.target.value))}
                              className={`w-full ${c.col} bg-muted rounded-lg h-1`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border border-border bg-background/60 p-4 flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border border-border/80 bg-card/50 flex-shrink-0">
                          <span className={`text-2xl font-black ${residualRisk >= 60 ? 'text-red-400' : residualRisk >= 35 ? 'text-yellow-400' : 'text-green-400'}`}>{residualRisk}</span>
                          <span className="text-[8px] text-muted-foreground mt-0.5 uppercase tracking-widest">Res. Risk</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-semibold text-foreground">Residual Risk Assessment</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {residualRisk >= 60 ? 'CRITICAL: Severe systemic vulnerability detected across control plane.' : residualRisk >= 35 ? 'MODERATE: Controls functional but optimization required.' : 'OPTIMAL: Risk fully calibrated within thresholds.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Radar className="h-4 w-4 text-primary" /> Control Balance Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center">
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                            { subject: 'Preventive', A: ctrlPreventive, fullMark: 100 },
                            { subject: 'Detective', A: ctrlDetective, fullMark: 100 },
                            { subject: 'Corrective', A: ctrlCorrective, fullMark: 100 },
                            { subject: 'Directive', A: ctrlDirective, fullMark: 100 },
                            { subject: 'Compensating', A: ctrlCompensating, fullMark: 100 },
                          ]}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <ReRadar name="Controls" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ── TAB 6: AI MODELS ───────────────────────────────────────── */}
            {activeTab === 'ai' && (
              <div className="space-y-6 animate-fade-in">
                {user?.role === 'admin' && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" /> Admin Model Management
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Trigger pipeline retrains or seed baseline data.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => { setPipelineMsg({ text: 'Seeding baseline data...', type: 'info' }); seedMutation.mutate() }}
                          disabled={isRunning}
                          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                        >
                          {seedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />} Seed Data
                        </button>
                        <button
                          onClick={() => { setPipelineMsg({ text: 'Running pipeline...', type: 'info' }); pipelineMutation.mutate() }}
                          disabled={isRunning}
                          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-50 transition-all"
                        >
                          {pipelineMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 text-primary" />} Run Pipeline
                        </button>
                      </div>
                      {pipelineMsg && <PipelineAlert msg={pipelineMsg.text} type={pipelineMsg.type} />}
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5" />
                    <CardContent className="pt-6">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">NLP Model</p>
                      <p className="text-lg font-bold text-foreground mt-1">Sentence Transformer</p>
                      <div className="mt-4 h-1.5 rounded-full bg-border overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-primary to-cyan-400" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Ready</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="relative overflow-hidden">
                    <div className={`absolute inset-0 ${modelStatus?.clustering_trained ? 'bg-green-500/5' : 'bg-yellow-500/5'}`} />
                    <CardContent className="pt-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Clustering</p>
                          <p className="text-lg font-bold text-foreground mt-1">K-Means + UMAP</p>
                        </div>
                        {modelStatus?.clustering_trained ? <CheckCircle2 className="h-6 w-6 text-green-400" /> : <XCircle className="h-6 w-6 text-yellow-400" />}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden">
                    <div className={`absolute inset-0 ${modelStatus?.classifier_trained ? 'bg-green-500/5' : 'bg-yellow-500/5'}`} />
                    <CardContent className="pt-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Risk Classifier</p>
                          <p className="text-lg font-bold text-foreground mt-1">Gradient Boosting</p>
                        </div>
                        {modelStatus?.classifier_trained ? <CheckCircle2 className="h-6 w-6 text-green-400" /> : <XCircle className="h-6 w-6 text-yellow-400" />}
                      </div>
                      {modelStatus?.accuracy != null && (
                        <p className="text-xs text-muted-foreground mt-3">Accuracy: {(modelStatus.accuracy * 100).toFixed(1)}%</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2"><GitBranch className="h-4 w-4 text-primary" /> Incident Clustering Map</CardTitle>
                        <CardDescription>2D UMAP projection</CardDescription>
                      </div>
                      <button onClick={() => qc.invalidateQueries({ queryKey: ['cluster-map'] })} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!clusterMap?.clusters.length ? (
                      <div className="flex flex-col items-center justify-center h-80 gap-3"><RefreshCw className="h-10 w-10 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">No cluster data</p></div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                          <XAxis dataKey="x" type="number" tick={false} axisLine={false} />
                          <YAxis dataKey="y" type="number" tick={false} axisLine={false} />
                          <Tooltip content={<ClusterTooltip />} />
                          {uniqueClusters.map(k => (
                            <ReScatter key={k} name={`Cluster ${k}`} data={byCluster[k]} shape={<CustomDot />} />
                          ))}
                        </ScatterChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── TAB 7: DECISION LOG ────────────────────────────────────── */}
            {activeTab === 'decisions' && (
              <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <PenTool className="h-4 w-4 text-primary" /> Analyst Decision &amp; Observation Log
                    </CardTitle>
                    <CardDescription>Record key decisions and parameter adjustments for audit trails</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        value={newDecision} onChange={e => setNewDecision(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddDecision()}
                        placeholder="e.g. Adjusted directive controls to 80% to offset recent IT infrastructure cluster..."
                        className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button onClick={handleAddDecision} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 rounded-lg text-xs font-semibold transition-colors">
                        Log Note
                      </button>
                    </div>

                    <div className="space-y-3 mt-6 border-t border-border/30 pt-6">
                      {decisionLog.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No decisions logged in this session yet.</p>
                      ) : (
                        decisionLog.map((log, i) => (
                          <div key={i} className="flex gap-3 text-sm border border-border/50 bg-card/30 p-3 rounded-lg">
                            <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">{log.time.toLocaleTimeString()}</span>
                            <span className="text-foreground">{log.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── TAB 8: SOP PUBLISHER ───────────────────────────────────── */}
            {activeTab === 'lessons' && (
              <div className="space-y-6 animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-primary" /> Lessons Learned &amp; SOP Publisher
                    </CardTitle>
                    <CardDescription>Synthesize findings from pattern analysis into documented lessons learned</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-muted-foreground uppercase font-semibold">Incident Cluster Reference</label>
                          <input
                            value={assistantCluster} onChange={e => setAssistantCluster(e.target.value)}
                            className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-muted-foreground uppercase font-semibold">Key Analyst Findings / Notes</label>
                          <textarea
                            value={findingsInput} onChange={e => setFindingsInput(e.target.value)} rows={6}
                            className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                          />
                        </div>
                        <button
                          onClick={generateDraft} disabled={drafting}
                          className="w-full flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                        >
                          {drafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PenTool className="h-3.5 w-3.5" />} Generate Draft SOP
                        </button>
                      </div>

                      <div className="border border-border rounded-lg bg-card/40 p-4 min-h-[300px] flex flex-col">
                        {draftResult ? (
                          <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center pb-2 border-b border-border/30 mb-3">
                              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Generated Output</span>
                              <button onClick={copyToClipboard} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />} {copied ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <div className="flex-1 text-xs text-foreground whitespace-pre-line leading-relaxed overflow-y-auto pr-1">
                              {draftResult}
                            </div>
                            <button className="mt-4 w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 py-2 rounded-lg text-xs font-semibold transition-colors">
                              Publish to Lessons Library
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <PenTool className="h-8 w-8 text-muted-foreground/30 mb-2" />
                            <p className="text-xs text-muted-foreground font-medium">Ready to draft SOP</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
