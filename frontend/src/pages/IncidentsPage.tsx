import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Search, Plus, Filter, Download, Trash2,
  Eye, AlertTriangle, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { incidentsApi } from '@/lib/api'
import { Button }  from '@/components/ui/button'
import { Input }   from '@/components/ui/input'
import { Badge }   from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast }   from '@/components/ui/toaster'
import { severityClass, statusClass, formatDate, downloadBlob } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type { Incident } from '@/types'

const LIMIT = 10

export default function IncidentsPage() {
  const user        = useAuthStore(s => s.user)
  const queryClient = useQueryClient()

  const [page,       setPage]       = useState(1)
  const [search,     setSearch]     = useState('')
  const [status,     setStatus]     = useState('')
  const [severity,   setSeverity]   = useState('')
  const [department, setDepartment] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', page, search, status, severity, department],
    queryFn:  () => incidentsApi.list({ page, limit: LIMIT, search, status, severity, department }),
    placeholderData: (prev) => prev,
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => incidentsApi.delete(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      toast({ title: 'Incident deleted', variant: 'success' })
    },
    onError: () => toast({ title: 'Failed to delete', variant: 'destructive' }),
  })

  const handleExport = async () => {
    const res = await incidentsApi.export({ search, status, severity })
    downloadBlob(new Blob([res.data as any], { type: 'text/csv' }), 'incidents.csv')
    toast({ title: 'Export downloaded', variant: 'success' })
  }

  const incidents: Incident[] = data?.data.data ?? []
  const meta = data?.data.meta

  const clearFilters = () => { setSearch(''); setStatus(''); setSeverity(''); setDepartment(''); setPage(1) }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Incidents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {meta?.total ?? 0} total incidents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          {user?.role !== 'risk_analyst' && (
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/incidents/new">
                <Plus className="h-3.5 w-3.5" /> New Incident
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search incidents..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>

            <Select value={status || 'all'} onValueChange={v => { setStatus(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="w-[145px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severity || 'all'} onValueChange={v => { setSeverity(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="w-[135px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>

            {(search || status || severity) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-0 px-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : incidents.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3 text-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No incidents found</p>
              {user?.role !== 'risk_analyst' && (
                <Button asChild size="sm">
                  <Link to="/incidents/new">Create your first incident</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    {['ID', 'Title', 'Severity', 'Status', 'Category', 'Department', 'Reporter', 'Date', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {incidents.map(inc => (
                    <tr key={inc.id} className="hover:bg-accent/30 transition-colors group">
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">#{inc.id}</td>
                      <td className="px-4 py-3 max-w-[240px]">
                        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {inc.title}
                        </p>
                        {inc.aiProcessed && (
                          <span className="text-[10px] text-cyan-400">✦ AI processed</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 font-medium ${severityClass(inc.severity)}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 font-medium ${statusClass(inc.status)}`}>
                          {inc.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{inc.category ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inc.department ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inc.reporter?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(inc.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                            <Link to={`/incidents/${inc.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                          </Button>
                          {(user?.role === 'admin' || user?.role === 'incident_manager') && (
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => { if (confirm('Delete this incident?')) deleteMut.mutate(inc.id) }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, meta.total)} of {meta.total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex h-8 items-center px-3 text-xs rounded-md bg-card border border-border">
              {page} / {meta.pages}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= meta.pages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
