import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { collectNextInstallmentPlanPayloadsFromReportExpenses } from '../../../core/expense/planned-advance'
import { useExpenseStore } from '../../../store/expense-store'
import { fetchReports } from '../../reports/services/report-service'
import type { MonthlyReport } from '../../../types/database'

export const useImportInstallmentsToPlan = (reports: MonthlyReport[]) => {
  const [isImportingInstallments, setIsImportingInstallments] = useState(false)

  const importFromLatestClosedMonth = useCallback(async () => {
    setIsImportingInstallments(true)
    try {
      let report: MonthlyReport | undefined = reports[0]
      if (!report) {
        const { data, error } = await fetchReports()
        if (error) {
          toast.error(`No se pudo cargar reportes: ${error}`)
          return
        }
        report = data[0]
      }

      if (!report) {
        toast.info('No hay un mes cerrado para tomar como referencia')
        return
      }

      const { plannedExpenses, addPlannedExpense } = useExpenseStore.getState()
      const installmentPayloads = collectNextInstallmentPlanPayloadsFromReportExpenses(
        report.expenses,
        plannedExpenses,
      )

      if (installmentPayloads.length === 0) {
        toast.info(
          'No hay cuotas pendientes para traer (o ya están en el plan). Solo se incluyen gastos en tarjeta con cuota X/Y y X menor al total.',
        )
        return
      }

      for (const payload of installmentPayloads) {
        addPlannedExpense(payload)
      }

      toast.success(
        installmentPayloads.length === 1
          ? 'Se agregó 1 cuota al plan desde el mes cerrado'
          : `Se agregaron ${installmentPayloads.length} cuotas al plan desde el mes cerrado`,
      )
    } finally {
      setIsImportingInstallments(false)
    }
  }, [reports])

  const latestClosedMonthLabel = reports[0]?.label

  return {
    isImportingInstallments,
    importFromLatestClosedMonth,
    latestClosedMonthLabel,
  }
}
