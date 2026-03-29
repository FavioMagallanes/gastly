import type { Expense } from '../../../types'
import { emptyExpenseFormFields } from './validation'
import type { ExpenseFormFields } from './validation'

/**
 * Estado inicial del formulario cuando se edita un gasto existente (p. ej. snapshot en reporte).
 */
export const expenseToFormFields = (expense: Expense): ExpenseFormFields => {
  const [current, total] = (expense.installment ?? '').split('/')
  const base = emptyExpenseFormFields()
  const hasUsd =
    expense.originalAmountUsd != null &&
    expense.fxRateUsdArs != null &&
    !Number.isNaN(expense.originalAmountUsd)

  return {
    ...base,
    description: expense.description ?? '',
    categoryId: expense.categoryId,
    totalAmount: hasUsd ? String(expense.originalAmountUsd) : String(expense.totalAmount),
    currentInstallment: current ?? '',
    totalInstallments: total ?? '',
    banco: expense.banco ?? '',
    cardAmountCurrency: hasUsd ? 'USD' : 'ARS',
  }
}
