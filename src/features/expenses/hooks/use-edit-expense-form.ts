import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useExpenseStore } from '../../../store/expense-store'
import { isCardCategory, CATEGORIES } from '../../../types'
import type { Expense } from '../../../types'

interface EditFormState {
  description: string
  categoryId: string
  totalAmount: string
  currentInstallment: string
  totalInstallments: string
  banco: string
}

const toFormState = (expense: Expense): EditFormState => {
  const [current, total] = (expense.installment ?? '').split('/')
  return {
    description: expense.description ?? '',
    categoryId: expense.categoryId,
    totalAmount: String(expense.totalAmount),
    currentInstallment: current ?? '',
    totalInstallments: total ?? '',
    banco: expense.banco ?? '',
  }
}

export const useEditExpenseForm = (expense: Expense, onSuccess?: () => void) => {
  const updateExpense = useExpenseStore(s => s.updateExpense)
  const [fields, setFields] = useState<EditFormState>(() => toFormState(expense))
  const [errors, setErrors] = useState<Partial<Record<keyof EditFormState, string>>>({})
  const amountRef = useRef<HTMLInputElement>(null)

  const showInstallments = isCardCategory(fields.categoryId)

  const setField = <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => {
    setFields(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const categoryObj = CATEGORIES.find(c => c.id === fields.categoryId)
  const requiresBank = !!categoryObj?.requiresBank

  const validate = (): boolean => {
    const next: Partial<Record<keyof EditFormState, string>> = {}
    const amount = parseFloat(fields.totalAmount)

    if (!fields.totalAmount || isNaN(amount) || amount <= 0)
      next.totalAmount = 'Ingresá un monto válido mayor a 0'

    if (requiresBank && !fields.banco) next.banco = 'Seleccioná un banco'

    if (showInstallments) {
      const current = parseInt(fields.currentInstallment)
      const total = parseInt(fields.totalInstallments)
      if (!fields.currentInstallment || isNaN(current) || current < 1)
        next.currentInstallment = 'Cuota actual inválida'
      if (!fields.totalInstallments || isNaN(total) || total < 1)
        next.totalInstallments = 'Total de cuotas inválido'
      if (current > total && !next.currentInstallment && !next.totalInstallments)
        next.currentInstallment = 'No puede superar el total'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    updateExpense(expense.id, {
      description: fields.description || undefined,
      categoryId: fields.categoryId,
      totalAmount: parseFloat(fields.totalAmount),
      installment: showInstallments
        ? `${fields.currentInstallment}/${fields.totalInstallments}`
        : undefined,
      banco: requiresBank ? fields.banco || undefined : undefined,
    })

    toast.success('Gasto actualizado')
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
  }
}
