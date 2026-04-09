import { getPlanMonthContext } from '../core/date/plan-month-labels'
import type { Expense, Budget } from '../types'
import type { ExpenseModalTarget } from './expense-store-types'

export const buildExpense = (raw: Omit<Expense, 'id' | 'registeredAt'>): Expense => ({
  ...raw,
  id: crypto.randomUUID(),
  registeredAt: new Date().toISOString(),
})

export const buildBudget = (amount: number): Budget => ({
  amount,
  configuredAt: new Date().toISOString(),
})

export const INITIAL_DATA_STATE = {
  budget: null as Budget | null,
  expenses: [] as Expense[],
  plannedMonthKey: getPlanMonthContext().planTargetMonthKey,
  plannedExpenses: [] as Expense[],
  plannedBudget: null as Budget | null,
}

export const INITIAL_NAV_STATE = {
  isModalOpen: false,
  editingExpense: null as Expense | null,
  expenseModalTarget: 'current' as ExpenseModalTarget,
}
