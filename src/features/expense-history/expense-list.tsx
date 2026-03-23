import { ExpenseItem } from './expense-item'
import type { Expense } from '../../types'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit?: (expense: Expense) => void
  onDelete?: (id: string) => void
  onAddFirst?: () => void
}

export const ExpenseList = ({ expenses, onEdit, onDelete, onAddFirst }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="text-3xl">📋</span>
        <p className="text-sm text-gray-500">Todavía no hay gastos registrados este mes.</p>
        {onAddFirst && (
          <button
            type="button"
            onClick={onAddFirst}
            className="text-sm text-primary underline-offset-2 hover:underline"
          >
            Registrá tu primer gasto
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      {expenses.map((expense, index) => (
        <div
          key={expense.id}
          className={index % 2 === 0 ? 'bg-surface-container-low' : 'bg-background'}
        >
          <ExpenseItem expense={expense} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  )
}
