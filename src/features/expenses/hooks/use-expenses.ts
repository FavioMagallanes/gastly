import { toast } from 'sonner'
import { confirmToast } from '../../../shared/ui/confirm-toast'
import { useExpenseStore } from '../../../store/expense-store'
import type { Expense } from '../../../types'

interface UseExpensesReturn {
  expenses: Expense[]
  handleEdit: (expense: Expense) => void
  handleDelete: (id: string) => void
  handleUpdate: (id: string, changes: Partial<Omit<Expense, 'id' | 'registeredAt'>>) => void
}

export const useExpenses = (): UseExpensesReturn => {
  const expenses = useExpenseStore(s => s.expenses)
  const updateExpense = useExpenseStore(s => s.updateExpense)
  const deleteExpense = useExpenseStore(s => s.deleteExpense)
  const openEditModal = useExpenseStore(s => s.openEditModal)

  const handleEdit = (expense: Expense) => openEditModal(expense)

  const handleDelete = (id: string) => {
    confirmToast({
      title: '¿Eliminar este gasto?',
      confirmLabel: 'Eliminar',
      variant: 'danger',
      onConfirm: () => {
        deleteExpense(id)
        toast.success('Gasto eliminado')
      },
    })
  }

  const handleUpdate = (id: string, changes: Partial<Omit<Expense, 'id' | 'registeredAt'>>) =>
    updateExpense(id, changes)

  return {
    expenses,
    handleEdit,
    handleDelete,
    handleUpdate,
  }
}
