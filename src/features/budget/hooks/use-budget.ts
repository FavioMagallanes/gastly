import { useMemo } from 'react'
import { toast } from 'sonner'
import { useExpenseStore } from '../../../store/expense-store'
import { calcTotalSpent, calcRemainingBalance } from '../../../core/math/finance'

export const useBudget = () => {
  const budget = useExpenseStore(s => s.budget)
  const expenses = useExpenseStore(s => s.expenses)
  const setBudget = useExpenseStore(s => s.setBudget)

  const summary = useMemo(() => {
    const totalSpent = calcTotalSpent(expenses)
    const budgetAmount = budget?.amount ?? 0
    const remainingBalance = calcRemainingBalance(budgetAmount, totalSpent)
    return {
      totalSpent,
      remainingBalance,
      isOverBudget: remainingBalance < 0,
    }
  }, [budget, expenses])

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
    toast.success(budget ? 'Presupuesto actualizado' : 'Presupuesto establecido')
  }

  return {
    budget,
    remainingBalance: summary.remainingBalance,
    totalSpent: summary.totalSpent,
    isOverBudget: summary.isOverBudget,
    handleSetBudget,
  }
}
