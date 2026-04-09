import { getPlanMonthContext } from '../core/date/plan-month-labels'
import type { StateCreator } from 'zustand'
import { calcTotalSpent, calcRemainingBalance } from '../core/math/finance'
import { buildForwardInstallmentPlanRow } from '../core/expense/planned-advance'
import { fetchReports } from '../features/reports/services/report-service'
import type { Expense } from '../types'
import type { ExpenseStore, DataSlice } from './expense-store-types'
import {
  buildBudget,
  buildExpense,
  INITIAL_DATA_STATE,
  INITIAL_NAV_STATE,
} from './expense-store-entities'

export const createDataSlice: StateCreator<ExpenseStore, [], [], DataSlice> = (set, get) => ({
  ...INITIAL_DATA_STATE,

  setBudget: (amount: number) => set({ budget: buildBudget(amount) }),

  setPlannedBudget: (amount: number) =>
    set({
      plannedMonthKey: getPlanMonthContext().planTargetMonthKey,
      plannedBudget: buildBudget(amount),
    }),

  prefillPlannedBudgetFromLastReport: async () => {
    if (get().plannedBudget !== null) return true
    const { data, error } = await fetchReports()
    if (error || !data?.length) return false
    const latestClosedReport = data[0]
    set({ plannedBudget: buildBudget(latestClosedReport.budget) })
    return true
  },

  addExpense: raw =>
    set(state => {
      const newExpense = buildExpense(raw)
      let nextPlanned = state.plannedExpenses.filter(
        plannedExpense => plannedExpense.forwardedFromLedgerId !== newExpense.id,
      )
      const forwardedPlanRow = buildForwardInstallmentPlanRow(newExpense)
      if (forwardedPlanRow) nextPlanned = [...nextPlanned, forwardedPlanRow]
      return {
        expenses: [...state.expenses, newExpense],
        plannedMonthKey: getPlanMonthContext().planTargetMonthKey,
        plannedExpenses: nextPlanned,
      }
    }),

  updateExpense: (id, changes) =>
    set(state => {
      const existingExpense = state.expenses.find(expense => expense.id === id)
      if (!existingExpense) return state
      const merged: Expense = { ...existingExpense, ...changes }
      let nextPlanned = state.plannedExpenses.filter(
        plannedExpense => plannedExpense.forwardedFromLedgerId !== id,
      )
      const forwardedPlanRow = buildForwardInstallmentPlanRow(merged)
      if (forwardedPlanRow) nextPlanned = [...nextPlanned, forwardedPlanRow]
      return {
        expenses: state.expenses.map(expense =>
          expense.id === id ? merged : expense,
        ),
        plannedMonthKey: getPlanMonthContext().planTargetMonthKey,
        plannedExpenses: nextPlanned,
      }
    }),

  deleteExpense: (id: string) =>
    set(state => ({
      expenses: state.expenses.filter(expense => expense.id !== id),
      plannedMonthKey: getPlanMonthContext().planTargetMonthKey,
      plannedExpenses: state.plannedExpenses.filter(
        plannedExpense => plannedExpense.forwardedFromLedgerId !== id,
      ),
    })),

  addPlannedExpense: raw =>
    set(state => ({
      plannedMonthKey: getPlanMonthContext().planTargetMonthKey,
      plannedExpenses: [...state.plannedExpenses, buildExpense(raw)],
    })),

  updatePlannedExpense: (id, changes) =>
    set(state => ({
      plannedMonthKey: getPlanMonthContext().planTargetMonthKey,
      plannedExpenses: state.plannedExpenses.map(expense =>
        expense.id === id ? { ...expense, ...changes } : expense,
      ),
    })),

  deletePlannedExpense: (id: string) =>
    set(state => ({
      plannedMonthKey: getPlanMonthContext().planTargetMonthKey,
      plannedExpenses: state.plannedExpenses.filter(expense => expense.id !== id),
    })),

  clearPlan: () =>
    set({
      plannedMonthKey: getPlanMonthContext().planTargetMonthKey,
      plannedExpenses: [],
      plannedBudget: null,
    }),

  hydratePlannedFromRemote: payload =>
    set({
      plannedMonthKey: payload.plannedMonthKey,
      plannedExpenses: payload.plannedExpenses,
      plannedBudget: payload.plannedBudget,
    }),

  resetAll: () =>
    set({
      ...INITIAL_DATA_STATE,
      ...INITIAL_NAV_STATE,
    }),

  resetExpenses: () =>
    set(state => ({
      expenses: [],
      plannedExpenses: state.plannedExpenses.map(plannedExpense =>
        plannedExpense.forwardedFromLedgerId
          ? { ...plannedExpense, forwardedFromLedgerId: undefined }
          : plannedExpense,
      ),
      ...INITIAL_NAV_STATE,
    })),

  getSummary: () => {
    const { budget, expenses } = get()
    const totalSpent = calcTotalSpent(expenses)
    const budgetAmount = budget?.amount ?? 0
    const remainingBalance = calcRemainingBalance(budgetAmount, totalSpent)
    return {
      budget: budgetAmount,
      totalSpent,
      remainingBalance,
      isOverBudget: remainingBalance < 0,
    }
  },
})
