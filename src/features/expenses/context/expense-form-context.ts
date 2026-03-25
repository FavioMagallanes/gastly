import { createContext, useContext } from 'react'

export interface ExpenseFormFields {
  description: string
  categoryId: string
  totalAmount: string
  currentInstallment: string
  totalInstallments: string
  banco: string // nuevo campo
}

export type ExpenseFormErrors = Partial<Record<keyof ExpenseFormFields, string>>

export interface ExpenseFormContextValue {
  fields: ExpenseFormFields
  errors: ExpenseFormErrors
  showInstallments: boolean
  amountRef: React.RefObject<HTMLInputElement | null>
  setField: <K extends keyof ExpenseFormFields>(key: K, value: ExpenseFormFields[K]) => void
  handleSubmit: () => void
  requiresBank: boolean // nuevo campo
}

export const ExpenseFormContext = createContext<ExpenseFormContextValue | null>(null)

export const useExpenseFormContext = () => {
  const ctx = useContext(ExpenseFormContext)
  if (!ctx) throw new Error('useExpenseFormContext must be used within ExpenseFormProvider')
  return ctx
}
