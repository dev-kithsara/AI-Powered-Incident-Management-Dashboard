import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Brain, AlertCircle } from 'lucide-react'
import { incidentsApi, aiApi } from '@/lib/api'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast }    from '@/components/ui/toaster'
import type { RiskPrediction, Severity } from '@/types'

const CATEGORIES   = ['Infrastructure', 'Security', 'Health & Safety', 'Software', 'Hardware', 'Process', 'Environmental', 'Other']
const DEPARTMENTS  = ['IT', 'Engineering', 'HR', 'Finance', 'Operations', 'Facilities', 'Legal', 'Management']

export default function CreateIncidentPage() {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()

  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [severity,    setSeverity]    = useState('')
  const [category,    setCategory]    = useState('')
  const [department,  setDepartment]  = useState('')
  const [location,    setLocation]    = useState('')
  const [riskPreview, setRiskPreview] = useState<RiskPrediction | null>(null)
  const [riskLoading, setRiskLoading] = useState(false)

  const createMut = useMutation({
    mutationFn: () => incidentsApi.create({ title, description, severity: severity as Severity, category, department, location }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast({ title: 'Incident created successfully!', variant: 'success' })
      navigate(`/incidents/${res.data.data.id}`)
    },
    onError: (err: any) => {
      toast({
        title:       'Failed to create incident',
        description: err.response?.data?.error ?? 'Please check all fields',
        variant:     'destructive',
      })
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!severity) { toast({ title: 'Please select a severity level', variant: 'destructive' }); return }
    createMut.mutate()
  }

  const handleAIPreview = async () => {
    if (!title || !description) {
      toast({ title: 'Enter title and description first', variant: 'destructive' })
      return
    }
    setRiskLoading(true)
    try {
      const res = await aiApi.predictRisk({ title, description, category, department })
      setRiskPreview(res.data)
    } catch {
      toast({ title: 'AI service unavailable', description: 'Risk preview not available', variant: 'destructive' })
    } finally {
      setRiskLoading(false)
    }
  }

  const riskColor = riskPreview
    ? riskPreview.risk_score >= 75 ? 'text-red-400'
    : riskPreview.risk_score >= 50 ? 'text-orange-400'
    : riskPreview.risk_score >= 25 ? 'text-yellow-400'
    : 'text-green-400'
    : ''

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Report New Incident</h1>
          <p className="text-sm text-muted-foreground">Fill in the details to log a new incident</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Brief, descriptive incident title"
                required minLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what happened, when it occurred, and its immediate impact..."
                rows={5}
                required minLength={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity <span className="text-destructive">*</span></Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">🟢 Low</SelectItem>
                    <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                    <SelectItem value="HIGH">🟠 High</SelectItem>
                    <SelectItem value="CRITICAL">🔴 Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Server Room B, Floor 3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Risk Preview */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> AI Risk Preview
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskPreview ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-accent/50">
                  <p className={`text-3xl font-bold ${riskColor}`}>
                    {riskPreview.risk_score.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Risk Score /100</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-accent/50">
                  <p className={`text-lg font-bold ${riskColor}`}>{riskPreview.risk_label}</p>
                  <p className="text-xs text-muted-foreground mt-1">Predicted Severity</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-accent/50">
                  <p className="text-lg font-bold text-foreground">
                    {(riskPreview.confidence * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Confidence</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg bg-accent/30 p-4 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Click below to get an AI-powered risk assessment before submitting.
              </div>
            )}
            <Button type="button" variant="outline" onClick={handleAIPreview} disabled={riskLoading} className="w-full">
              {riskLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              {riskLoading ? 'Analysing...' : 'Get AI Risk Prediction'}
            </Button>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMut.isPending} className="min-w-[160px]">
            {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Incident'}
          </Button>
        </div>
      </form>
    </div>
  )
}
