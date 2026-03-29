import { createContext, useContext } from 'react'
import type { ExpenseFormFields, ExpenseErrors } from '../utils/validation'

export type { ExpenseFormFields, ExpenseErrors }

export type ExpenseFormFxState = {
  venta: number | undefined
  isPending: boolean
  isError: boolean
  updatedAtLabel: string | undefined
}

export interface ExpenseFormContextValue {
  fields: ExpenseFormFields
  errors: ExpenseErrors
  showInstallments: boolean
  amountRef: React.RefObject<HTMLInputElement | null>
  setField: <K extends keyof ExpenseFormFields>(key: K, value: ExpenseFormFields[K]) => void
  handleSubmit: () => void
  requiresBank: boolean
  fxCard: ExpenseFormFxState
}

export const ExpenseFormContext = createContext<ExpenseFormContextValue | null>(null)

export const useExpenseFormContext = () => {
  const ctx = useContext(ExpenseFormContext)
  if (!ctx) throw new Error('useExpenseFormContext must be used within ExpenseFormProvider')
  return ctx
}
