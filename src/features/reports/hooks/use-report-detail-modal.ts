import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { calcRemainingBalance, calcTotalSpent } from '../../../core/math/finance'
import type { Expense } from '../../../types'
import type { MonthlyReport } from '../../../types/database'
import type { ReportUpdatePayload } from '../services/report-service'
import { confirmToast } from '../../../shared/ui/confirm-toast'

export const getExpenseRowKey = (expense: Expense, index: number) => expense.id ?? String(index)

type SubModalState = null | 'new' | Expense

export const useReportDetailModal = (
  report: MonthlyReport,
  onUpdate: (id: string, payload: ReportUpdatePayload) => Promise<boolean>,
) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draftExpenses, setDraftExpenses] = useState<Expense[]>([])
  const [draftBudget, setDraftBudget] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [subModal, setSubModal] = useState<SubModalState>(null)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isSharingPdf, setIsSharingPdf] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(
    () =>
      new Set(
        report.expenses.map((expense, index) => getExpenseRowKey(expense, index)),
      ),
  )

  useEffect(() => {
    setSelectedRowKeys(
      new Set(report.expenses.map((expense, index) => getExpenseRowKey(expense, index))),
    )
    setIsEditing(false)
    setSubModal(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cambiar de reporte
  }, [report.id])

  const handleStartEdit = useCallback(() => {
    setDraftExpenses(report.expenses.map(expense => ({ ...expense })))
    setDraftBudget(String(report.budget))
    setSelectedRowKeys(
      new Set(report.expenses.map((expense, index) => getExpenseRowKey(expense, index))),
    )
    setIsEditing(true)
  }, [report.budget, report.expenses])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setSubModal(null)
    setSelectedRowKeys(
      new Set(report.expenses.map((expense, index) => getExpenseRowKey(expense, index))),
    )
  }, [report.expenses])

  const listExpenses = isEditing ? draftExpenses : report.expenses

  const reportForExport: MonthlyReport = useMemo(() => {
    if (!isEditing) return report
    const draftBudgetAmount = parseFloat(draftBudget.replace(',', '.')) || 0
    const totalSpent = calcTotalSpent(draftExpenses)
    const remainingBalance = calcRemainingBalance(draftBudgetAmount, totalSpent)
    return {
      ...report,
      budget: draftBudgetAmount,
      total_spent: totalSpent,
      remaining_balance: remainingBalance,
      is_over_budget: remainingBalance < 0,
      expenses: draftExpenses,
    }
  }, [isEditing, report, draftBudget, draftExpenses])

  const summaryBudget = reportForExport.budget
  const summaryTotalSpent = reportForExport.total_spent
  const summaryRemaining = reportForExport.remaining_balance
  const summaryOverBudget = reportForExport.is_over_budget

  const pdfFilename = `reporte-${report.label.toLowerCase().replace(/\s+/g, '-')}.pdf`

  const toggleRowSelection = useCallback((rowKey: string) => {
    setSelectedRowKeys(previous => {
      const next = new Set(previous)
      if (next.has(rowKey)) next.delete(rowKey)
      else next.add(rowKey)
      return next
    })
  }, [])

  const toggleSelectAllRows = useCallback(() => {
    if (selectedRowKeys.size === listExpenses.length) {
      setSelectedRowKeys(new Set())
      return
    }
    setSelectedRowKeys(
      new Set(listExpenses.map((expense, index) => getExpenseRowKey(expense, index))),
    )
  }, [listExpenses, selectedRowKeys.size])

  const selectedExpenses = listExpenses.filter((expense, index) =>
    selectedRowKeys.has(getExpenseRowKey(expense, index)),
  )

  const handleDownloadPdf = useCallback(async () => {
    if (selectedExpenses.length === 0) return
    setIsDownloadingPdf(true)
    try {
      const { generateReportPdf } = await import('../services/report-pdf')
      const { downloadReport } = await import('../services/share-report')
      const blob = await generateReportPdf(reportForExport, selectedExpenses)
      downloadReport(blob, pdfFilename)
      toast.success('PDF descargado')
    } catch {
      toast.error('Error al generar el PDF')
    } finally {
      setIsDownloadingPdf(false)
    }
  }, [pdfFilename, reportForExport, selectedExpenses])

  const handleSharePdf = useCallback(async () => {
    if (selectedExpenses.length === 0) return
    setIsSharingPdf(true)
    try {
      const { generateReportPdf } = await import('../services/report-pdf')
      const { shareReport } = await import('../services/share-report')
      const blob = await generateReportPdf(reportForExport, selectedExpenses)
      const result = await shareReport(blob, pdfFilename)
      if (result === 'unsupported') {
        toast.info(
          'Tu navegador no soporta compartir archivos. Usá el botón "Descargar PDF" para guardarlo.',
          { position: 'top-center', duration: 5000 },
        )
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      toast.error('Error al compartir el reporte')
    } finally {
      setIsSharingPdf(false)
    }
  }, [pdfFilename, reportForExport, selectedExpenses])

  const handleSaveReport = useCallback(async () => {
    const draftBudgetAmount = parseFloat(draftBudget.replace(',', '.'))
    if (Number.isNaN(draftBudgetAmount) || draftBudgetAmount < 0) {
      toast.error('Ingresá un presupuesto válido')
      return
    }
    if (draftExpenses.length === 0) {
      toast.error('El reporte debe tener al menos un gasto')
      return
    }
    const totalSpent = calcTotalSpent(draftExpenses)
    const remainingBalance = calcRemainingBalance(draftBudgetAmount, totalSpent)
    const payload: ReportUpdatePayload = {
      budget: draftBudgetAmount,
      total_spent: totalSpent,
      remaining_balance: remainingBalance,
      is_over_budget: remainingBalance < 0,
      expenses: draftExpenses,
    }
    setIsSaving(true)
    const saveSucceeded = await onUpdate(report.id, payload)
    setIsSaving(false)
    if (saveSucceeded) setIsEditing(false)
  }, [draftBudget, draftExpenses, onUpdate, report.id])

  const handleDeleteDraftExpense = useCallback((expense: Expense, index: number) => {
    const rowKey = getExpenseRowKey(expense, index)
    confirmToast({
      title: '¿Eliminar este gasto?',
      description: 'Se quitará del reporte al guardar los cambios.',
      confirmLabel: 'Eliminar',
      onConfirm: () => {
        setDraftExpenses(previous =>
          previous.filter((_, rowIndex) => rowIndex !== index),
        )
        setSelectedRowKeys(previous => {
          const next = new Set(previous)
          next.delete(rowKey)
          return next
        })
      },
    })
  }, [])

  const handleCommitExpenseFromSubModal = useCallback((expense: Expense) => {
    setDraftExpenses(previous => {
      const existingIndex = previous.findIndex(row => row.id === expense.id)
      if (existingIndex === -1) return [...previous, expense]
      const next = [...previous]
      next[existingIndex] = expense
      return next
    })
    setSelectedRowKeys(previous => {
      const next = new Set(previous)
      next.add(expense.id)
      return next
    })
    setSubModal(null)
  }, [])

  return {
    isEditing,
    subModal,
    setSubModal,
    isSaving,
    draftBudget,
    setDraftBudget,
    listExpenses,
    selectedRowKeys,
    summaryBudget,
    summaryTotalSpent,
    summaryRemaining,
    summaryOverBudget,
    closedAtLabel: new Date(report.closed_at).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    isDownloadingPdf,
    isSharingPdf,
    handleStartEdit,
    handleCancelEdit,
    handleSaveReport,
    handleDownloadPdf,
    handleSharePdf,
    toggleRowSelection,
    toggleSelectAllRows,
    handleDeleteDraftExpense,
    handleCommitExpenseFromSubModal,
  }
}
