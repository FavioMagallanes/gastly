import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { getPlanMonthContext } from '../../../core/date/plan-month-labels'
import { useExpenseStore } from '../../../store/expense-store'
import { CATEGORIES } from '../../../types'
import { useDolarTarjeta } from '../../exchange-rates'
import { validateExpense, emptyExpenseFormFields } from '../utils/validation'
import { buildFxCardState, buildValidateExpenseFx } from '../utils/expense-form-fx'
import { patchExpenseFormField } from '../utils/expense-form-field-patch'
import { buildExpenseDraftPayload } from '../utils/build-expense-draft-payload'
import type { ExpenseFormFields, ExpenseErrors } from '../utils/validation'

export const useExpenseForm = (onSuccess?: () => void) => {
  const addExpense = useExpenseStore(state => state.addExpense)
  const addPlannedExpense = useExpenseStore(state => state.addPlannedExpense)
  const expenseModalTarget = useExpenseStore(state => state.expenseModalTarget)
  const [fields, setFields] = useState<ExpenseFormFields>(() => emptyExpenseFormFields())
  const [errors, setErrors] = useState<ExpenseErrors>({})
  const amountRef = useRef<HTMLInputElement>(null)

  const categoryObj = CATEGORIES.find(category => category.id === fields.categoryId)
  const showInstallments = categoryObj?.type === 'credit_card'
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

    const payload = buildExpenseDraftPayload(
      fields,
      showInstallments,
      requiresBank,
      dolarQuery.data?.venta,
    )

    if (expenseModalTarget === 'planned') {
      addPlannedExpense(payload)
      const { nextMonthLabel } = getPlanMonthContext()
      toast.success(`Guardado en el plan de ${nextMonthLabel}`)
    } else {
      addExpense(payload)
      toast.success('Gasto registrado correctamente')
    }

    setFields(emptyExpenseFormFields())
    setErrors({})
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
