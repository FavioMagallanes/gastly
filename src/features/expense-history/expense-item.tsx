import { CATEGORY_LABELS } from '../../types'
import type { Expense } from '../../types'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)

interface ExpenseItemProps {
  expense: Expense
  onEdit?: (expense: Expense) => void
  onDelete?: (id: string) => void
}

export const ExpenseItem = ({ expense, onEdit, onDelete }: ExpenseItemProps) => (
  <div className="bg-surface-container-low px-4 py-3 flex items-start justify-between gap-3 group">
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-sm font-medium text-gray-800 truncate">
        {expense.description ?? CATEGORY_LABELS[expense.category]}
      </span>
      <span className="text-xs text-gray-500">{CATEGORY_LABELS[expense.category]}</span>
      {expense.totalInstallments && expense.currentInstallment && (
        <span className="text-xs text-gray-400 mt-0.5">
          Cuota {expense.currentInstallment} de {expense.totalInstallments}
          {expense.amountPerInstallment
            ? ` — ${formatCurrency(expense.amountPerInstallment)} c/u`
            : ''}
        </span>
      )}
    </div>

    <div className="flex items-center gap-3 shrink-0">
      <span className="text-sm font-semibold text-gray-800">
        {formatCurrency(expense.totalAmount)}
      </span>

      {(onEdit || onDelete) && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              aria-label={`Editar ${expense.description ?? CATEGORY_LABELS[expense.category]}`}
              onClick={() => onEdit(expense)}
              className="px-2 py-1 text-xs text-primary hover:bg-primary hover:text-white transition-colors"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label={`Eliminar ${expense.description ?? CATEGORY_LABELS[expense.category]}`}
              onClick={() => onDelete(expense.id)}
              className="px-2 py-1 text-xs text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  </div>
)
