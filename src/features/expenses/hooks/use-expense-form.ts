import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { convertUsdCardToArs } from '../../../core/math/fx'
import { getPlanMonthContext } from '../../../core/date/plan-month-labels'
import { useExpenseStore } from '../../../store/expense-store'
import { CATEGORIES } from '../../../types'
import { useDolarTarjeta } from '../../exchange-rates'
import { validateExpense, resolveInstallmentForSubmit, emptyExpenseFormFields } from '../utils/validation'
import { buildFxCardState, buildValidateExpenseFx } from '../utils/expense-form-fx'
import type { ExpenseFormFields, ExpenseErrors } from '../utils/validation'

export const useExpenseForm = (onSuccess?: () => void) => {
  const addExpense = useExpenseStore(s => s.addExpense)
  const addPlannedExpense = useExpenseStore(s => s.addPlannedExpense)
  const expenseModalTarget = useExpenseStore(s => s.expenseModalTarget)
  const [fields, setFields] = useState<ExpenseFormFields>(() => emptyExpenseFormFields())
  const [errors, setErrors] = useState<ExpenseErrors>({})
  const amountRef = useRef<HTMLInputElement>(null)

  const categoryObj = CATEGORIES.find(c => c.id === fields.categoryId)
  const showInstallments = categoryObj?.type === 'credit_card'
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

    const payload = {
      description: fields.description || undefined,
      categoryId: fields.categoryId,
      totalAmount,
      originalAmountUsd,
      fxRateUsdArs,
      installment: showInstallments
        ? resolveInstallmentForSubmit(fields.currentInstallment, fields.totalInstallments)
        : undefined,
      banco: requiresBank ? fields.banco : undefined,
    }

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
