import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Brain, Activity, CheckCircle2, XCircle,
  RefreshCw, GitBranch, Target, Loader2,
  Database, Play, Sparkles, AlertCircle,
  ChevronRight,
} from 'lucide-react'
import {
  ScatterChart, Scatter as ReScatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { aiApi } from '@/lib/api'
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
  const qc = useQueryClient()
  const [pipelineMsg, setPipelineMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

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
    </div>
  )
}
