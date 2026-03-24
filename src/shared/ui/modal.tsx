import { useEffect, useRef, useCallback } from 'react'
import { Icon } from './icon'

interface ModalProps {
  title: string
  icon: string
  onClose: () => void
  children: React.ReactNode
}

/**
 * Modal — Shell reutilizable para diálogos modales.
 * Backdrop + panel centrado + header con título, ícono y botón cerrar.
 * Incluye cierre con Escape y focus trap (WAI-ARIA).
 */
export const Modal = ({ title, icon, onClose, children }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null)

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Focus trap — atrapar Tab / Shift+Tab dentro del modal
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [])

  // Auto-focus al primer elemento focusable al montar
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const first = panel.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    first?.focus()
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className="relative z-10 w-full sm:max-w-md bg-white dark:bg-dark-surface border border-ds-border dark:border-dark-border rounded-xl shadow-xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ds-border dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Icon name={icon} size="xl" className="text-ds-secondary dark:text-dark-secondary" />
            <h2 className="text-base font-semibold text-ds-text dark:text-dark-text">{title}</h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={onClose}
            className="size-8 inline-flex items-center justify-center rounded-lg text-ds-secondary dark:text-dark-secondary hover:bg-surface dark:hover:bg-dark-hover hover:text-ds-text dark:hover:text-dark-text transition-colors"
          >
            <Icon name="cancel" size="xl" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
