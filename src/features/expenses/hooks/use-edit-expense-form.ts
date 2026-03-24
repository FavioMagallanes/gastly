import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useExpenseStore } from '../../../store/expense-store'
import { isCardCategory } from '../../../types'
import type { Expense, Category } from '../../../types'

interface EditFormState {
  description: string
  category: Category
  totalAmount: string
  currentInstallment: string
  totalInstallments: string
}

const toFormState = (expense: Expense): EditFormState => {
  const [current, total] = (expense.installment ?? '').split('/')
  return {
    description: expense.description ?? '',
    category: expense.category,
    totalAmount: String(expense.totalAmount),
    currentInstallment: current ?? '',
    totalInstallments: total ?? '',
  }
}

export const useEditExpenseForm = (expense: Expense, onSuccess?: () => void) => {
  const updateExpense = useExpenseStore(s => s.updateExpense)
  const [fields, setFields] = useState<EditFormState>(() => toFormState(expense))
  const [errors, setErrors] = useState<Partial<Record<keyof EditFormState, string>>>({})
  const amountRef = useRef<HTMLInputElement>(null)

  const showInstallments = isCardCategory(fields.category)

  const setField = <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => {
    setFields(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const next: Partial<Record<keyof EditFormState, string>> = {}
    const amount = parseFloat(fields.totalAmount)

    if (!fields.totalAmount || isNaN(amount) || amount <= 0)
      next.totalAmount = 'Ingresá un monto válido mayor a 0'

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
      category: fields.category,
      totalAmount: parseFloat(fields.totalAmount),
      installment: showInstallments
        ? `${fields.currentInstallment}/${fields.totalInstallments}`
        : undefined,
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
  }
}
