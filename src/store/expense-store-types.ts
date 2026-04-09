import type { Expense, Budget, MonthlySummary } from '../types'

export type ExpenseModalTarget = 'current' | 'planned'

export type NavSlice = {
  isModalOpen: boolean
  editingExpense: Expense | null
  expenseModalTarget: ExpenseModalTarget
  openModal: () => void
  openPlannedModal: () => void
  closeModal: () => void
  openEditModal: (expense: Expense, target?: ExpenseModalTarget) => void
}

export type DataSlice = {
  budget: Budget | null
  expenses: Expense[]
  /** Clave YYYY-MM del mes objetivo al que pertenece el plan persistido. */
  plannedMonthKey: string
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
  /** Reemplaza plan local con datos de Supabase (tras fetch). */
  hydratePlannedFromRemote: (payload: {
    plannedMonthKey: string
    plannedExpenses: Expense[]
    plannedBudget: Budget | null
  }) => void
  resetAll: () => void
  resetExpenses: () => void
  getSummary: () => MonthlySummary
}

export type ExpenseStore = DataSlice & NavSlice
