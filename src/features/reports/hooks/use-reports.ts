import { useState, useEffect, useCallback } from 'react'
import type { MonthlyReport } from '../../../types/database'
import { fetchReports, closeMonth, deleteReport, updateReport } from '../services/report-service'
import type { ReportInsert, ReportUpdatePayload } from '../services/report-service'
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
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null)

  const syncReportsFromServer = useCallback(async () => {
    if (!user) {
      clearReportsState(setReports, setLoading)
      return
    }
    setLoading(true)
    const outcome = await fetchReports()
    commitFetchReportsOutcome(outcome, setReports, setLoading)
  }, [user])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!user) {
        clearReportsState(setReports, setLoading)
        return
      }
      setLoading(true)
      const outcome = await fetchReports()
      if (cancelled) return
      commitFetchReportsOutcome(outcome, setReports, setLoading)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [user])

  const handleCloseMonth = useCallback(
    async (report: ReportInsert, onSuccess?: () => void) => {
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
