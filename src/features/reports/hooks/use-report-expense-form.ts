import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { CATEGORIES, isCardCategory } from '../../../types'
import type { Expense } from '../../../types'
import { useDolarTarjeta } from '../../exchange-rates'
import { validateExpense, emptyExpenseFormFields } from '../../expenses/utils/validation'
import { buildFxCardState, buildValidateExpenseFx } from '../../expenses/utils/expense-form-fx'
import { patchExpenseFormField } from '../../expenses/utils/expense-form-field-patch'
import { buildExpenseDraftPayload } from '../../expenses/utils/build-expense-draft-payload'
import { expenseToFormFields } from '../../expenses/utils/expense-to-form-fields'
import type { ExpenseFormFields, ExpenseErrors } from '../../expenses/utils/validation'

/**
 * Formulario de gasto para editar el snapshot de un reporte cerrado (sin Zustand).
 */
export const useReportExpenseForm = (
  initial: Expense | null,
  onCommit: (expense: Expense) => void,
  onSuccess?: () => void,
) => {
  const [fields, setFields] = useState<ExpenseFormFields>(() =>
    initial ? expenseToFormFields(initial) : emptyExpenseFormFields(),
  )
  const [errors, setErrors] = useState<ExpenseErrors>({})
  const amountRef = useRef<HTMLInputElement>(null)

  const showInstallments = isCardCategory(fields.categoryId)
  const categoryObj = CATEGORIES.find(category => category.id === fields.categoryId)
  const requiresBank = !!categoryObj?.requiresBank

  const dolarQuery = useDolarTarjeta(
    showInstallments && fields.cardAmountCurrency === 'USD',
  )
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

    const draft = buildExpenseDraftPayload(
      fields,
      showInstallments,
      requiresBank,
      dolarQuery.data?.venta,
    )

    if (initial) {
      onCommit({
        ...initial,
        ...draft,
      })
    } else {
      onCommit({
        id: crypto.randomUUID(),
        registeredAt: new Date().toISOString(),
        ...draft,
      })
    }

    toast.success(initial ? 'Gasto actualizado' : 'Gasto agregado')
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
