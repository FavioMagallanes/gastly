import { getPlanMonthContext } from '../date/plan-month-labels'
import type { Expense, Budget } from '../../types'

const STORAGE_PREFIX = 'expense-tracker-v1'

/**
 * Genera la storage key ligada al usuario autenticado.
 * Si no hay userId (no debería pasar), usa la key genérica como fallback.
 */
export const getStorageKey = (userId?: string): string =>
  userId ? `${STORAGE_PREFIX}-${userId}` : STORAGE_PREFIX

export const partialize = (state: {
  budget: Budget | null
  expenses: Expense[]
  plannedMonthKey: string
  plannedExpenses: Expense[]
  plannedBudget: Budget | null
}) => ({
  budget: state.budget,
  expenses: state.expenses,
  plannedMonthKey: state.plannedMonthKey,
  plannedExpenses: state.plannedExpenses,
  plannedBudget: state.plannedBudget,
})

export const getActivePlanMonthKey = (): string => getPlanMonthContext().planTargetMonthKey
