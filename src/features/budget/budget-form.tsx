import { type FormEvent, useState } from 'react'
import { Button } from '../../shared/ui/button'
import { Icon } from '../../shared/ui/icon'

interface BudgetFormProps {
  onSubmit: (amount: number) => void
  isEditing: boolean
}

export const BudgetForm = ({ onSubmit, isEditing }: BudgetFormProps) => {
  const [value, setValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(value.replace(/,/g, '.'))
    if (!isNaN(parsed)) onSubmit(parsed)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex flex-col gap-1 flex-1 max-w-xs">
        <label className="text-[11px] font-semibold text-ds-secondary uppercase tracking-widest px-0.5">
          Establecer objetivo
        </label>
        <div className="flex items-center border border-ds-border rounded-lg bg-surface px-3 py-2 gap-2 transition-all focus-within:ring-1 focus-within:ring-primary/50">
          <span className="text-ds-secondary text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-full bg-transparent border-none p-0 outline-none text-ds-text font-medium text-sm"
          />
          <Icon name="pencil" size="base" className="text-ds-secondary" />
        </div>
      </div>
      <Button type="submit" variant="primary" size="md">
        {isEditing ? 'Actualizar' : 'Guardar'}
      </Button>
    </form>
  )
}
