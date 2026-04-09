import { supabase } from '../../../core/supabase/client'
import type { Budget, Expense } from '../../../types'

type UserMonthlyPlanRow = {
  user_id: string
  target_month: string
  planned_expenses: Expense[]
  planned_budget: Budget | null
  updated_at: string
}

const isBudget = (value: unknown): value is Budget => {
  if (value === null || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  return typeof o.amount === 'number' && typeof o.configuredAt === 'string'
}

const parsePlanRow = (
  row: UserMonthlyPlanRow,
): { plannedMonthKey: string; plannedExpenses: Expense[]; plannedBudget: Budget | null } => {
  const raw = row.planned_expenses
  const plannedExpenses = Array.isArray(raw) ? (raw as Expense[]) : []
  const plannedBudget = isBudget(row.planned_budget) ? row.planned_budget : null
  return {
    plannedMonthKey: row.target_month,
    plannedExpenses,
    plannedBudget,
  }
}

export const fetchUserPlanFromRemote = async (targetMonthKey: string): Promise<{
  plannedMonthKey: string
  plannedExpenses: Expense[]
  plannedBudget: Budget | null
} | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_monthly_plan')
    .select('*')
    .eq('user_id', user.id)
    .eq('target_month', targetMonthKey)
    .maybeSingle()

  if (error) return null
  if (!data) return null
  return parsePlanRow(data as UserMonthlyPlanRow)
}

export const upsertUserPlanRemote = async (
  targetMonthKey: string,
  plannedExpenses: Expense[],
  plannedBudget: Budget | null,
): Promise<{ error: string | null }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No hay sesión activa' }

  const { error } = await supabase.from('user_monthly_plan').upsert(
    {
      user_id: user.id,
      target_month: targetMonthKey,
      planned_expenses: plannedExpenses,
      planned_budget: plannedBudget,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,target_month' },
  )

  return { error: error?.message ?? null }
}
