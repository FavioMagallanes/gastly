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
 */
export const Modal = ({ title, icon, onClose, children }: ModalProps) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label={title}
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
  >
    <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
    <div className="relative z-10 w-full sm:max-w-md bg-white dark:bg-dark-surface border border-ds-border dark:border-dark-border rounded-xl shadow-xl">
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
