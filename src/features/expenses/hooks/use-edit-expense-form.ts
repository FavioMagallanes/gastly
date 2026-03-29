import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { convertUsdCardToArs } from '../../../core/math/fx'
import { useExpenseStore } from '../../../store/expense-store'
import { isCardCategory, CATEGORIES } from '../../../types'
import type { Expense } from '../../../types'
import { useDolarTarjeta } from '../../exchange-rates'
import { validateExpense, resolveInstallmentForSubmit, emptyExpenseFormFields } from '../utils/validation'
import { buildFxCardState, buildValidateExpenseFx } from '../utils/expense-form-fx'
import type { ExpenseFormFields, ExpenseErrors } from '../utils/validation'

const toFormState = (expense: Expense): ExpenseFormFields => {
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

export const useEditExpenseForm = (expense: Expense, onSuccess?: () => void) => {
  const updateExpense = useExpenseStore(s => s.updateExpense)
  const updatePlannedExpense = useExpenseStore(s => s.updatePlannedExpense)
  const expenseModalTarget = useExpenseStore(s => s.expenseModalTarget)
  const [fields, setFields] = useState<ExpenseFormFields>(() => toFormState(expense))
  const [errors, setErrors] = useState<ExpenseErrors>({})
  const amountRef = useRef<HTMLInputElement>(null)

  const showInstallments = isCardCategory(fields.categoryId)
  const categoryObj = CATEGORIES.find(c => c.id === fields.categoryId)
  const requiresBank = !!categoryObj?.requiresBank

  const dolarQuery = useDolarTarjeta(showInstallments)
  const fxCard = buildFxCardState(dolarQuery)

  const setField = <K extends keyof ExpenseFormFields>(key: K, value: ExpenseFormFields[K]) => {
    setFields(prev => {
      const next = { ...prev, [key]: value }

      if (key === 'categoryId') {
        const newCat = CATEGORIES.find(c => c.id === value)
        if (newCat?.type !== 'credit_card') {
          next.currentInstallment = ''
          next.totalInstallments = ''
          next.cardAmountCurrency = 'ARS'
        }
        if (!newCat?.requiresBank) {
          next.banco = ''
        }
      }

      if (key === 'cardAmountCurrency') {
        next.totalAmount = ''
      }

      return next
    })

    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const fx = buildValidateExpenseFx(showInstallments, fields.cardAmountCurrency, dolarQuery)
    const nextErrors = validateExpense(fields, requiresBank, showInstallments, fx)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const usdMode = showInstallments && fields.cardAmountCurrency === 'USD'
    const usd = parseFloat(fields.totalAmount)
    const venta = dolarQuery.data?.venta

    let totalAmount: number
    let originalAmountUsd: number | undefined
    let fxRateUsdArs: number | undefined

    if (usdMode && venta != null) {
      totalAmount = convertUsdCardToArs(usd, venta)
      originalAmountUsd = usd
      fxRateUsdArs = venta
    } else {
      totalAmount = parseFloat(fields.totalAmount)
      originalAmountUsd = undefined
      fxRateUsdArs = undefined
    }

    const changes = {
      description: fields.description || undefined,
      categoryId: fields.categoryId,
      totalAmount,
      originalAmountUsd,
      fxRateUsdArs,
      installment: showInstallments
        ? resolveInstallmentForSubmit(fields.currentInstallment, fields.totalInstallments)
        : undefined,
      banco: requiresBank ? fields.banco || undefined : undefined,
    }

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
