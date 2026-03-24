import { supabase } from '../../../core/supabase/client'
import type { MonthlyReport } from '../../../types/database'

export type ReportInsert = Omit<MonthlyReport, 'id' | 'user_id'>

/**
 * Cierra el mes actual: inserta un reporte en Supabase con el snapshot de gastos.
 */
export const closeMonth = async (report: ReportInsert): Promise<{ error: string | null }> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No hay sesión activa' }

  const { error } = await supabase.from('monthly_reports').insert({
    user_id: user.id,
    label: report.label,
    closed_at: report.closed_at,
    budget: report.budget,
    total_spent: report.total_spent,
    remaining_balance: report.remaining_balance,
    is_over_budget: report.is_over_budget,
    expenses: report.expenses,
  })

  return { error: error?.message ?? null }
}

/**
 * Obtiene todos los reportes mensuales del usuario autenticado,
 * ordenados del más reciente al más antiguo.
 * Se filtra por user_id como defensa en profundidad además de RLS.
 */
export const fetchReports = async (): Promise<{
  data: MonthlyReport[]
  error: string | null
}> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [], error: 'No hay sesión activa' }

  const { data, error } = await supabase
    .from('monthly_reports')
    .select('*')
    .eq('user_id', user.id)
    .order('closed_at', { ascending: false })

  return {
    data: (data as MonthlyReport[]) ?? [],
    error: error?.message ?? null,
  }
}

/**
 * Elimina un reporte mensual por ID.
 */
export const deleteReport = async (id: string): Promise<{ error: string | null }> => {
  const { error } = await supabase.from('monthly_reports').delete().eq('id', id)
  return { error: error?.message ?? null }
}
