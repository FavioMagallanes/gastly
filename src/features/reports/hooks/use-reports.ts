import { useState, useEffect, useCallback } from 'react'
import type { MonthlyReport } from '../../../types/database'
import { getPlanMonthContext } from '../../../core/date/plan-month-labels'
import { fetchReports, closeMonth, deleteReport, updateReport } from '../services/report-service'
import type { ReportInsert, ReportUpdatePayload } from '../services/report-service'
import { LEDGER_SEALED_HINT } from '../../../core/copy/ledger-sealed-hint'
import { isLedgerCycleReported } from '../utils/is-ledger-cycle-reported'
import { getPrimedReports } from '../utils/reports-prime-cache'
import { useAuth } from '../../auth'
import { toast } from 'sonner'

const notifyReportsLoadError = (message: string) => {
  toast.error(`Error al cargar reportes: ${message}`)
}

type FetchReportsOutcome = Awaited<ReturnType<typeof fetchReports>>

const clearReportsState = (
  setReports: (value: MonthlyReport[]) => void,
  setLoading: (value: boolean) => void,
) => {
  setReports([])
  setLoading(false)
}

const commitFetchReportsOutcome = (
  { data, error }: FetchReportsOutcome,
  setReports: (value: MonthlyReport[]) => void,
  setLoading: (value: boolean) => void,
) => {
  if (error) {
    notifyReportsLoadError(error)
  } else {
    setReports(data)
  }
  setLoading(false)
}

export const useReports = () => {
  const { user } = useAuth()
  const userId = user?.id

  const [reports, setReports] = useState<MonthlyReport[]>(() =>
    user?.id ? getPrimedReports(user.id) ?? [] : [],
  )
  const [loading, setLoading] = useState(
    () => (user?.id ? getPrimedReports(user.id) === null : false),
  )
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null)

  const syncReportsFromServer = useCallback(async () => {
    if (!userId) {
      clearReportsState(setReports, setLoading)
      return
    }
    setLoading(true)
    const outcome = await fetchReports()
    commitFetchReportsOutcome(outcome, setReports, setLoading)
  }, [userId])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!userId) {
        clearReportsState(setReports, setLoading)
        return
      }
      const skipLoadingUi = getPrimedReports(userId) !== null
      if (!skipLoadingUi) setLoading(true)
      const outcome = await fetchReports()
      if (cancelled) return
      commitFetchReportsOutcome(outcome, setReports, setLoading)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [userId])

  const handleCloseMonth = useCallback(
    async (report: ReportInsert, onSuccess?: () => void) => {
      const { data: latest, error: fetchErr } = await fetchReports()
      if (fetchErr) {
        toast.error(`No se pudo verificar reportes: ${fetchErr}`)
        return
      }
      const { ledgerMonthLabel, paymentMonthLabel } = getPlanMonthContext()
      if (isLedgerCycleReported(latest, ledgerMonthLabel, paymentMonthLabel)) {
        toast.error(LEDGER_SEALED_HINT)
        return
      }
      const { error } = await closeMonth(report)
      if (error) {
        toast.error(`Error al cerrar el mes: ${error}`)
        return
      }
      toast.success(`Reporte "${report.label}" guardado`)
      await syncReportsFromServer()
      onSuccess?.()
    },
    [syncReportsFromServer],
  )

  const handleDeleteReport = useCallback(
    async (id: string, label: string) => {
      const { error } = await deleteReport(id)
      if (error) {
        toast.error(`Error al eliminar: ${error}`)
        return
      }
      toast.success(`Reporte "${label}" eliminado`)
      setReports(prev => prev.filter(report => report.id !== id))
      setSelectedReport(prev => (prev?.id === id ? null : prev))
    },
    [],
  )

  const handleUpdateReport = useCallback(
    async (id: string, payload: ReportUpdatePayload) => {
      const { data, error } = await updateReport(id, payload)
      if (error || !data) {
        toast.error(`Error al guardar: ${error ?? 'Sin respuesta'}`)
        return false
      }
      toast.success('Reporte actualizado')
      setReports(prev => prev.map(report => (report.id === id ? data : report)))
      setSelectedReport(prev => (prev?.id === id ? data : prev))
      return true
    },
    [],
  )

  return {
    reports,
    loading,
    selectedReport,
    setSelectedReport,
    handleCloseMonth,
    handleDeleteReport,
    handleUpdateReport,
    refreshReports: syncReportsFromServer,
  }
}
