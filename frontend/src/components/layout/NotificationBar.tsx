import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, X } from 'lucide-react'
import { incidentsApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'

const STORAGE_KEY = 'ims_last_seen_incident_id'

export default function NotificationBar() {
  const user = useAuthStore(s => s.user)
  const [showNotification, setShowNotification] = useState(false)
  const [newIncident, setNewIncident] = useState<any>(null)
  const isFirstLoad = useRef(true)

  const { data } = useQuery({
    queryKey: ['notif-latest-incident'],
    queryFn: () => incidentsApi.list({ limit: 1 }),
    refetchInterval: 8000,
    enabled: user?.role === 'incident_manager',
  })

  useEffect(() => {
    if (!data?.data?.data || data.data.data.length === 0) return

    const latest = data.data.data[0]
    const latestId = latest.id
    const savedId = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)

    if (isFirstLoad.current) {
      // On first data load: if nothing saved yet, save current. If saved, compare.
      isFirstLoad.current = false
      if (savedId === 0) {
        // No history, just save current as baseline
        localStorage.setItem(STORAGE_KEY, String(latestId))
      } else if (latestId > savedId) {
        // New incident(s) arrived since last session
        localStorage.setItem(STORAGE_KEY, String(latestId))
        setNewIncident(latest)
        setShowNotification(true)
      }
    } else {
      // Subsequent polls
      if (latestId > (savedId || 0)) {
        localStorage.setItem(STORAGE_KEY, String(latestId))
        setNewIncident(latest)
        setShowNotification(true)
      }
    }
  }, [data])

  const dismiss = () => setShowNotification(false)

  if (user?.role !== 'incident_manager') return null
  if (!showNotification || !newIncident) return null

  return (
    <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shadow-lg z-50 flex-shrink-0 border-b border-primary/30">
      <div className="flex items-center gap-3">
        <div className="bg-primary-foreground/20 p-1.5 rounded-full animate-pulse">
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight">
            🚨 New Incident Reported: {newIncident.title}
          </p>
          <p className="text-xs opacity-80 mt-0.5">
            By {newIncident.reporter?.name ?? 'Unknown'} · {newIncident.severity} severity · Just now
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <Link
          to={`/incidents/${newIncident.id}`}
          onClick={dismiss}
          className="bg-primary-foreground text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-foreground/90 transition-colors whitespace-nowrap"
        >
          View Incident →
        </Link>
        <button
          onClick={dismiss}
          className="p-1.5 hover:bg-primary-foreground/20 rounded-md transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
