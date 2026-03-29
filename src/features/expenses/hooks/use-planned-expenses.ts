import { toast } from 'sonner'
import { getPlanMonthContext } from '../../../core/date/plan-month-labels'
import { confirmToast } from '../../../shared/ui/confirm-toast'
import { useExpenseStore } from '../../../store/expense-store'
import type { Expense } from '../../../types'

export const usePlannedExpenses = () => {
  const plannedExpenses = useExpenseStore(s => s.plannedExpenses)
  const deletePlannedExpense = useExpenseStore(s => s.deletePlannedExpense)
  const openEditModal = useExpenseStore(s => s.openEditModal)
  const clearPlan = useExpenseStore(s => s.clearPlan)

  const handleEdit = (expense: Expense) => openEditModal(expense, 'planned')

  const handleDelete = (id: string) => {
    confirmToast({
      title: '¿Quitar del plan?',
      confirmLabel: 'Quitar',
      variant: 'danger',
      onConfirm: () => {
        deletePlannedExpense(id)
        toast.success('Quitado del plan')
      },
    })
  }

  const handleClearPlan = () => {
    const { nextMonthLabel } = getPlanMonthContext()
    confirmToast({
      title: `¿Vaciar el plan de ${nextMonthLabel}?`,
      description:
        'Se borran los gastos del plan y el presupuesto de referencia. No modifica el mes en curso ni los reportes cerrados.',
      confirmLabel: 'Vaciar plan',
      variant: 'danger',
      onConfirm: () => {
        clearPlan()
        toast.success('Plan reiniciado')
      },
    })
  }

  return {
    plannedExpenses,
    handleEdit,
    handleDelete,
    handleClearPlan,
  }
}
