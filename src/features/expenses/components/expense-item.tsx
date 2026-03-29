import { CATEGORY_LABELS } from '../../../types'
import { Button } from '../../../shared/ui/button'
import { formatCurrency } from '../../../core/math/format'
import type { Expense } from '../../../types'

interface ExpenseItemProps {
  expense: Expense
  onEdit?: (expense: Expense) => void
  onDelete?: (id: string) => void
}

export const ExpenseItem = ({ expense, onEdit, onDelete }: ExpenseItemProps) => {
  const categoryId = expense.categoryId
  const label = CATEGORY_LABELS[categoryId] ?? 'Otros'

  return (
    <div className="flex items-center justify-between p-3 border border-ds-border dark:border-dark-border rounded-none hover:bg-surface dark:hover:bg-dark-hover transition-colors group cursor-pointer">
      <div className="flex items-center">
        <div>
          <p className="text-[13px] font-semibold text-ds-text dark:text-dark-text tracking-tight uppercase">
            {expense.description ?? label}
          </p>
          <p className="text-[11px] text-ds-secondary dark:text-dark-secondary tracking-wide uppercase mt-0.5">
            <span className="font-bold">{label}</span>
            {expense.installment && (
              <>
                <span className="mx-1.5 opacity-30">•</span>
                {`Cuota ${expense.installment}`}
              </>
            )}
            <span className="mx-1.5 opacity-30">•</span>
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
            {formatCurrency(expense.totalAmount)}
          </p>
          {expense.originalAmountUsd != null && expense.fxRateUsdArs != null && (
            <p className="text-[10px] text-ds-secondary dark:text-dark-secondary mt-0.5 max-w-[200px] ml-auto leading-tight">
              US$ {expense.originalAmountUsd.toFixed(2)} @ {formatCurrency(expense.fxRateUsdArs)} (tarjeta)
            </p>
          )}
          {expense.installment && (
            <p className="text-[8px] text-ds-secondary dark:text-dark-secondary uppercase font-bold tracking-tighter">
              Monto
            </p>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Editar ${expense.description ?? label}`}
                onClick={() => onEdit(expense)}
                leadingIcon="edit"
              />
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Eliminar ${expense.description ?? label}`}
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
