import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  TrendingUp, AlertTriangle, Building2, Tag,
  Loader2, Flame, ShieldAlert, Activity, Zap,
  ChevronRight, BarChart3, Calendar, Award, FileText,
  Briefcase,
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { incidentsApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ROOT_CAUSE_COLORS: Record<string, string> = {
  'Human Error': '#f97316',       // Orange
  'System Failure': '#3b82f6',    // Blue
  'Process Gap': '#a855f7',       // Purple
  'Equipment Failure': '#ef4444', // Red
  'External Factor': '#06b6d4',   // Cyan
  'Unknown': '#64748b',           // Slate
}

export default function RootCausePage() {
  const [dateRange, setDateRange] = useState('ALL')
  const [department, setDepartment] = useState('')
  const [severity, setSeverity] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Compute startDate based on filter
  const getStartDate = () => {
    if (dateRange === 'ALL') return undefined
    const now = new Date()
    if (dateRange === '30D') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    if (dateRange === '3M') return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
    if (dateRange === '6M') return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString()
    return undefined
  }

  const { data: response, isLoading } = useQuery({
    queryKey: ['root-cause-analytics', dateRange, department, severity],
    queryFn: () => incidentsApi.getRootCauseAnalytics({
      startDate: getStartDate(),
      department: department || undefined,
      severity: severity || undefined
    })
  })

  const metrics = response?.data?.data
  const totalIncidents = metrics?.totalIncidents ?? 0
  const mostCommonRootCause = metrics?.mostCommonRootCause ?? 'None'
  const highestIncrease = metrics?.highestIncrease ?? { category: 'None', percentage: 0 }
  const distribution = metrics?.distribution ?? []

  // Default to selecting the largest category
  const activeCategoryName = selectedCategory || (distribution.length > 0 ? distribution[0].category : null)
  const activeData = distribution.find((d: any) => d.category === activeCategoryName)

  // Color scheme helpers
  const getRecommendationText = (cat: string) => {
    if (cat === 'Human Error') {
      return 'Conduct additional staff training and review standard operating procedures (SOPs).'
    }
    if (cat === 'System Failure') {
      return 'Upgrade redundant infrastructure, review automated alert thresholds, and scale database resources.'
    }
    if (cat === 'Process Gap') {
      return 'Formalize change management procedures, enforce mandatory peer-reviews, and build strict compliance checklists.'
    }
    if (cat === 'Equipment Failure') {
      return 'Adhere strictly to the preventive maintenance schedule and replace end-of-life hardware.'
    }
    if (cat === 'External Factor') {
      return 'Diversify supplier base and implement high-availability contingency plans.'
    }
    return 'Perform full incident audits to identify structural patterns and key learning outcomes.'
  }

  // Formatting chart data
  const chartData = distribution.map((d: any) => ({
    name: d.category,
    value: d.count,
    percentage: d.percentage,
    fill: ROOT_CAUSE_COLORS[d.category] || ROOT_CAUSE_COLORS['Unknown']
  }))

  return (
    <div className="space-y-8">
      {/* ── Title ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-primary" /> Root Cause Analysis Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore historical breakdowns, identify critical failure vectors, and review AI-driven organizational health trends.
        </p>
      </div>

      {/* ── Filters Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 bg-card/30 p-3 rounded-xl border border-border/50 backdrop-blur-md">
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value)
              setSelectedCategory(null)
            }}
            className="text-xs bg-background border border-border rounded px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Time</option>
            <option value="30D">Last 30 Days</option>
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value)
              setSelectedCategory(null)
            }}
            className="text-xs bg-background border border-border rounded px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Facilities">Facilities</option>
            <option value="Security">Security</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value)
              setSelectedCategory(null)
            }}
            className="text-xs bg-background border border-border rounded px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Severities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading root cause metrics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* ── KPI Grid ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Incidents */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/5 opacity-50" />
              <CardContent className="pt-5 pb-4 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Incidents Analyzed</p>
                    <p className="text-3xl font-black mt-1 text-blue-400">{totalIncidents}</p>
                  </div>
                  <div className="rounded-xl p-2 bg-blue-500/10">
                    <Activity className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Most Common Root Cause */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-orange-500/5 opacity-50" />
              <CardContent className="pt-5 pb-4 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Biggest Problem Driver</p>
                    <p className="text-xl font-bold mt-1 text-orange-400 truncate max-w-[200px]">
                      {mostCommonRootCause}
                    </p>
                  </div>
                  <div className="rounded-xl p-2 bg-orange-500/10">
                    <Flame className="h-5 w-5 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Highest Upward Trend */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-500/5 opacity-50" />
              <CardContent className="pt-5 pb-4 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Highest Upward Trend</p>
                    <p className="text-xl font-bold mt-1 text-purple-400 truncate max-w-[200px]">
                      {highestIncrease.category !== 'None' ? (
                        <>
                          {highestIncrease.category} <span className="text-xs font-semibold">(+{highestIncrease.percentage}%)</span>
                        </>
                      ) : (
                        'Stable'
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl p-2 bg-purple-500/10">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── AI Trend & Recommendations ────────────────────────────── */}
          {highestIncrease.category !== 'None' && highestIncrease.percentage > 0 && (
            <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md animate-fade-in flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-emerald-300">
                  AI Trend Analysis: {highestIncrease.category} incidents increased by {highestIncrease.percentage}% during the last 3 months.
                </p>
                <p className="text-xs text-emerald-400/80">
                  <span className="font-semibold text-emerald-400">Recommended Action:</span> {getRecommendationText(highestIncrease.category)}
                </p>
              </div>
            </div>
          )}

          {/* ── Main Dashboard: Donut Chart + Breakdown List ────────────── */}
          {totalIncidents === 0 ? (
            <Card className="border-dashed py-16 flex flex-col items-center justify-center text-center">
              <ShieldAlert className="h-12 w-12 text-muted-foreground/60 mb-3" />
              <h3 className="text-lg font-semibold text-foreground">No data found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                No incidents with resolved root causes match your selected filters. Try broadening your criteria.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Left Panel: Donut Chart */}
              <Card className="bg-card/30 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" /> Root Cause Distribution
                  </CardTitle>
                  <CardDescription>Click a segment to inspect subcategories and incident details</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-around gap-6 py-6">
                  {/* Recharts Pie Chart */}
                  <div className="h-[200px] w-[200px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          onClick={(data) => setSelectedCategory(data.name)}
                          className="cursor-pointer"
                        >
                          {chartData.map((entry: any, index: number) => (
                            <Cell
                              key={index}
                              fill={entry.fill}
                              stroke={activeCategoryName === entry.name ? '#ffffff' : 'transparent'}
                              strokeWidth={activeCategoryName === entry.name ? 1.5 : 0}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const p = payload[0].payload
                            return (
                              <div className="bg-background/90 border border-border px-2.5 py-1.5 rounded shadow text-[10px] text-foreground font-semibold">
                                {p.name}: {p.value} ({p.percentage}%)
                              </div>
                            )
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-2 w-full max-w-xs">
                    {distribution.map((d: any) => {
                      const color = ROOT_CAUSE_COLORS[d.category] || ROOT_CAUSE_COLORS['Unknown']
                      const isActive = activeCategoryName === d.category
                      return (
                        <button
                          key={d.category}
                          onClick={() => setSelectedCategory(d.category)}
                          className={`w-full flex items-center justify-between text-left p-2 rounded-lg text-xs transition-all ${
                            isActive ? 'bg-primary/10 border border-primary/20 text-foreground' : 'hover:bg-accent/40 text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-3.5 w-3.5 rounded-full flex-shrink-0" style={{ background: color }} />
                            <span className="font-medium truncate max-w-[130px]">{d.category}</span>
                          </div>
                          <span className="font-semibold tabular-nums">{d.count} ({d.percentage}%)</span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Right Panel: Drill Down Details */}
              {activeData && (
                <Card className="bg-card/30 border-border/50 backdrop-blur-sm flex flex-col justify-between">
                  <CardHeader className="pb-3 border-b border-border/30">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-base text-foreground font-bold">
                          Subcategory Breakdown: {activeData.category}
                        </CardTitle>
                        <CardDescription>Incident categories mapping to this root cause</CardDescription>
                      </div>
                      <Badge className="text-xs" style={{ background: ROOT_CAUSE_COLORS[activeData.category] }}>
                        {activeData.count} Incidents
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-5 flex-1">
                    {/* Subcategories (Incident categories) progress list */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" /> Contributing Incident Categories
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {activeData.subcategories.map((sub: any) => {
                          const pct = Math.round((sub.count / activeData.count) * 100)
                          return (
                            <div key={sub.name} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-medium text-foreground">
                                <span>{sub.name}</span>
                                <span className="text-muted-foreground">{sub.count} ({pct}%)</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${pct}%`,
                                    background: ROOT_CAUSE_COLORS[activeData.category]
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Recent Incident Lists */}
                    <div className="space-y-2 border-t border-border/30 pt-4">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5 mb-2">
                        <FileText className="h-3.5 w-3.5" /> Recent Incidents (Top 5)
                      </p>
                      <div className="space-y-1.5">
                        {activeData.incidents.map((inc: any) => (
                          <Link key={inc.id} to={`/incidents/${inc.id}`} className="block">
                            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/40 border border-transparent hover:border-border/30 transition-all cursor-pointer">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-foreground truncate">{inc.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[9px] font-mono text-muted-foreground">#{inc.id}</span>
                                  {inc.department && (
                                    <span className="text-[9px] text-cyan-400">{inc.department}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <Badge variant="outline" className={`text-[9px] px-1 py-0 ${
                                  inc.severity === 'CRITICAL' ? 'text-red-400 border-red-500/20 bg-red-500/5' :
                                  inc.severity === 'HIGH' ? 'text-orange-400 border-orange-500/20 bg-orange-500/5' :
                                  inc.severity === 'MEDIUM' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' :
                                  'text-blue-400 border-blue-500/20 bg-blue-500/5'
                                }`}>
                                  {inc.severity}
                                </Badge>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
