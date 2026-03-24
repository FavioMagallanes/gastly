import { toast } from 'sonner'
import { useExpenseStore } from '../../store/expense-store'

export const useBudget = () => {
  const budget = useExpenseStore(s => s.budget)
  const setBudget = useExpenseStore(s => s.setBudget)
  const editBudget = useExpenseStore(s => s.editBudget)
  const getSummary = useExpenseStore(s => s.getSummary)

  const summary = getSummary()

  const MAX_BUDGET = 5_000_000

  const validate = (amount: number): string | null => {
    if (amount <= 0) return 'El presupuesto debe ser un número positivo'
    if (amount > MAX_BUDGET)
      return `El presupuesto no puede superar $${MAX_BUDGET.toLocaleString('es-AR')}`
    return null
  }

  const handleSetBudget = (amount: number) => {
    const err = validate(amount)
    if (err) {
      toast.warning(err)
      return
    }
    setBudget(amount)
    toast.success('Presupuesto establecido')
  }

  const handleEditBudget = (amount: number) => {
    const err = validate(amount)
    if (err) {
      toast.warning(err)
      return
    }
    editBudget(amount)
    toast.success('Presupuesto actualizado')
  }

  return {
    budget,
    remainingBalance: summary.remainingBalance,
    totalSpent: summary.totalSpent,
    isOverBudget: summary.isOverBudget,
    handleSetBudget,
    handleEditBudget,
  }
}
