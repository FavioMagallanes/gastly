import { Modal } from '../../../shared/ui/modal'
import { Icon } from '../../../shared/ui/icon'
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

        {/* Lista de gastos */}
        <div>
          <h3 className="text-[13px] font-medium text-ds-text dark:text-dark-text mb-2">
            Gastos ({report.expenses.length})
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-1.5">
            {report.expenses.map((expense, i) => (
              <div
                key={expense.id ?? i}
                className="flex items-center justify-between rounded-lg border border-ds-border dark:border-dark-border px-3 py-2 text-[13px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon
                    name="credit-card"
                    size="sm"
                    className="text-ds-secondary dark:text-dark-secondary shrink-0"
                  />
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
            ))}
          </div>
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
