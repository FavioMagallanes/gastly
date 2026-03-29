import { CATEGORIES } from '../../../types'
import type { ExpenseFormFields } from './validation'

/**
 * Aplica el siguiente valor de campo y los efectos derivados (categoría, moneda de tarjeta).
 */
export const patchExpenseFormField = <K extends keyof ExpenseFormFields>(
  previous: ExpenseFormFields,
  key: K,
  value: ExpenseFormFields[K],
): ExpenseFormFields => {
  const next: ExpenseFormFields = { ...previous, [key]: value }

  if (key === 'categoryId') {
    const selectedCategory = CATEGORIES.find(category => category.id === value)
    if (selectedCategory?.type !== 'credit_card') {
      next.currentInstallment = ''
      next.totalInstallments = ''
      next.cardAmountCurrency = 'ARS'
    }
    if (!selectedCategory?.requiresBank) {
      next.banco = ''
    }
  }

  if (key === 'cardAmountCurrency') {
    next.totalAmount = ''
  }

  return next
}
