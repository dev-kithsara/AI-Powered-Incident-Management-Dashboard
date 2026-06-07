import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const severityClass = (s: string): string =>
  ({ LOW: 'severity-low', MEDIUM: 'severity-medium', HIGH: 'severity-high', CRITICAL: 'severity-critical' }[s] ?? 'severity-low')

export const statusClass = (s: string): string =>
  ({ OPEN: 'status-open', IN_PROGRESS: 'status-in_progress', UNDER_REVIEW: 'status-under_review', CLOSED: 'status-closed' }[s] ?? 'status-open')

export const roleClass = (r: string): string =>
  ({
    admin:            'text-red-400     bg-red-500/10     border-red-500/30',
    incident_manager: 'text-orange-400  bg-orange-500/10  border-orange-500/30',
    investigator:     'text-violet-400  bg-violet-500/10  border-violet-500/30',
    risk_analyst:     'text-cyan-400    bg-cyan-500/10    border-cyan-500/30',
    safety_officer:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    staff:            'text-blue-400    bg-blue-500/10    border-blue-500/30',
  }[r] ?? 'text-blue-400 bg-blue-500/10 border-blue-500/30')

export const roleLabel = (r: string): string =>
  ({
    admin:            'Admin',
    incident_manager: 'Incident Manager',
    investigator:     'Investigator',
    risk_analyst:     'Risk Analyst',
    safety_officer:   'Safety Officer',
    staff:            'Staff',
  }[r] ?? r)

export const formatDate = (d: string | Date): string =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatDateTime = (d: string | Date): string =>
  new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href    = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
