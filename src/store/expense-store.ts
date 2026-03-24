import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { calcTotalSpent, calcRemainingBalance } from '../core/math/finance'
import { getStorageKey, partialize } from '../core/storage/persist-config'
import type { Expense, Budget, MonthlySummary } from '../types'

interface NavSlice {
  isModalOpen: boolean
  editingExpense: Expense | null
  openModal: () => void
  closeModal: () => void
  openEditModal: (expense: Expense) => void
}

interface DataSlice {
  budget: Budget | null
  expenses: Expense[]
  setBudget: (amount: number) => void
  addExpense: (expense: Omit<Expense, 'id' | 'registeredAt'>) => void
  updateExpense: (id: string, changes: Partial<Omit<Expense, 'id' | 'registeredAt'>>) => void
  deleteExpense: (id: string) => void
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

const INITIAL_DATA = { budget: null, expenses: [] as Expense[] }

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      budget: null,
      expenses: [],
      isModalOpen: false,
      editingExpense: null,

      openModal: () => set({ isModalOpen: true, editingExpense: null }),
      closeModal: () => set({ isModalOpen: false, editingExpense: null }),
      openEditModal: (expense: Expense) => set({ isModalOpen: true, editingExpense: expense }),

      setBudget: (amount: number) => set({ budget: buildBudget(amount) }),

      addExpense: raw => set(s => ({ expenses: [...s.expenses, buildExpense(raw)] })),

      updateExpense: (id, changes) =>
        set(s => ({
          expenses: s.expenses.map(e => (e.id === id ? { ...e, ...changes } : e)),
        })),

      deleteExpense: (id: string) => set(s => ({ expenses: s.expenses.filter(e => e.id !== id) })),

      resetAll: () => set({ ...INITIAL_DATA, isModalOpen: false, editingExpense: null }),

      resetExpenses: () => set({ expenses: [], isModalOpen: false, editingExpense: null }),

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
      name: getStorageKey(),
      storage: createJSONStorage(() => localStorage),
      partialize: s => partialize(s),
    },
  ),
)

/**
 * Rehidrata el store con la storage key del usuario autenticado.
 * Debe llamarse al hacer login/logout para aislar datos por usuario.
 */
export const rehydrateStore = (userId?: string) => {
  const storageKey = getStorageKey(userId)

  // Actualizar la key de persistencia y rehidratar
  useExpenseStore.persist.setOptions({ name: storageKey })

  // Limpiar el estado en memoria antes de rehidratar
  useExpenseStore.setState({
    budget: null,
    expenses: [],
    isModalOpen: false,
    editingExpense: null,
  })

  // Rehidratar desde localStorage con la nueva key
  void useExpenseStore.persist.rehydrate()
}
