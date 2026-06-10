import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, BookOpen, Compass, Eye, ShieldAlert, Award, FileText, BarChart } from 'lucide-react'
import { incidentsApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default function LessonsLibraryPage() {
  const [search, setSearch] = useState('')

  const { data: response, isLoading } = useQuery({
    queryKey: ['lessons-learned', search],
    queryFn: () => incidentsApi.getLessonsLearned(search)
  })

  const incidents = response?.data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Lessons Learned Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore historical lessons, root causes, and solutions extracted from closed incidents.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <Award className="h-4 w-4 flex-shrink-0" />
          <span>{incidents.length} Lessons Archived</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 max-w-md bg-card/30 p-1 rounded-lg border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons, categories, or keywords..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : incidents.length === 0 ? (
        <Card className="border-dashed py-16 flex flex-col items-center justify-center text-center">
          <Compass className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-lg font-semibold text-foreground">No lessons archived yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {search ? 'No results match your search query. Try another keyword.' : 'Once incidents are closed with "Lessons Learned" details, they will automatically populate here.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {incidents.map(inc => {
            const dateStr = inc.createdAt ? format(new Date(inc.createdAt), 'MMM d, yyyy') : 'N/A'
            return (
              <Card key={inc.id} className="group relative overflow-hidden bg-card/30 hover:bg-card/50 border-border/50 hover:border-primary/20 transition-all duration-300 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-border/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground border-border/50">
                          #{inc.id}
                        </Badge>
                        {inc.category && (
                          <Badge variant="secondary" className="text-[10px] uppercase font-medium bg-primary/10 text-primary border-primary/20">
                            {inc.category}
                          </Badge>
                        )}
                        {inc.department && (
                          <Badge variant="outline" className="text-[10px] uppercase font-medium text-cyan-400 border-cyan-500/20 bg-cyan-500/5">
                            {inc.department}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mt-1">
                        {inc.title}
                      </CardTitle>
                    </div>
                    <Badge className={`text-xs capitalize font-medium ${
                      inc.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      inc.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      inc.severity === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {inc.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Description */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Incident Details
                    </span>
                    <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                      {inc.description}
                    </p>
                  </div>

                  {/* Root Cause (if exists) */}
                  {inc.rootCause && (
                    <div className="p-3 rounded-lg bg-accent/20 border border-border/30 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        <ShieldAlert className="h-3.5 w-3.5 text-orange-400/80" />
                        <span>Root Cause Category: {inc.rootCause.rootCauseCategory}</span>
                      </div>
                      <p className="text-xs text-foreground/70 leading-relaxed">
                        {inc.rootCause.description}
                      </p>
                    </div>
                  )}

                  {/* Lessons Learned Box */}
                  <div className="p-4 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 transition-colors duration-200">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                      <Award className="h-4.5 w-4.5" />
                      <span className="text-xs uppercase tracking-wider">Lessons Learned & Actionable Recommendations</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {inc.closure?.lessonsLearned}
                    </p>
                    {inc.closure?.closureSummary && (
                      <div className="mt-2 pt-2 border-t border-emerald-500/10 text-xs text-emerald-400/70 italic">
                        Closure Summary: {inc.closure.closureSummary}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-border/30 pt-3 text-xs text-muted-foreground">
                    <span>Archived on {dateStr}</span>
                    <Link to={`/incidents/${inc.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        View Incident
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
