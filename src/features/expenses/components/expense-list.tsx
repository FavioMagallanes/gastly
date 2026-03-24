import { Button } from '../../../shared/ui/button'
import { Icon } from '../../../shared/ui/icon'
import type { Expense } from '../../../types'
import { ExpenseItem } from './expense-item'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit?: (expense: Expense) => void
  onDelete?: (id: string) => void
  onAddFirst?: () => void
}

export const ExpenseList = ({ expenses, onEdit, onDelete, onAddFirst }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center border border-ds-border dark:border-dark-border rounded-xl">
        <Icon
          name="receipt-dollar"
          size="4xl"
          className="text-ds-secondary dark:text-dark-secondary"
        />
        <p className="text-sm text-ds-secondary dark:text-dark-secondary leading-relaxed">
          Todavía no hay gastos cargados.
        </p>
        {onAddFirst && (
          <Button variant="link" size="sm" onClick={onAddFirst}>
            Cargar
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full gap-1">
      {expenses.map(expense => (
        <ExpenseItem key={expense.id} expense={expense} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
