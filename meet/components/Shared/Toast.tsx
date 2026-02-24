'use client'

import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={16} className="text-[#498205]" />,
  error: <AlertCircle size={16} className="text-[#a4262c]" />,
  info: <Info size={16} className="text-[#0078d4]" />,
}

const borderColors: Record<ToastType, string> = {
  success: 'border-l-[#498205]',
  error: 'border-l-[#a4262c]',
  info: 'border-l-[#0078d4]',
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-3 bg-white rounded-md shadow-lg border border-[#e1dfdd] border-l-4 min-w-[300px] animate-[slideIn_0.2s_ease-out]',
        borderColors[toast.type]
      )}
    >
      {icons[toast.type]}
      <span className="flex-1 text-sm text-[#242424]">{toast.message}</span>
      <button onClick={onClose} className="p-0.5 rounded hover:bg-[#f3f2f1] text-[#a19f9d]">
        <X size={14} />
      </button>
    </div>
  )
}
