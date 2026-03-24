import { CATEGORY_LABELS } from '../../../types'
import { Button } from '../../../shared/ui/button'
import { Icon } from '../../../shared/ui/icon'
import type { Expense } from '../../../types'

const fmt = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)

const CATEGORY_ICON: Record<string, { icon: string; bg: string; fg: string }> = {
  BBVA: {
    icon: 'credit-card',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    fg: 'text-blue-600 dark:text-blue-400',
  },
  SUPERVIELLE: {
    icon: 'credit-card',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    fg: 'text-violet-600 dark:text-violet-400',
  },
  PRESTAMO: {
    icon: 'money',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    fg: 'text-orange-600 dark:text-orange-400',
  },
  OTROS: {
    icon: 'payment',
    bg: 'bg-green-100 dark:bg-green-900/30',
    fg: 'text-green-600 dark:text-green-400',
  },
}

interface ExpenseItemProps {
  expense: Expense
  onEdit?: (expense: Expense) => void
  onDelete?: (id: string) => void
}

export const ExpenseItem = ({ expense, onEdit, onDelete }: ExpenseItemProps) => {
  const { icon, bg, fg } = CATEGORY_ICON[expense.category] ?? CATEGORY_ICON.OTROS

  return (
    <div className="flex items-center justify-between p-3 border border-ds-border dark:border-dark-border rounded-lg hover:bg-[#EFEFEF] dark:hover:bg-dark-hover transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`size-10 ${bg} ${fg} rounded-lg flex items-center justify-center shrink-0`}>
          <Icon name={icon} size="xl" />
        </div>
        <div>
          <p className="text-sm font-medium text-ds-text dark:text-dark-text tracking-tight">
            {expense.description ?? CATEGORY_LABELS[expense.category]}
          </p>
          <p className="text-[12px] text-ds-secondary dark:text-dark-secondary leading-relaxed">
            {CATEGORY_LABELS[expense.category]}
            {expense.installment ? ` • Cuota ${expense.installment}` : ''}
            {' • '}
            {new Date(expense.registeredAt).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-sm font-semibold text-ds-text dark:text-dark-text">
            {fmt(expense.totalAmount)}
          </p>
          {expense.installment && (
            <p className="text-[8px] text-ds-secondary dark:text-dark-secondary uppercase font-bold tracking-tighter">
              Monto
            </p>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Editar ${expense.description ?? CATEGORY_LABELS[expense.category]}`}
                onClick={() => onEdit(expense)}
                leadingIcon="edit"
              />
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Eliminar ${expense.description ?? CATEGORY_LABELS[expense.category]}`}
                onClick={() => onDelete(expense.id)}
                className="hover:text-danger!"
                leadingIcon="delete"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
