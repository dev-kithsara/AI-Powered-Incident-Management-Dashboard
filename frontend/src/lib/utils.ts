import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const severityClass = (s: string): string =>
  ({ LOW: 'severity-low', MEDIUM: 'severity-medium', HIGH: 'severity-high', CRITICAL: 'severity-critical' }[s] ?? 'severity-low')

export const statusClass = (s: string): string =>
  ({ OPEN: 'status-open', IN_PROGRESS: 'status-in_progress', UNDER_REVIEW: 'status-under_review', CLOSED: 'status-closed' }[s] ?? 'status-open')

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
