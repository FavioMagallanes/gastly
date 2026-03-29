import { type FormEvent, useEffect, useState } from 'react'
import { Button } from '../../../shared/ui/button'
import { Icon } from '../../../shared/ui/icon'

interface BudgetFormProps {
  onSubmit: (amount: number) => void
  isEditing: boolean
  initialValue?: number
  /** Texto del label sobre el campo (ej. plan próximo mes) */
  fieldLabel?: string
  /** Ledger bloqueado por reporte del periodo (no editar presupuesto ni enviar). */
  disabled?: boolean
}

export const BudgetForm = ({
  onSubmit,
  isEditing,
  initialValue,
  fieldLabel = 'Ingresar presupuesto del mes',
  disabled = false,
}: BudgetFormProps) => {
  const [value, setValue] = useState(
    () =>
      initialValue != null && !Number.isNaN(initialValue) ? String(initialValue) : '',
  )

  // Sincronizar el input cuando el presupuesto llega del store (p. ej. tras hidratar persist).
  /* eslint-disable react-hooks/set-state-in-effect -- ajuste de estado local al cambiar la prop `initialValue` */
  useEffect(() => {
    if (initialValue != null && !Number.isNaN(initialValue)) {
      setValue(String(initialValue))
    }
  }, [initialValue])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (disabled) return
    const parsed = parseFloat(value.replace(/,/g, '.'))
    if (!isNaN(parsed)) onSubmit(parsed)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-end gap-3 ${disabled ? 'opacity-60' : ''}`}
    >
      <div className="flex flex-col gap-1 flex-1 max-w-xs">
        <label className="text-[11px] font-semibold text-ds-secondary dark:text-dark-secondary uppercase tracking-widest px-0.5">
          {fieldLabel}
        </label>
        <div
          className={`flex items-center border border-ds-border dark:border-dark-border rounded-lg bg-surface dark:bg-dark-surface px-3 py-2 gap-2 transition-all ${
            disabled ? '' : 'focus-within:ring-1 focus-within:ring-primary/50'
          }`}
        >
          <span className="text-ds-secondary dark:text-dark-secondary text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={value}
            onChange={e => setValue(e.target.value)}
            disabled={disabled}
            className="w-full bg-transparent border-none p-0 outline-none text-ds-text dark:text-dark-text font-medium text-sm placeholder:text-ds-secondary/60 dark:placeholder:text-dark-secondary/60 placeholder:font-normal disabled:cursor-not-allowed"
          />
          <Icon
            name="money-add-02"
            size="base"
            className="text-ds-secondary dark:text-dark-secondary"
          />
        </div>
      </div>
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="rounded-none"
        disabled={disabled}
      >
        {isEditing ? 'Actualizar' : 'Guardar'}
      </Button>
    </form>
  )
}
