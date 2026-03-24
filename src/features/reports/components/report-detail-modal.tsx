import { useState } from 'react'
import { toast } from 'sonner'
import { Modal } from '../../../shared/ui/modal'
import { Icon } from '../../../shared/ui/icon'
import { Button } from '../../../shared/ui/button'
import { formatCurrency } from '../../../core/math/format'
import { CATEGORY_LABELS } from '../../../types'
import type { MonthlyReport } from '../../../types/database'

interface ReportDetailModalProps {
  report: MonthlyReport
  onClose: () => void
}

/**
 * ReportDetailModal — Muestra el detalle de un reporte mensual cerrado.
 */
export const ReportDetailModal = ({ report, onClose }: ReportDetailModalProps) => {
  const [downloading, setDownloading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(report.expenses.map((e, i) => e.id ?? String(i))),
  )

  const filename = `reporte-${report.label.toLowerCase().replace(/\s+/g, '-')}.pdf`

  const toggleExpense = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === report.expenses.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(report.expenses.map((e, i) => e.id ?? String(i))))
    }
  }

  const selectedExpenses = report.expenses.filter((e, i) => selectedIds.has(e.id ?? String(i)))

  const handleDownload = async () => {
    if (selectedExpenses.length === 0) return
    setDownloading(true)
    try {
      const { generateReportPdf } = await import('../services/report-pdf')
      const { downloadReport } = await import('../services/share-report')
      const blob = generateReportPdf(report, selectedExpenses)
      downloadReport(blob, filename)
      toast.success('PDF descargado')
    } catch {
      toast.error('Error al generar el PDF')
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    if (selectedExpenses.length === 0) return
    setSharing(true)
    try {
      const { generateReportPdf } = await import('../services/report-pdf')
      const { shareReport } = await import('../services/share-report')
      const blob = generateReportPdf(report, selectedExpenses)
      const result = await shareReport(blob, filename)
      if (result === 'downloaded') {
        toast.info('Tu navegador no soporta compartir archivos. El PDF se descargó.', {
          position: 'top-center',
          duration: 5000,
        })
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      toast.error('Error al compartir el reporte')
    } finally {
      setSharing(false)
    }
  }

  return (
    <Modal title={report.label} icon="receipt-dollar" onClose={onClose}>
      <div className="space-y-4">
        {/* Resumen */}
        <div className="rounded-lg border border-ds-border dark:border-dark-border p-4 space-y-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-ds-secondary dark:text-dark-secondary">Presupuesto</span>
            <span className="font-medium text-ds-text dark:text-dark-text">
              {formatCurrency(report.budget)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ds-secondary dark:text-dark-secondary">Total gastado</span>
            <span className="font-medium text-ds-text dark:text-dark-text">
              {formatCurrency(report.total_spent)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ds-secondary dark:text-dark-secondary">Saldo</span>
            <span
              className={`font-medium ${report.is_over_budget ? 'text-danger' : 'text-ds-text dark:text-dark-text'}`}
            >
              {formatCurrency(report.remaining_balance)}
            </span>
          </div>
        </div>

        {/* Lista de gastos con selección */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-medium text-ds-text dark:text-dark-text">
              Gastos ({selectedIds.size}/{report.expenses.length})
            </h3>
            <button
              type="button"
              onClick={toggleAll}
              className="text-[11px] text-primary hover:underline underline-offset-2 cursor-pointer"
            >
              {selectedIds.size === report.expenses.length
                ? 'Deseleccionar todo'
                : 'Seleccionar todo'}
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1.5">
            {report.expenses.map((expense, i) => {
              const id = expense.id ?? String(i)
              const isSelected = selectedIds.has(id)
              return (
                <div
                  key={id}
                  onClick={() => toggleExpense(id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[13px] cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                      : 'border-ds-border dark:border-dark-border opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`size-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-ds-border dark:border-dark-border'
                      }`}
                    >
                      {isSelected && <Icon name="check" size="xs" className="text-white" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-ds-text dark:text-dark-text truncate">
                        {expense.description || CATEGORY_LABELS[expense.category]}
                      </p>
                      <p className="text-[11px] text-ds-secondary dark:text-dark-secondary">
                        {CATEGORY_LABELS[expense.category]}
                        {expense.installment && ` · Cuota ${expense.installment}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-ds-text dark:text-dark-text shrink-0 ml-2">
                    {formatCurrency(expense.totalAmount)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Acciones PDF */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            leadingIcon="download"
            onClick={handleDownload}
            disabled={downloading || selectedIds.size === 0}
          >
            {downloading ? 'Generando...' : 'Descargar PDF'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            leadingIcon="share"
            onClick={handleShare}
            disabled={sharing || selectedIds.size === 0}
          >
            {sharing ? 'Compartiendo...' : 'Compartir'}
          </Button>
        </div>

        {/* Fecha de cierre */}
        <p className="text-[11px] text-ds-secondary dark:text-dark-secondary text-center">
          Cerrado el{' '}
          {new Date(report.closed_at).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </Modal>
  )
}
