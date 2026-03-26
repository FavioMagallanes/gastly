import { toast } from 'sonner'
import { cn } from '../../core/utils/cn'

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

/**
 * Muestra un toast de confirmación con botones Cancelar / Confirmar.
 * Alineado con la estética 'The Digital Ledger'.
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
      <div className="w-full max-w-90 bg-white dark:bg-dark-surface rounded-none shadow-2xl border border-ds-border dark:border-dark-border p-5 flex flex-col gap-5 animate-fade-in-up">
        <div className="space-y-1.5">
          <p className="text-[13px] font-bold text-ds-text dark:text-dark-text uppercase tracking-tight">
            {title}
          </p>
          {description && (
            <p className="text-[11px] text-ds-secondary dark:text-dark-secondary uppercase tracking-wide leading-relaxed opacity-80">
              {description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              toast.dismiss(id)
              onCancel?.()
            }}
            className="flex-1 h-9 text-[11px] font-bold uppercase tracking-widest text-ds-secondary dark:text-dark-secondary border border-ds-border dark:border-dark-border rounded-none hover:bg-surface dark:hover:bg-dark-hover transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(id)
              onConfirm()
            }}
            className={cn(
              'flex-1 h-9 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none text-white',
              variant === 'danger'
                ? 'bg-danger hover:bg-danger-hover'
                : 'bg-ds-text dark:bg-dark-text dark:text-dark-bg hover:opacity-90',
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ),
    { duration: Infinity },
  )
}
