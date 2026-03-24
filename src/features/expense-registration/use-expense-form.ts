import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useExpenseStore } from '../../store/expense-store'
import { isCardCategory } from '../../types'
import type { Category } from '../../types'

/**
 * Estado del formulario de registro de gastos.
 *
 * - `totalAmount` → Monto que se paga **este mes** (la cuota, no el total del bien).
 * - `installment` → Texto libre con formato "X/Y" (ej: "1/6").
 *                    Solo visible si la categoría es tarjeta.
 */
interface ExpenseFormState {
  description: string
  category: Category
  totalAmount: string
  installment: string
}

const INITIAL_STATE: ExpenseFormState = {
  description: '',
  category: 'OTROS',
  totalAmount: '',
  installment: '',
}

export const useExpenseForm = (onSuccess?: () => void) => {
  const addExpense = useExpenseStore(s => s.addExpense)
  const [fields, setFields] = useState<ExpenseFormState>(INITIAL_STATE)
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormState, string>>>({})
  const amountRef = useRef<HTMLInputElement>(null)

  const showInstallments = isCardCategory(fields.category)

  const setField = <K extends keyof ExpenseFormState>(key: K, value: ExpenseFormState[K]) => {
    setFields(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const next: Partial<Record<keyof ExpenseFormState, string>> = {}
    const amount = parseFloat(fields.totalAmount)

    if (!fields.totalAmount || isNaN(amount) || amount <= 0)
      next.totalAmount = 'Ingresá un monto válido mayor a 0'

    if (showInstallments && !fields.installment.trim())
      next.installment = 'Ingresá la cuota (ej: 1/6)'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    addExpense({
      description: fields.description || undefined,
      category: fields.category,
      totalAmount: parseFloat(fields.totalAmount),
      installment: showInstallments ? fields.installment.trim() : undefined,
    })

    setFields(INITIAL_STATE)
    setErrors({})
    toast.success('Gasto registrado correctamente')
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
