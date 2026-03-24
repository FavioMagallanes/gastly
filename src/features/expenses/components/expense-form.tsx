import { forwardRef } from 'react'
import { useExpenseFormContext } from '../context/expense-form-context'
import { CategoryPicker } from './category-picker'
import { Button } from '../../../shared/ui/button'
import { Icon } from '../../../shared/ui/icon'

const Field = ({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-ds-secondary dark:text-dark-secondary uppercase tracking-widest">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

const StitchInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: string; prefix?: string }
>(({ error, prefix, ...props }, ref) => (
  <div
    className={`flex items-center border rounded-lg bg-surface dark:bg-dark-surface px-3 py-2.5 transition-all focus-within:ring-1 focus-within:ring-primary/50 ${error ? 'border-red-400' : 'border-ds-border dark:border-dark-border'}`}
  >
    {prefix && (
      <span className="text-ds-secondary dark:text-dark-secondary mr-2 text-sm">{prefix}</span>
    )}
    <input
      ref={ref}
      {...props}
      className="w-full bg-transparent border-none p-0 outline-none text-ds-text dark:text-dark-text font-medium text-sm placeholder:text-ds-secondary/60 dark:placeholder:text-dark-secondary/60 placeholder:font-normal"
    />
  </div>
))
StitchInput.displayName = 'StitchInput'

/**
 * ExpenseForm — Lee todo del contexto (ExpenseFormContext).
 * Solo recibe `onCancel` como prop porque varía según el consumidor.
 * Debe estar envuelto en un provider que inyecte el contexto.
 */
interface ExpenseFormProps {
  onCancel?: () => void
}

export const ExpenseForm = ({ onCancel }: ExpenseFormProps) => {
  const { fields, errors, showInstallments, amountRef, setField, handleSubmit } =
    useExpenseFormContext()

  return (
    <div className="flex flex-col gap-5 w-full">
      <Field label="Descripción">
        <StitchInput
          type="text"
          placeholder="¿Qué compraste?"
          value={fields.description}
          onChange={e => setField('description', e.target.value)}
          autoFocus
        />
      </Field>

      <Field label="Monto" error={errors.totalAmount}>
        <StitchInput
          ref={amountRef}
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          prefix="$"
          value={fields.totalAmount}
          onChange={e => setField('totalAmount', e.target.value)}
          error={errors.totalAmount}
        />
      </Field>

      <div className="flex gap-3">
        <div className={showInstallments ? 'flex-1' : 'w-full'}>
          <CategoryPicker value={fields.category} onChange={v => setField('category', v)} />
        </div>
        {showInstallments && (
          <div className="flex-1">
            <Field
              label="Cuotas"
              error={errors.currentInstallment || errors.totalInstallments}
            >
              <div className="flex items-center gap-2">
                <StitchInput
                  type="number"
                  min="1"
                  placeholder="1"
                  value={fields.currentInstallment}
                  onChange={e => setField('currentInstallment', e.target.value)}
                  error={errors.currentInstallment}
                />
                <span className="text-ds-secondary dark:text-dark-secondary text-sm font-medium shrink-0">
                  de
                </span>
                <StitchInput
                  type="number"
                  min="1"
                  placeholder="6"
                  value={fields.totalInstallments}
                  onChange={e => setField('totalInstallments', e.target.value)}
                  error={errors.totalInstallments}
                />
              </div>
            </Field>
          </div>
        )}
      </div>

      {showInstallments && (
        <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2.5">
          <Icon name="info" size="base" className="text-primary mt-0.5" />
          <p className="text-xs text-ds-secondary dark:text-dark-secondary leading-relaxed">
            <span className="font-semibold text-ds-text dark:text-dark-text">Pro tip:</span>{' '}
            Indicá la cuota actual y el total (ej: 1 de 6).
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button variant="ghost" size="md" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button variant="primary" size="md" trailingIcon="check" onClick={handleSubmit}>
          Guardar gasto
        </Button>
      </div>
    </div>
  )
}
