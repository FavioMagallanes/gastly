import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getStorageKey, partialize } from '../core/storage/persist-config'
import type { ExpenseStore } from './expense-store-types'
import { createDataSlice } from './expense-store-data-slice'
import { createNavSlice } from './expense-store-nav-slice'

export type { ExpenseModalTarget } from './expense-store-types'

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (...storeArgs) => ({
      ...createDataSlice(...storeArgs),
      ...createNavSlice(...storeArgs),
    }),
    {
      name: 'gastly-storage-temp',
      storage: createJSONStorage(() => localStorage),
      partialize: storeState => partialize(storeState),
      merge: (persisted, current) => {
        const persistedPartial = (persisted ?? {}) as Partial<ExpenseStore>
        return {
          ...current,
          budget:
            persistedPartial.budget !== undefined ? persistedPartial.budget : current.budget,
          expenses: Array.isArray(persistedPartial.expenses)
            ? persistedPartial.expenses
            : current.expenses,
          plannedExpenses: Array.isArray(persistedPartial.plannedExpenses)
            ? persistedPartial.plannedExpenses
            : current.plannedExpenses,
          plannedBudget:
            persistedPartial.plannedBudget !== undefined
              ? persistedPartial.plannedBudget
              : current.plannedBudget,
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
