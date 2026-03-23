import { useRef, useState } from 'react'
import { useExpenseStore } from '../../store/expense-store'
import { calcInstallmentAmount } from '../../core/math/finance'
import { isCardCategory } from '../../types'
import type { Category } from '../../types'

interface ExpenseFormState {
  description: string
  category: Category
  totalAmount: string
  totalInstallments: string
  currentInstallment: string
}

const INITIAL_STATE: ExpenseFormState = {
  description: '',
  category: 'OTROS',
  totalAmount: '',
  totalInstallments: '',
  currentInstallment: '',
}

export const useExpenseForm = (onSuccess?: () => void) => {
  const addExpense = useExpenseStore(s => s.addExpense)
  const [fields, setFields] = useState<ExpenseFormState>(INITIAL_STATE)
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormState, string>>>({})
  const amountRef = useRef<HTMLInputElement>(null)

  const showInstallments = isCardCategory(fields.category)

  const amountPerInstallment =
    showInstallments && fields.totalAmount && fields.totalInstallments
      ? calcInstallmentAmount(
          parseFloat(fields.totalAmount),
          parseInt(fields.totalInstallments, 10),
        )
      : null

  const setField = <K extends keyof ExpenseFormState>(key: K, value: ExpenseFormState[K]) => {
    setFields(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const next: Partial<Record<keyof ExpenseFormState, string>> = {}
    const amount = parseFloat(fields.totalAmount)

    if (!fields.totalAmount || isNaN(amount) || amount <= 0)
      next.totalAmount = 'Ingresá un monto válido mayor a 0'

    if (showInstallments) {
      const installments = parseInt(fields.totalInstallments, 10)
      if (!fields.totalInstallments || isNaN(installments) || installments < 1)
        next.totalInstallments = 'Ingresá la cantidad de cuotas (mínimo 1)'

      const current = parseInt(fields.currentInstallment, 10)
      if (!fields.currentInstallment || isNaN(current) || current < 1)
        next.currentInstallment = 'Ingresá la cuota actual'
      else if (current > parseInt(fields.totalInstallments, 10))
        next.currentInstallment = 'La cuota actual no puede superar el total'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const amount = parseFloat(fields.totalAmount)
    const installments = showInstallments ? parseInt(fields.totalInstallments, 10) : undefined
    const current = showInstallments ? parseInt(fields.currentInstallment, 10) : undefined

    addExpense({
      description: fields.description || undefined,
      category: fields.category,
      totalAmount: amount,
      totalInstallments: installments,
      currentInstallment: current,
      amountPerInstallment: installments ? calcInstallmentAmount(amount, installments) : undefined,
    })

    setFields(INITIAL_STATE)
    setErrors({})
    onSuccess?.()
  }

  return {
    fields,
    errors,
    showInstallments,
    amountPerInstallment,
    amountRef,
    setField,
    handleSubmit,
  }
}
