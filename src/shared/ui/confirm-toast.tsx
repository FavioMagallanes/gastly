import { toast } from 'sonner'

interface ConfirmToastOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Variant del botón de confirmar: 'danger' (rojo) o 'dark' (negro) */
  variant?: 'danger' | 'dark'
  onConfirm: () => void
  onCancel?: () => void
}

const VARIANT_STYLES = {
  danger: 'text-white bg-danger rounded-lg hover:bg-danger-hover',
  dark: 'text-white bg-ds-text dark:bg-dark-text dark:text-dark-bg rounded-lg hover:bg-ds-text/90 dark:hover:bg-dark-text/90',
}

/**
 * Muestra un toast de confirmación con botones Cancelar / Confirmar.
 * Reemplaza el patrón repetido de `toast.custom()` con JSX inline.
 */
export const confirmToast = ({
  title,
  description = 'Esta acción no se puede deshacer.',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmToastOptions) => {
  toast.custom(
    id => (
      <div className="w-89 bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-ds-border dark:border-dark-border p-5 flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-ds-text dark:text-dark-text">{title}</p>
          {description && (
            <p className="text-xs text-ds-secondary dark:text-dark-secondary mt-1">{description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              toast.dismiss(id)
              onCancel?.()
            }}
            className="flex-1 h-9 text-[13px] font-medium text-ds-secondary dark:text-dark-secondary border border-ds-border dark:border-dark-border rounded-lg hover:bg-surface dark:hover:bg-dark-hover transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(id)
              onConfirm()
            }}
            className={`flex-1 h-9 text-[13px] font-semibold transition-colors cursor-pointer ${VARIANT_STYLES[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ),
    { duration: 10000 },
  )
}
