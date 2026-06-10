import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Brain, Activity, CheckCircle2, XCircle,
  RefreshCw, GitBranch, Target, Loader2,
  Database, Play, Sparkles, AlertCircle,
<<<<<<< HEAD
  ChevronRight,
=======
  ChevronRight, TrendingUp, ShieldCheck, ClipboardList,
  PenTool, Check, Copy, AlertTriangle
>>>>>>> 8219077 (ci: add GitHub Actions workflow for frontend, backend, and AI service)
} from 'lucide-react'
import {
  ScatterChart, Scatter as ReScatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, Legend, AreaChart, Area, CartesianGrid, LineChart, Line
} from 'recharts'
import { aiApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ClusterPoint, ModelStatus } from '@/types'

const CLUSTER_COLORS = [
  '#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16',
]

const SEV_DOT: Record<string, string> = {
  LOW: '#22c55e', MEDIUM: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444',
}

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

// ── Toast-style inline alert ───────────────────────────────────────────────
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

export default function AIDashboardPage() {
<<<<<<< HEAD
  const qc = useQueryClient()
  const [pipelineMsg, setPipelineMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

=======
  const user = useAuthStore(s => s.user)
  const qc = useQueryClient()
  const [pipelineMsg, setPipelineMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  // --- Risk Analyst Tools State ---
  const [selectedCategory, setSelectedCategory] = useState('Infrastructure')
  const [forecastPeriod, setForecastPeriod] = useState(30)
  const [forecastRunning, setForecastRunning] = useState(false)
  const [forecastData, setForecastData] = useState<any>(null)

  // Control Evaluation Simulator
  const [preventiveStrength, setPreventiveStrength] = useState(70)
  const [detectiveStrength, setDetectiveStrength] = useState(60)
  const [correctiveStrength, setCorrectiveStrength] = useState(50)

  // Lessons Learned Drafting Assistant
  const [assistantCluster, setAssistantCluster] = useState('Cluster 1')
  const [findingsInput, setFindingsInput] = useState('')
  const [draftResult, setDraftResult] = useState<string>('')
  const [drafting, setDrafting] = useState(false)
  const [copied, setCopied] = useState(false)

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

#### 3. Standard Operating Procedure (SOP) Updates
- Revise Section 4.2 of the Incident Management Playbook to specify mandatory Investigator assignments upon initial triaging.`);
      setDrafting(false)
    }, 1200)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const residualRisk = Math.max(
    10,
    Math.round(85 - (preventiveStrength * 0.4 + detectiveStrength * 0.3 + correctiveStrength * 0.3))
  )

>>>>>>> 8219077 (ci: add GitHub Actions workflow for frontend, backend, and AI service)
  const { data: mapData,    isLoading: mapLoading }    = useQuery({ queryKey: ['cluster-map'],   queryFn: () => aiApi.clusterMap() })
  const { data: statsData                              } = useQuery({ queryKey: ['cluster-stats'], queryFn: () => aiApi.clusterStats() })
  const { data: statusData, isLoading: statusLoading   } = useQuery({ queryKey: ['model-status'],  queryFn: () => aiApi.modelStatus(), refetchInterval: 15_000 })

  const clusterMap: { clusters: ClusterPoint[]; cluster_labels: Record<string,string>; total_incidents: number; num_clusters: number } | undefined
    = mapData?.data
  const modelStatus: ModelStatus | undefined = statusData?.data
  const clusterStats = statsData?.data?.stats ?? []

  const uniqueClusters = [...new Set((clusterMap?.clusters ?? []).map(c => c.cluster))].sort()
  const byCluster = uniqueClusters.reduce<Record<number, ClusterPoint[]>>((acc, k) => {
    acc[k] = (clusterMap?.clusters ?? []).filter(c => c.cluster === k)
    return acc
  }, {})

  // ── Mutations ────────────────────────────────────────────────────────────
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

  const isRunning = seedMutation.isPending || pipelineMutation.isPending

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" /> AI Analytics Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          NLP similarity · K-Means clustering · Predictive risk scoring
        </p>
      </div>

<<<<<<< HEAD
      {/* ── Model Management Panel ──────────────────────────────────────── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Model Management
          </CardTitle>
          <CardDescription className="text-xs">
            The Gradient Boosting classifier needs ≥ 10 closed incidents with embeddings to train.
            Use the buttons below to seed baseline data or manually trigger the AI pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            {/* Seed Baseline Data */}
            <button
              id="seed-baseline-btn"
              onClick={() => { setPipelineMsg({ text: 'Seeding 30 baseline incidents and running the pipeline — this may take 30–60 seconds…', type: 'info' }); seedMutation.mutate() }}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {seedMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Database className="h-4 w-4" />}
              {seedMutation.isPending ? 'Seeding…' : 'Seed Baseline Data'}
            </button>

            {/* Run Pipeline Manually */}
            <button
              id="run-pipeline-btn"
              onClick={() => { setPipelineMsg({ text: 'Running pipeline: embedding → clustering → training…', type: 'info' }); pipelineMutation.mutate() }}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {pipelineMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Play className="h-4 w-4 text-primary" />}
              {pipelineMutation.isPending ? 'Running…' : 'Run AI Pipeline Now'}
            </button>
          </div>

          {/* How it works — expandable note */}
          <div className="rounded-lg bg-card/60 border border-border/50 px-3 py-2 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-primary" /> How does Gradient Boosting work here?
            </p>
            <p>
              <span className="text-foreground font-medium">Training:</span> The system collects all CLOSED incidents
              that have AI embeddings. Their sentence-transformer vectors (384 dimensions) are combined with
              one-hot encoded category/department features, then a GradientBoostingClassifier learns to predict
              severity (LOW/MEDIUM/HIGH/CRITICAL). Isotonic calibration is applied so confidence scores are realistic.
            </p>
            <p>
              <span className="text-foreground font-medium">Prediction:</span> When a new incident is created,
              the same feature extraction runs. The calibrated model outputs a probability distribution across all
              4 classes. The risk label is <code className="bg-border/50 px-1 rounded">argmax(proba)</code> and
              the risk score is the probability-weighted average
              (<code className="bg-border/50 px-1 rounded">Σ P(class) × score(class)</code>).
            </p>
            <p>
              <span className="text-foreground font-medium">Auto-retrain:</span> The scheduler runs every 5 minutes.
              When new incidents are created and closed, embeddings are generated automatically and the model retrains.
            </p>
          </div>

          {/* Result message */}
          {pipelineMsg && <PipelineAlert msg={pipelineMsg.text} type={pipelineMsg.type} />}
        </CardContent>
      </Card>

      {/* Model Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusLoading ? (
          <Card className="md:col-span-3 flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
=======
      {/* ── Model Management & Monitoring (Admin & Risk Analyst Only) ── */}
      {(user?.role === 'admin' || user?.role === 'risk_analyst') && (
        <>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Model Management &amp; Monitoring
              </CardTitle>
              <CardDescription className="text-xs">
                The Gradient Boosting classifier needs ≥ 10 closed incidents with embeddings to train.
                Use the buttons below to seed baseline data or manually trigger the AI pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {/* Seed Baseline Data */}
                <button
                  id="seed-baseline-btn"
                  onClick={() => { setPipelineMsg({ text: 'Seeding 30 baseline incidents and running the pipeline — this may take 30–60 seconds…', type: 'info' }); seedMutation.mutate() }}
                  disabled={isRunning}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {seedMutation.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Database className="h-4 w-4" />}
                  {seedMutation.isPending ? 'Seeding…' : 'Seed Baseline Data'}
                </button>

                {/* Run Pipeline Manually */}
                <button
                  id="run-pipeline-btn"
                  onClick={() => { setPipelineMsg({ text: 'Running pipeline: embedding → clustering → training…', type: 'info' }); pipelineMutation.mutate() }}
                  disabled={isRunning}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {pipelineMutation.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Play className="h-4 w-4 text-primary" />}
                  {pipelineMutation.isPending ? 'Running…' : 'Run AI Pipeline Now'}
                </button>
              </div>

              {/* How it works — expandable note */}
              <div className="rounded-lg bg-card/60 border border-border/50 px-3 py-2 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-primary" /> How does Gradient Boosting work here?
                </p>
                <p>
                  <span className="text-foreground font-medium">Training:</span> The system collects all CLOSED incidents
                  that have AI embeddings. Their sentence-transformer vectors (384 dimensions) are combined with
                  one-hot encoded category/department features, then a GradientBoostingClassifier learns to predict
                  severity (LOW/MEDIUM/HIGH/CRITICAL). Isotonic calibration is applied so confidence scores are realistic.
                </p>
                <p>
                  <span className="text-foreground font-medium">Prediction:</span> When a new incident is created,
                  the same feature extraction runs. The calibrated model outputs a probability distribution across all
                  4 classes. The risk label is <code className="bg-border/50 px-1 rounded">argmax(proba)</code> and
                  the risk score is the probability-weighted average
                  (<code className="bg-border/50 px-1 rounded">Σ P(class) × score(class)</code>).
                </p>
                <p>
                  <span className="text-foreground font-medium">Auto-retrain:</span> The scheduler runs every 5 minutes.
                  When new incidents are created and closed, embeddings are generated automatically and the model retrains.
                </p>
              </div>

              {/* Result message */}
              {pipelineMsg && <PipelineAlert msg={pipelineMsg.text} type={pipelineMsg.type} />}
            </CardContent>
>>>>>>> 8219077 (ci: add GitHub Actions workflow for frontend, backend, and AI service)
          </Card>

          {/* Model Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusLoading ? (
              <Card className="md:col-span-3 flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </Card>
            ) : (
              <>
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5" />
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">NLP Model</p>
                        <p className="text-lg font-bold text-foreground mt-1">Sentence Transformer</p>
                        <p className="text-xs text-muted-foreground mt-0.5">all-MiniLM-L6-v2</p>
                      </div>
                      <Activity className="h-6 w-6 text-primary opacity-80" />
                    </div>
                    <div className="mt-4 h-1.5 rounded-full bg-border overflow-hidden">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-cyan-400" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Always ready</p>
                  </CardContent>
                </Card>

<<<<<<< HEAD
            <Card className="relative overflow-hidden">
              <div className={`absolute inset-0 ${modelStatus?.classifier_trained ? 'bg-green-500/5' : 'bg-yellow-500/5'}`} />
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Risk Classifier</p>
                    <p className="text-lg font-bold text-foreground mt-1">Gradient Boosting</p>
                    {modelStatus?.classifier_trained
                      ? <p className="text-xs text-muted-foreground mt-0.5">{modelStatus.training_samples} training samples</p>
                      : <p className="text-xs text-yellow-400/80 mt-0.5">Needs ≥ 10 closed incidents</p>
                    }
                  </div>
                  {modelStatus?.classifier_trained
                    ? <CheckCircle2 className="h-6 w-6 text-green-400" />
                    : <XCircle      className="h-6 w-6 text-yellow-400" />}
                </div>
                {modelStatus?.accuracy != null && (
                  <p className="text-xs text-muted-foreground mt-3">
                    CV Accuracy: <span className="text-foreground font-medium">{(modelStatus.accuracy * 100).toFixed(1)}%</span>
                  </p>
                )}
                {!modelStatus?.classifier_trained && (
                  <button
                    onClick={() => { setPipelineMsg({ text: 'Seeding baseline data…', type: 'info' }); seedMutation.mutate() }}
                    disabled={isRunning}
                    className="mt-3 w-full text-[10px] font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    → Seed baseline data now
                  </button>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
=======
                <Card className="relative overflow-hidden">
                  <div className={`absolute inset-0 ${modelStatus?.clustering_trained ? 'bg-green-500/5' : 'bg-yellow-500/5'}`} />
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Clustering</p>
                        <p className="text-lg font-bold text-foreground mt-1">K-Means + UMAP</p>
                        {modelStatus?.optimal_k && <p className="text-xs text-muted-foreground mt-0.5">k = {modelStatus.optimal_k} clusters</p>}
                      </div>
                      {modelStatus?.clustering_trained
                        ? <CheckCircle2 className="h-6 w-6 text-green-400" />
                        : <XCircle      className="h-6 w-6 text-yellow-400" />}
                    </div>
                    {modelStatus?.silhouette_score != null && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Silhouette: <span className="text-foreground font-medium">{modelStatus.silhouette_score.toFixed(3)}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                  <div className={`absolute inset-0 ${modelStatus?.classifier_trained ? 'bg-green-500/5' : 'bg-yellow-500/5'}`} />
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Risk Classifier</p>
                        <p className="text-lg font-bold text-foreground mt-1">Gradient Boosting</p>
                        {modelStatus?.classifier_trained
                          ? <p className="text-xs text-muted-foreground mt-0.5">{modelStatus.training_samples} training samples</p>
                          : <p className="text-xs text-yellow-400/80 mt-0.5">Needs ≥ 10 closed incidents</p>
                        }
                      </div>
                      {modelStatus?.classifier_trained
                        ? <CheckCircle2 className="h-6 w-6 text-green-400" />
                        : <XCircle      className="h-6 w-6 text-yellow-400" />}
                    </div>
                    {modelStatus?.accuracy != null && (
                      <p className="text-xs text-muted-foreground mt-3">
                        CV Accuracy: <span className="text-foreground font-medium">{(modelStatus.accuracy * 100).toFixed(1)}%</span>
                      </p>
                    )}
                    {!modelStatus?.classifier_trained && (
                      <button
                        onClick={() => { setPipelineMsg({ text: 'Seeding baseline data…', type: 'info' }); seedMutation.mutate() }}
                        disabled={isRunning}
                        className="mt-3 w-full text-[10px] font-semibold text-primary hover:underline disabled:opacity-50"
                      >
                        → Seed baseline data now
                      </button>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </>
      )}
>>>>>>> 8219077 (ci: add GitHub Actions workflow for frontend, backend, and AI service)

      {/* Cluster Scatter Map */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" /> Incident Clustering Map
              </CardTitle>
              <CardDescription className="mt-1">
                2D UMAP projection of sentence embeddings — each point is an incident coloured by severity.
                {clusterMap && ` ${clusterMap.total_incidents} incidents · ${clusterMap.num_clusters} clusters`}
              </CardDescription>
            </div>
            <button
              onClick={() => { qc.invalidateQueries({ queryKey: ['cluster-map'] }); qc.invalidateQueries({ queryKey: ['cluster-stats'] }) }}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh cluster map"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {mapLoading ? (
            <div className="flex justify-center items-center h-80">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Loading cluster map...</p>
              </div>
            </div>
          ) : !clusterMap?.clusters.length ? (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
              <RefreshCw className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No cluster data yet.</p>
              <p className="text-xs text-muted-foreground">Use "Seed Baseline Data" above to get started.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <XAxis dataKey="x" type="number" name="UMAP-1" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="y" type="number" name="UMAP-2" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ClusterTooltip />} />
                  {uniqueClusters.map(k => (
                    <ReScatter
                      key={k}
                      name={clusterMap.cluster_labels[String(k)] ?? `Cluster ${k}`}
                      data={byCluster[k]}
                      shape={<CustomDot />}
                    />
                  ))}
                  <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center flex-wrap">
                {Object.entries(SEV_DOT).map(([sev, col]) => (
                  <div key={sev} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: col }} />
                    {sev}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cluster breakdown + Model metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Cluster Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {clusterStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No cluster data available</p>
            ) : clusterStats.map((cs: any) => (
              <div key={cs.cluster_id} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {clusterMap?.cluster_labels?.[String(cs.cluster_id)] ?? `Cluster ${cs.cluster_id}`}
                  </span>
                  <span className="text-muted-foreground">{cs.count} incidents</span>
                </div>
                <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
                  {cs.by_severity.CRITICAL > 0 && (
                    <div className="bg-red-500 transition-all" style={{ width: `${cs.by_severity.CRITICAL / cs.count * 100}%` }} />
                  )}
                  {cs.by_severity.HIGH > 0 && (
                    <div className="bg-orange-500 transition-all" style={{ width: `${cs.by_severity.HIGH / cs.count * 100}%` }} />
                  )}
                  {cs.by_severity.MEDIUM > 0 && (
                    <div className="bg-yellow-500 transition-all" style={{ width: `${cs.by_severity.MEDIUM / cs.count * 100}%` }} />
                  )}
                  {cs.by_severity.LOW > 0 && (
                    <div className="bg-green-500 transition-all" style={{ width: `${cs.by_severity.LOW / cs.count * 100}%` }} />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Model Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modelStatus?.classifier_trained ? (
              <div className="space-y-1">
                <StatRow label="CV Accuracy"    value={modelStatus.accuracy   != null ? `${(modelStatus.accuracy   * 100).toFixed(1)}%` : undefined} />
                <StatRow label="Precision"      value={modelStatus.precision  != null ? `${(modelStatus.precision  * 100).toFixed(1)}%` : undefined} />
                <StatRow label="Recall"         value={modelStatus.recall     != null ? `${(modelStatus.recall     * 100).toFixed(1)}%` : undefined} />
                <StatRow label="F1 Score"       value={modelStatus.f1_score   != null ? `${(modelStatus.f1_score   * 100).toFixed(1)}%` : undefined} />
                <StatRow label="Training Samples" value={modelStatus.training_samples} />
                <StatRow label="Optimal Clusters" value={modelStatus.optimal_k} />
                <StatRow label="Silhouette"     value={modelStatus.silhouette_score?.toFixed(3)} />
                <StatRow label="Last Trained"   value={modelStatus.trained_at ? new Date(modelStatus.trained_at).toLocaleString() : undefined} />
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center gap-4">
                <XCircle className="h-10 w-10 text-yellow-400/60" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Classifier not yet trained.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Need ≥ 10 closed incidents with embeddings.
                  </p>
                </div>
                <button
                  onClick={() => { setPipelineMsg({ text: 'Seeding baseline data and training…', type: 'info' }); seedMutation.mutate() }}
                  disabled={isRunning}
                  className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 disabled:opacity-50 transition-all"
                >
                  {seedMutation.isPending
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Seeding…</>
                    : <><Database className="h-3.5 w-3.5" /> Seed &amp; Train Now</>
                  }
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Risk Analyst Workspace (Supiri Risk Analyst Toolkit) ─────────── */}
      {user?.role === 'risk_analyst' && (
        <div className="space-y-6 mt-8">
          <div className="border-t border-border/50 pt-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Risk Analyst Workspace
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Advanced simulation models, forecasting, control evaluation, and drafting lessons learned documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Widget 1: Systemic Pattern & Forecasting Simulator */}
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
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    >
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Environmental">Environmental</option>
                      <option value="Health & Safety">Health & Safety</option>
                      <option value="HR & Compliance">HR & Compliance</option>
                    </select>
                  </div>
                  <div className="w-28 space-y-1.5">
                    <label className="text-[10px] text-muted-foreground uppercase font-semibold">Forecast Period</label>
                    <select
                      value={forecastPeriod}
                      onChange={e => setForecastPeriod(Number(e.target.value))}
                      className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    >
                      <option value={30}>30 Days</option>
                      <option value={60}>60 Days</option>
                      <option value={90}>90 Days</option>
                    </select>
                  </div>
                  <button
                    onClick={runForecast}
                    disabled={forecastRunning}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    {forecastRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                    Simulate
                  </button>
                </div>

                {forecastData ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={180}>
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

                    {(selectedCategory === 'Infrastructure' || selectedCategory === 'Cyber Security') && (
                      <div className="flex items-start gap-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-xs text-orange-400">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Systemic Failure Warning:</span> Higher probability of configuration drift detected in UMAP cluster 2. Recommend reviewing preventive controls immediately.
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">No simulation active</p>
                    <p className="text-[10px] text-muted-foreground">Click "Simulate" to forecast systemic patterns</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Widget 2: Control Effectiveness & Residual Risk Evaluator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Control Effectiveness &amp; Residual Risk Evaluator
                </CardTitle>
                <CardDescription>Adjust control strength metrics to calculate potential residual risk</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Slider 1 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">Preventive Control Strength</span>
                      <span className="text-primary font-bold">{preventiveStrength}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100"
                      value={preventiveStrength}
                      onChange={e => setPreventiveStrength(Number(e.target.value))}
                      className="w-full accent-primary bg-muted rounded-lg h-1"
                    />
                  </div>
                  {/* Slider 2 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">Detective Control Strength</span>
                      <span className="text-cyan-400 font-bold">{detectiveStrength}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100"
                      value={detectiveStrength}
                      onChange={e => setDetectiveStrength(Number(e.target.value))}
                      className="w-full accent-cyan-400 bg-muted rounded-lg h-1"
                    />
                  </div>
                  {/* Slider 3 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">Corrective Control Strength</span>
                      <span className="text-green-400 font-bold">{correctiveStrength}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100"
                      value={correctiveStrength}
                      onChange={e => setCorrectiveStrength(Number(e.target.value))}
                      className="w-full accent-green-400 bg-muted rounded-lg h-1"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="flex items-center gap-4">
                    {/* Visual Risk Metric Indicator */}
                    <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full border border-border/80 bg-card/50 flex-shrink-0">
                      <span className={`text-3xl font-black ${
                        residualRisk >= 60 ? 'text-red-400' : residualRisk >= 35 ? 'text-yellow-400' : 'text-green-400'
                      }`}>{residualRisk}</span>
                      <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Residual Risk</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-foreground">
                        Status:{' '}
                        <span className={residualRisk >= 60 ? 'text-red-400' : residualRisk >= 35 ? 'text-yellow-400' : 'text-green-400'}>
                          {residualRisk >= 60 ? 'CRITICAL - Action Required' : residualRisk >= 35 ? 'MODERATE - Monitor Closely' : 'OPTIMAL - Stabilized'}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {residualRisk >= 60
                          ? 'Gaps in preventive/detective controls present severe systemic vulnerability. Immediately audit related SOPs and configure escalation overrides.'
                          : residualRisk >= 35
                          ? 'Controls are functional but optimization is advised. Monitor UMAP clusters for rising density in the root-cause analysis.'
                          : 'Residual risk is fully calibrated and well within acceptable thresholds. Log active effectiveness metrics in the Root Cause Analysis module.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Widget 3: Lessons Learned Drafting Assistant */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" /> Lessons Learned Drafting Assistant
                </CardTitle>
                <CardDescription>Synthesize findings from pattern analysis into documented lessons learned</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase font-semibold">Incident Cluster Reference</label>
                      <input
                        value={assistantCluster}
                        onChange={e => setAssistantCluster(e.target.value)}
                        placeholder="e.g. Cluster 1 (Infrastructure outages)"
                        className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase font-semibold">Key Analyst Findings / Notes</label>
                      <textarea
                        value={findingsInput}
                        onChange={e => setFindingsInput(e.target.value)}
                        placeholder="Type raw notes, systemic patterns, or root cause details here..."
                        rows={4}
                        className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                      />
                    </div>
                    <button
                      onClick={generateDraft}
                      disabled={drafting}
                      className="w-full flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                    >
                      {drafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PenTool className="h-3.5 w-3.5" />}
                      Generate Draft Lessons Learned
                    </button>
                  </div>

                  <div className="border border-border rounded-lg bg-card/40 p-4 min-h-[200px] flex flex-col justify-between">
                    {draftResult ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-border/30">
                          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Generated Output</span>
                          <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground hover:underline transition-colors"
                          >
                            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                            {copied ? 'Copied' : 'Copy Text'}
                          </button>
                        </div>
                        <div className="text-xs text-foreground space-y-2 whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto pr-1">
                          {draftResult}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                        <PenTool className="h-8 w-8 text-muted-foreground/30 mb-2 animate-bounce" />
                        <p className="text-xs text-muted-foreground font-medium">Ready to write lessons learned</p>
                        <p className="text-[10px] text-muted-foreground max-w-[200px]">Fill out cluster details and findings to auto-draft SOP documentation</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
