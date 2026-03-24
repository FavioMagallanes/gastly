import { createContext, useContext } from 'react'
import type { Category } from '../../../types'
import type { RefObject } from 'react'

export interface ExpenseFormFields {
  description: string
  category: Category
  totalAmount: string
  currentInstallment: string
  totalInstallments: string
}

export interface ExpenseFormContextValue {
  fields: ExpenseFormFields
  errors: Partial<Record<string, string>>
  showInstallments: boolean
  amountRef: RefObject<HTMLInputElement | null>
  setField: <K extends keyof ExpenseFormFields>(key: K, value: ExpenseFormFields[K]) => void
  handleSubmit: () => void
}

export const ExpenseFormContext = createContext<ExpenseFormContextValue | null>(null)

export const useExpenseFormContext = () => {
  const ctx = useContext(ExpenseFormContext)
  if (!ctx) throw new Error('useExpenseFormContext must be used within ExpenseFormProvider')
  return ctx
}
