import type { StateCreator } from 'zustand'
import type { Expense } from '../types'
import type { ExpenseModalTarget, ExpenseStore, NavSlice } from './expense-store-types'
import { INITIAL_NAV_STATE } from './expense-store-entities'

export const createNavSlice: StateCreator<ExpenseStore, [], [], NavSlice> = set => ({
  ...INITIAL_NAV_STATE,

  openModal: () =>
    set({ isModalOpen: true, editingExpense: null, expenseModalTarget: 'current' }),

  openPlannedModal: () =>
    set({ isModalOpen: true, editingExpense: null, expenseModalTarget: 'planned' }),

  closeModal: () => set({ ...INITIAL_NAV_STATE }),

  openEditModal: (expense: Expense, target: ExpenseModalTarget = 'current') =>
    set({ isModalOpen: true, editingExpense: expense, expenseModalTarget: target }),
})
