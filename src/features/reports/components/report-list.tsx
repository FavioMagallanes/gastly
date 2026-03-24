import { Icon } from '../../../shared/ui/icon'
import { Button } from '../../../shared/ui/button'
import { Spinner } from '../../../shared/ui/spinner'
import { formatCurrency } from '../../../core/math/format'
import type { MonthlyReport } from '../../../types/database'

interface ReportListProps {
  reports: MonthlyReport[]
  loading: boolean
  onSelect: (report: MonthlyReport) => void
  onDelete: (id: string, label: string) => void
}

/**
 * ReportList — Lista de reportes mensuales cerrados.
 */
export const ReportList = ({ reports, loading, onSelect, onDelete }: ReportListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="text-ds-secondary dark:text-dark-secondary" />
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-ds-secondary dark:text-dark-secondary text-[13px]">
        <Icon name="receipt-dollar" size="2xl" className="mx-auto mb-2 opacity-40" />
        <p>No hay reportes guardados</p>
        <p className="text-[11px] mt-1">Cerrá tu primer mes para generar un reporte</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {reports.map(report => (
        <div
          key={report.id}
          className="group rounded-lg border border-ds-border dark:border-dark-border p-3 hover:bg-surface dark:hover:bg-dark-hover transition-colors cursor-pointer"
          onClick={() => onSelect(report)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelect(report)
            }
          }}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ds-text dark:text-dark-text">
                {report.label}
              </p>
              <div className="flex items-center gap-3 mt-0.5 text-[11px] text-ds-secondary dark:text-dark-secondary">
                <span>{formatCurrency(report.total_spent, 0)} gastado</span>
                <span
                  className={
                    report.is_over_budget
                      ? 'text-danger'
                      : 'text-ds-secondary dark:text-dark-secondary'
                  }
                >
                  {report.is_over_budget
                    ? 'Excedido'
                    : `${formatCurrency(report.remaining_balance, 0)} restante`}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Eliminar reporte ${report.label}`}
              onClick={e => {
                e.stopPropagation()
                onDelete(report.id, report.label)
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              leadingIcon="delete"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
