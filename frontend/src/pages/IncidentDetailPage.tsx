import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, CheckCircle, Clock, FileText, Shield,
  Search, ClipboardCheck, XCircle, Brain, Loader2,
  Plus, ChevronRight,
} from 'lucide-react'
import { incidentsApi, aiApi } from '@/lib/api'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast }    from '@/components/ui/toaster'
import { severityClass, statusClass, formatDateTime } from '@/lib/utils'
import type { SimilarIncident } from '@/types'

type Tab = 'overview' | 'actions' | 'investigation' | 'root-cause' | 'controls' | 'review' | 'close'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',      label: 'Overview',      icon: FileText },
  { id: 'actions',       label: 'Actions',        icon: ClipboardCheck },
  { id: 'investigation', label: 'Investigation',  icon: Search },
  { id: 'root-cause',    label: 'Root Cause',     icon: Shield },
  { id: 'controls',      label: 'Controls',       icon: Shield },
  { id: 'review',        label: 'Review',         icon: CheckCircle },
  { id: 'close',         label: 'Close',          icon: XCircle },
]

export default function IncidentDetailPage() {
  const { id }      = useParams<{ id: string }>()
  const incId       = parseInt(id!)
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const [tab,       setTab]       = useState<Tab>('overview')
  const [similar,   setSimilar]   = useState<SimilarIncident[] | null>(null)
  const [simLoad,   setSimLoad]   = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['incident', incId],
    queryFn:  () => incidentsApi.get(incId),
  })
  const { data: tlData } = useQuery({
    queryKey: ['timeline', incId],
    queryFn:  () => incidentsApi.getTimeline(incId),
  })

  const inc = data?.data.data

  // ── Action form ──────────────────────────────────────────────────────────
  const [actText,   setActText]   = useState('')
  const [actStatus, setActStatus] = useState('PENDING')
  const addActionMut = useMutation({
    mutationFn: () => incidentsApi.addAction(incId, { actionTaken: actText, status: actStatus as any }),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['incident', incId] })
      toast({ title: 'Action added', variant: 'success' })
      setActText('')
    },
    onError: () => toast({ title: 'Failed to add action', variant: 'destructive' }),
  })

  // ── Investigation form ───────────────────────────────────────────────────
  const [invFindings, setInvFindings] = useState(inc?.investigation?.findings ?? '')
  const [invEvidence, setInvEvidence] = useState(inc?.investigation?.evidence ?? '')
  const addInvMut = useMutation({
    mutationFn: () => incidentsApi.addInvestigation(incId, { findings: invFindings, evidence: invEvidence }),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['incident', incId] }); toast({ title: 'Investigation saved', variant: 'success' }) },
    onError:    () => toast({ title: 'Failed', variant: 'destructive' }),
  })

  // ── Root cause form ──────────────────────────────────────────────────────
  const [rcCat,   setRcCat]   = useState(inc?.rootCause?.rootCauseCategory ?? '')
  const [rcDesc,  setRcDesc]  = useState(inc?.rootCause?.description ?? '')
  const [rcFactors, setRcFactors] = useState(inc?.rootCause?.contributingFactors ?? '')
  const addRcMut = useMutation({
    mutationFn: () => incidentsApi.addRootCause(incId, { rootCauseCategory: rcCat as any, description: rcDesc, contributingFactors: rcFactors }),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['incident', incId] }); toast({ title: 'Root cause saved', variant: 'success' }) },
    onError:    () => toast({ title: 'Failed', variant: 'destructive' }),
  })

  // ── Control form ─────────────────────────────────────────────────────────
  const [ctrlType, setCtrlType] = useState('Preventive')
  const [ctrlDesc, setCtrlDesc] = useState('')
  const addCtrlMut = useMutation({
    mutationFn: () => incidentsApi.addControl(incId, { controlType: ctrlType as any, description: ctrlDesc }),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['incident', incId] }); toast({ title: 'Control added', variant: 'success' }); setCtrlDesc('') },
    onError:    () => toast({ title: 'Failed', variant: 'destructive' }),
  })

  // ── Review form ──────────────────────────────────────────────────────────
  const [rvNotes,  setRvNotes]  = useState(inc?.review?.reviewNotes ?? '')
  const [rvRating, setRvRating] = useState(String(inc?.review?.effectivenessRating ?? ''))
  const addReviewMut = useMutation({
    mutationFn: () => incidentsApi.addReview(incId, { reviewNotes: rvNotes, effectivenessRating: parseInt(rvRating) || undefined }),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['incident', incId] }); toast({ title: 'Review saved', variant: 'success' }) },
    onError:    () => toast({ title: 'Failed', variant: 'destructive' }),
  })

  // ── Close form ───────────────────────────────────────────────────────────
  const [clSummary, setClSummary] = useState('')
  const [clLessons, setClLessons] = useState('')
  const closeMut = useMutation({
    mutationFn: () => incidentsApi.close(incId, {
      closureSummary: clSummary,
      lessonsLearned: clLessons,
      closureDate: new Date().toISOString().split('T')[0],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', incId] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast({ title: '✅ Incident closed successfully', variant: 'success' })
    },
    onError: (e: any) => toast({ title: e.response?.data?.error ?? 'Failed to close', variant: 'destructive' }),
  })

  // ── Similar incidents ────────────────────────────────────────────────────
  const loadSimilar = async () => {
    setSimLoad(true)
    try {
      const res = await aiApi.similar(incId)
      setSimilar(res.data.similar_incidents)
    } catch {
      toast({ title: 'AI service unavailable', variant: 'destructive' })
    } finally {
      setSimLoad(false)
    }
  }

  if (isLoading || !inc) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const timeline = tlData?.data.data ?? []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-foreground truncate">{inc.title}</h1>
            <span className={`text-xs px-2 py-0.5 font-medium ${severityClass(inc.severity)}`}>{inc.severity}</span>
            <span className={`text-xs px-2 py-0.5 font-medium ${statusClass(inc.status)}`}>{inc.status.replace('_', ' ')}</span>
            {inc.aiProcessed && <span className="text-xs text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-2 py-0.5">✦ AI Processed</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            #{inc.id} · Reported by {inc.reporter?.name ?? 'Unknown'} · {formatDateTime(inc.createdAt)}
          </p>
        </div>
        {inc.predictedRiskScore != null && (
          <div className="text-center px-4 py-2 rounded-xl bg-accent border border-border flex-shrink-0">
            <p className="text-xl font-bold text-primary">{inc.predictedRiskScore.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Risk Score</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-border/50">
        {TABS.map(({ id: tId, label, icon: Icon }) => (
          <button
            key={tId}
            onClick={() => setTab(tId)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap transition-colors ${
              tab === tId
                ? 'text-primary border-b-2 border-primary -mb-px bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">

          {/* ── OVERVIEW ─────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <Card>
              <CardHeader><CardTitle>Incident Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{inc.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Category',   inc.category   ?? '—'],
                    ['Department', inc.department  ?? '—'],
                    ['Location',   inc.location    ?? '—'],
                    ['Cluster ID', inc.clusterId   != null ? `Cluster ${inc.clusterId}` : 'Not clustered'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{k}</p>
                      <p className="text-sm text-foreground">{v}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── ACTIONS ──────────────────────────────────────────────── */}
          {tab === 'actions' && (
            <Card>
              <CardHeader><CardTitle>Immediate Actions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {inc.actions?.map(a => (
                    <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/40">
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${a.status === 'COMPLETED' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{a.actionTaken}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {a.status} · Priority: {a.priority}
                          {a.assignee && ` · Assigned to ${a.assignee.name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {!inc.actions?.length && <p className="text-sm text-muted-foreground text-center py-4">No actions recorded yet</p>}
                </div>
                {inc.status !== 'CLOSED' && (
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <Label>Add Action</Label>
                    <Textarea value={actText} onChange={e => setActText(e.target.value)} placeholder="Describe the action taken..." rows={3} />
                    <div className="flex gap-2">
                      <Select value={actStatus} onValueChange={setActStatus}>
                        <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={() => addActionMut.mutate()} disabled={!actText || addActionMut.isPending}>
                        {addActionMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Add</>}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── INVESTIGATION ─────────────────────────────────────────── */}
          {tab === 'investigation' && (
            <Card>
              <CardHeader><CardTitle>Investigation</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Findings</Label>
                  <Textarea value={invFindings} onChange={e => setInvFindings(e.target.value)} placeholder="Document investigation findings..." rows={4} disabled={inc.status === 'CLOSED'} />
                </div>
                <div className="space-y-2">
                  <Label>Evidence</Label>
                  <Textarea value={invEvidence} onChange={e => setInvEvidence(e.target.value)} placeholder="List evidence collected..." rows={3} disabled={inc.status === 'CLOSED'} />
                </div>
                {inc.status !== 'CLOSED' && (
                  <Button onClick={() => addInvMut.mutate()} disabled={addInvMut.isPending}>
                    {addInvMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Investigation'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── ROOT CAUSE ────────────────────────────────────────────── */}
          {tab === 'root-cause' && (
            <Card>
              <CardHeader><CardTitle>Root Cause Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Root Cause Category</Label>
                  <Select value={rcCat} onValueChange={setRcCat} disabled={inc.status === 'CLOSED'}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {['Human Error','System Failure','Process Gap','External Factor','Equipment Failure','Unknown'].map(c =>
                        <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={rcDesc} onChange={e => setRcDesc(e.target.value)} placeholder="Describe the root cause..." rows={4} disabled={inc.status === 'CLOSED'} />
                </div>
                <div className="space-y-2">
                  <Label>Contributing Factors</Label>
                  <Textarea value={rcFactors} onChange={e => setRcFactors(e.target.value)} placeholder="List contributing factors..." rows={3} disabled={inc.status === 'CLOSED'} />
                </div>
                {inc.status !== 'CLOSED' && (
                  <Button onClick={() => addRcMut.mutate()} disabled={!rcCat || !rcDesc || addRcMut.isPending}>
                    {addRcMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Root Cause'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── CONTROLS ──────────────────────────────────────────────── */}
          {tab === 'controls' && (
            <Card>
              <CardHeader><CardTitle>Control Measures</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {inc.controls?.map(c => (
                  <div key={c.id} className="p-3 rounded-lg bg-accent/40">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary border border-primary/25 bg-primary/10 rounded-full px-2 py-0.5">{c.controlType}</span>
                      <span className="text-xs text-muted-foreground">{c.status}</span>
                    </div>
                    <p className="text-sm text-foreground">{c.description}</p>
                  </div>
                ))}
                {!inc.controls?.length && <p className="text-sm text-muted-foreground text-center py-4">No controls added yet</p>}
                {inc.status !== 'CLOSED' && (
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <div className="flex gap-2">
                      <Select value={ctrlType} onValueChange={setCtrlType}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Preventive">Preventive</SelectItem>
                          <SelectItem value="Detective">Detective</SelectItem>
                          <SelectItem value="Corrective">Corrective</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea value={ctrlDesc} onChange={e => setCtrlDesc(e.target.value)} placeholder="Describe the control measure..." rows={3} />
                    <Button onClick={() => addCtrlMut.mutate()} disabled={!ctrlDesc || addCtrlMut.isPending}>
                      {addCtrlMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Add Control</>}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── REVIEW ────────────────────────────────────────────────── */}
          {tab === 'review' && (
            <Card>
              <CardHeader><CardTitle>Management Review</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Review Notes</Label>
                  <Textarea value={rvNotes} onChange={e => setRvNotes(e.target.value)} placeholder="Document the review findings and outcomes..." rows={5} disabled={inc.status === 'CLOSED'} />
                </div>
                <div className="space-y-2">
                  <Label>Effectiveness Rating (1–5)</Label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button"
                        onClick={() => setRvRating(String(n))}
                        className={`h-10 w-10 rounded-lg text-sm font-bold border transition-colors ${
                          rvRating === String(n)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-accent border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >{n}</button>
                    ))}
                  </div>
                </div>
                {inc.status !== 'CLOSED' && (
                  <Button onClick={() => addReviewMut.mutate()} disabled={!rvNotes || addReviewMut.isPending}>
                    {addReviewMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Review'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── CLOSE ─────────────────────────────────────────────────── */}
          {tab === 'close' && (
            <Card>
              <CardHeader><CardTitle>Close Incident</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {inc.status === 'CLOSED' ? (
                  <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/25 p-4 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Incident Closed</p>
                      <p className="text-xs opacity-80 mt-0.5">{inc.closure?.closureSummary}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {!inc.review && (
                      <div className="flex items-center gap-3 rounded-lg bg-yellow-500/10 border border-yellow-500/25 p-3 text-yellow-400 text-sm">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        Complete the Review tab before closing this incident.
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Closure Summary <span className="text-destructive">*</span></Label>
                      <Textarea value={clSummary} onChange={e => setClSummary(e.target.value)} placeholder="Summarize how the incident was resolved..." rows={4} />
                    </div>
                    <div className="space-y-2">
                      <Label>Lessons Learned</Label>
                      <Textarea value={clLessons} onChange={e => setClLessons(e.target.value)} placeholder="What did the team learn from this incident?" rows={3} />
                    </div>
                    <Button
                      onClick={() => closeMut.mutate()}
                      disabled={!clSummary || closeMut.isPending}
                      variant="destructive"
                      className="w-full"
                    >
                      {closeMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔒 Close Incident'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-0">
              {timeline.slice(0, 6).map((ev, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-border/50 my-1" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-xs font-medium text-foreground">{ev.type.replace('_', ' ')}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(ev.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {!timeline.length && <p className="text-xs text-muted-foreground">No events yet</p>}
            </CardContent>
          </Card>

          {/* AI Similar Incidents */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-primary" /> Similar Incidents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {similar === null ? (
                <Button variant="outline" size="sm" className="w-full" onClick={loadSimilar} disabled={!inc.aiProcessed || simLoad}>
                  {simLoad ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Find Similar'}
                  {!inc.aiProcessed && ' (Process incident first)'}
                </Button>
              ) : similar.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No similar incidents found</p>
              ) : (
                similar.map(s => (
                  <Link key={s.incident_id} to={`/incidents/${s.incident_id}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{s.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.severity} · {(s.similarity_score * 100).toFixed(0)}% match
                      </p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
