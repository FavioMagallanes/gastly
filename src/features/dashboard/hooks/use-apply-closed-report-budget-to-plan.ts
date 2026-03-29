import { useCallback } from 'react'
import { toast } from 'sonner'
import { formatCurrency } from '../../../core/math/format'
import { fetchReports } from '../../reports/services/report-service'
import type { MonthlyReport } from '../../../types/database'

/**
 * Copia el presupuesto del último mes cerrado al plan del mes siguiente (estado local).
 */
export const useApplyClosedReportBudgetToPlan = (
  cachedReports: MonthlyReport[],
  setPlannedBudget: (amount: number) => void,
) => {
  const applyLatestClosedReportBudget = useCallback(async () => {
    const latestFromCache = cachedReports[0]
    if (latestFromCache) {
      setPlannedBudget(latestFromCache.budget)
      toast.success(
        `Presupuesto del plan: ${formatCurrency(latestFromCache.budget)} (${latestFromCache.label})`,
      )
      return
    }

    const { data, error } = await fetchReports()
    if (error) {
      toast.error(error)
      return
    }

    const latestFetchedReport = data[0]
    if (!latestFetchedReport) {
      toast.info('No hay un mes cerrado para copiar el presupuesto.')
      return
    }

    setPlannedBudget(latestFetchedReport.budget)
    toast.success(
      `Presupuesto del plan: ${formatCurrency(latestFetchedReport.budget)} (${latestFetchedReport.label})`,
    )
  }, [cachedReports, setPlannedBudget])

  return { applyLatestClosedReportBudget }
}
