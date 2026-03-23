import { useExpenseStore } from '../../store/expense-store'
import type { Expense } from '../../types'

export const useExpenses = () => {
  const expenses = useExpenseStore(s => s.expenses)
  const updateExpense = useExpenseStore(s => s.updateExpense)
  const deleteExpense = useExpenseStore(s => s.deleteExpense)
  const openEditModal = useExpenseStore(s => s.openEditModal)

  const handleEdit = (expense: Expense) => openEditModal(expense)

  const handleDelete = (id: string) => deleteExpense(id)

  const handleUpdate = (id: string, changes: Partial<Omit<Expense, 'id' | 'registeredAt'>>) =>
    updateExpense(id, changes)

  return {
    expenses,
    handleEdit,
    handleDelete,
    handleUpdate,
  }
}
