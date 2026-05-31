import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastProvider  = ToastPrimitive.Provider
const ToastViewport  = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn('fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2', className)}
    {...props}
  />
))
ToastViewport.displayName = 'ToastViewport'

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & { variant?: 'default' | 'destructive' | 'success' }
>(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      'group pointer-events-auto relative flex w-full items-center justify-between',
      'overflow-hidden rounded-xl border p-4 shadow-2xl transition-all',
      'animate-slide-in-r',
      variant === 'destructive' && 'border-destructive/50 bg-destructive/20 text-destructive',
      variant === 'success'     && 'border-green-500/50  bg-green-500/20  text-green-400',
      variant === 'default'     && 'border-border bg-card text-foreground',
      className
    )}
    {...props}
  />
))
Toast.displayName = 'Toast'

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn('ml-4 shrink-0 rounded-md p-1 opacity-50 hover:opacity-100 transition-opacity', className)}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = 'ToastClose'

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
))
ToastTitle.displayName = 'ToastTitle'

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn('text-xs opacity-80', className)} {...props} />
))
ToastDescription.displayName = 'ToastDescription'

// ── Hook ───────────────────────────────────────────────────────────────────
type ToastData = {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

const toastListeners: Array<(t: ToastData) => void> = []

export const toast = (data: ToastData) => toastListeners.forEach(fn => fn(data))

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = React.useState<(ToastData & { id: number })[]>([])
  const counter = React.useRef(0)

  React.useEffect(() => {
    const handler = (t: ToastData) => {
      const id = ++counter.current
      setToasts(prev => [...prev, { ...t, id }])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000)
    }
    toastListeners.push(handler)
    return () => { const i = toastListeners.indexOf(handler); if (i > -1) toastListeners.splice(i, 1) }
  }, [])

  return (
    <ToastProvider>
      {toasts.map(t => (
        <Toast key={t.id} variant={t.variant}>
          <div>
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
