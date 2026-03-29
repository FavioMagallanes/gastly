import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useExpenseStore } from '../../../store/expense-store'
import { isCardCategory, CATEGORIES } from '../../../types'
import type { Expense } from '../../../types'
import { useDolarTarjeta } from '../../exchange-rates'
import { validateExpense } from '../utils/validation'
import { buildFxCardState, buildValidateExpenseFx } from '../utils/expense-form-fx'
import { patchExpenseFormField } from '../utils/expense-form-field-patch'
import { buildExpenseDraftPayload } from '../utils/build-expense-draft-payload'
import { expenseToFormFields } from '../utils/expense-to-form-fields'
import type { ExpenseFormFields, ExpenseErrors } from '../utils/validation'

export const useEditExpenseForm = (expense: Expense, onSuccess?: () => void) => {
  const updateExpense = useExpenseStore(state => state.updateExpense)
  const updatePlannedExpense = useExpenseStore(state => state.updatePlannedExpense)
  const expenseModalTarget = useExpenseStore(state => state.expenseModalTarget)
  const [fields, setFields] = useState<ExpenseFormFields>(() => expenseToFormFields(expense))
  const [errors, setErrors] = useState<ExpenseErrors>({})
  const amountRef = useRef<HTMLInputElement>(null)

  const showInstallments = isCardCategory(fields.categoryId)
  const categoryObj = CATEGORIES.find(category => category.id === fields.categoryId)
  const requiresBank = !!categoryObj?.requiresBank

  const dolarQuery = useDolarTarjeta(showInstallments)
  const fxCard = buildFxCardState(dolarQuery)

  const setField = <K extends keyof ExpenseFormFields>(key: K, value: ExpenseFormFields[K]) => {
    setFields(prev => patchExpenseFormField(prev, key, value))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const validateFx = buildValidateExpenseFx(
      showInstallments,
      fields.cardAmountCurrency,
      dolarQuery,
    )
    const nextErrors = validateExpense(fields, requiresBank, showInstallments, validateFx)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const changes = buildExpenseDraftPayload(
      fields,
      showInstallments,
      requiresBank,
      dolarQuery.data?.venta,
    )

    if (expenseModalTarget === 'planned') {
      updatePlannedExpense(expense.id, changes)
      toast.success('Plan actualizado')
    } else {
      updateExpense(expense.id, changes)
      toast.success('Gasto actualizado')
    }
    onSuccess?.()
  }

  return {
    fields,
    errors,
    showInstallments,
    amountRef,
    setField,
    handleSubmit,
    requiresBank,
    fxCard,
  }
}
