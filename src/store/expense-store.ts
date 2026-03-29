import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { calcTotalSpent, calcRemainingBalance } from '../core/math/finance'
import { buildForwardInstallmentPlanRow } from '../core/expense/planned-advance'
import { getStorageKey, partialize } from '../core/storage/persist-config'
import { fetchReports } from '../features/reports/services/report-service'
import type { Expense, Budget, MonthlySummary } from '../types'

export type ExpenseModalTarget = 'current' | 'planned'

interface NavSlice {
  isModalOpen: boolean
  editingExpense: Expense | null
  expenseModalTarget: ExpenseModalTarget
  openModal: () => void
  openPlannedModal: () => void
  closeModal: () => void
  openEditModal: (expense: Expense, target?: ExpenseModalTarget) => void
}

interface DataSlice {
  budget: Budget | null
  expenses: Expense[]
  plannedExpenses: Expense[]
  /** Presupuesto de referencia para el plan del mes calendario siguiente (no es el mes en curso). */
  plannedBudget: Budget | null
  setBudget: (amount: number) => void
  setPlannedBudget: (amount: number) => void
  /** Si aún no hay presupuesto planificado, copia el del último reporte cerrado (si existe). */
  prefillPlannedBudgetFromLastReport: () => Promise<boolean>
  addExpense: (expense: Omit<Expense, 'id' | 'registeredAt'>) => void
  updateExpense: (id: string, changes: Partial<Omit<Expense, 'id' | 'registeredAt'>>) => void
  deleteExpense: (id: string) => void
  addPlannedExpense: (expense: Omit<Expense, 'id' | 'registeredAt'>) => void
  updatePlannedExpense: (id: string, changes: Partial<Omit<Expense, 'id' | 'registeredAt'>>) => void
  deletePlannedExpense: (id: string) => void
  clearPlan: () => void
  resetAll: () => void
  resetExpenses: () => void
  getSummary: () => MonthlySummary
}

type ExpenseStore = DataSlice & NavSlice

const buildExpense = (raw: Omit<Expense, 'id' | 'registeredAt'>): Expense => ({
  ...raw,
  id: crypto.randomUUID(),
  registeredAt: new Date().toISOString(),
})

const buildBudget = (amount: number): Budget => ({
  amount,
  configuredAt: new Date().toISOString(),
})

const INITIAL_DATA = {
  budget: null,
  expenses: [] as Expense[],
  plannedExpenses: [] as Expense[],
  plannedBudget: null as Budget | null,
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      budget: null,
      expenses: [],
      plannedExpenses: [],
      plannedBudget: null,
      isModalOpen: false,
      editingExpense: null,
      expenseModalTarget: 'current' as ExpenseModalTarget,

      openModal: () =>
        set({ isModalOpen: true, editingExpense: null, expenseModalTarget: 'current' }),
      openPlannedModal: () =>
        set({ isModalOpen: true, editingExpense: null, expenseModalTarget: 'planned' }),
      closeModal: () =>
        set({ isModalOpen: false, editingExpense: null, expenseModalTarget: 'current' }),
      openEditModal: (expense, target = 'current') =>
        set({ isModalOpen: true, editingExpense: expense, expenseModalTarget: target }),

      setBudget: (amount: number) => set({ budget: buildBudget(amount) }),

      setPlannedBudget: (amount: number) => set({ plannedBudget: buildBudget(amount) }),

      prefillPlannedBudgetFromLastReport: async () => {
        if (get().plannedBudget !== null) return true
        const { data, error } = await fetchReports()
        if (error || !data?.length) return false
        const latest = data[0]
        set({ plannedBudget: buildBudget(latest.budget) })
        return true
      },

      addExpense: raw =>
        set(s => {
          const newE = buildExpense(raw)
          let planned = s.plannedExpenses.filter(p => p.forwardedFromLedgerId !== newE.id)
          const fwd = buildForwardInstallmentPlanRow(newE)
          if (fwd) planned = [...planned, fwd]
          return { expenses: [...s.expenses, newE], plannedExpenses: planned }
        }),

      updateExpense: (id, changes) =>
        set(s => {
          const old = s.expenses.find(e => e.id === id)
          if (!old) return s
          const merged: Expense = { ...old, ...changes }
          let planned = s.plannedExpenses.filter(p => p.forwardedFromLedgerId !== id)
          const fwd = buildForwardInstallmentPlanRow(merged)
          if (fwd) planned = [...planned, fwd]
          return {
            expenses: s.expenses.map(e => (e.id === id ? merged : e)),
            plannedExpenses: planned,
          }
        }),

      deleteExpense: (id: string) =>
        set(s => ({
          expenses: s.expenses.filter(e => e.id !== id),
          plannedExpenses: s.plannedExpenses.filter(p => p.forwardedFromLedgerId !== id),
        })),

      addPlannedExpense: raw =>
        set(s => ({ plannedExpenses: [...s.plannedExpenses, buildExpense(raw)] })),

      updatePlannedExpense: (id, changes) =>
        set(s => ({
          plannedExpenses: s.plannedExpenses.map(e => (e.id === id ? { ...e, ...changes } : e)),
        })),

      deletePlannedExpense: (id: string) =>
        set(s => ({ plannedExpenses: s.plannedExpenses.filter(e => e.id !== id) })),

      clearPlan: () => set({ plannedExpenses: [], plannedBudget: null }),

      resetAll: () =>
        set({
          ...INITIAL_DATA,
          isModalOpen: false,
          editingExpense: null,
          expenseModalTarget: 'current',
        }),

      resetExpenses: () =>
        set(s => ({
          expenses: [],
          plannedExpenses: s.plannedExpenses.map(p =>
            p.forwardedFromLedgerId ? { ...p, forwardedFromLedgerId: undefined } : p,
          ),
          isModalOpen: false,
          editingExpense: null,
          expenseModalTarget: 'current',
        })),

      getSummary: (): MonthlySummary => {
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
    }),
    {
      name: 'gastly-storage-temp',
      storage: createJSONStorage(() => localStorage),
      partialize: s => partialize(s),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ExpenseStore>
        return {
          ...current,
          budget: p.budget !== undefined ? p.budget : current.budget,
          expenses: Array.isArray(p.expenses) ? p.expenses : current.expenses,
          plannedExpenses: Array.isArray(p.plannedExpenses)
            ? p.plannedExpenses
            : current.plannedExpenses,
          plannedBudget:
            p.plannedBudget !== undefined ? p.plannedBudget : current.plannedBudget,
        }
      },
    },
  ),
)

let lastUserId: string | undefined = undefined

export const rehydrateStore = (userId?: string) => {
  if (userId === lastUserId) return
  lastUserId = userId

  const storageKey = getStorageKey(userId)

  useExpenseStore.persist.setOptions({ name: storageKey })

  void useExpenseStore.persist.rehydrate()
}
