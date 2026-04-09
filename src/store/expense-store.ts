import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  getActivePlanMonthKey,
  getStorageKey,
  partialize,
} from '../core/storage/persist-config'
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
        const activePlanMonthKey = getActivePlanMonthKey()
        const persistedPlanMonthKey = persistedPartial.plannedMonthKey
        const shouldReusePersistedPlan = persistedPlanMonthKey === activePlanMonthKey

        return {
          ...current,
          budget:
            persistedPartial.budget !== undefined ? persistedPartial.budget : current.budget,
          expenses: Array.isArray(persistedPartial.expenses)
            ? persistedPartial.expenses
            : current.expenses,
          plannedMonthKey: activePlanMonthKey,
          plannedExpenses:
            shouldReusePersistedPlan && Array.isArray(persistedPartial.plannedExpenses)
              ? persistedPartial.plannedExpenses
              : current.plannedExpenses,
          plannedBudget:
            shouldReusePersistedPlan && persistedPartial.plannedBudget !== undefined
              ? persistedPartial.plannedBudget
              : current.plannedBudget,
        }
      },
    },
  ),
)

let lastUserId: string | undefined = undefined
/** Evita que un segundo `rehydrateStore(uid)` resuelva antes que el primero (getSession + onAuthStateChange). */
let rehydrateInFlight: Promise<void> | null = null

export const rehydrateStore = async (userId?: string): Promise<void> => {
  if (userId === lastUserId) {
    if (rehydrateInFlight) await rehydrateInFlight
    return
  }

  lastUserId = userId

  const storageKey = getStorageKey(userId)

  useExpenseStore.persist.setOptions({ name: storageKey })

  const run = Promise.resolve(
    useExpenseStore.persist.rehydrate() as PromiseLike<void>,
  ).then(() => undefined)

  rehydrateInFlight = run
  void run.finally(() => {
    if (rehydrateInFlight === run) rehydrateInFlight = null
  })

  await run
}
