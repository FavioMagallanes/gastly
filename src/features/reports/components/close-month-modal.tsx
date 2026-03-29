import { useState } from 'react'
import { Modal } from '../../../shared/ui/modal'
import { Button } from '../../../shared/ui/button'
import { getPlanMonthContext } from '../../../core/date/plan-month-labels'
import { formatCurrency } from '../../../core/math/format'
import { useExpenseStore } from '../../../store/expense-store'
import type { ReportInsert } from '../services/report-service'

interface CloseMonthModalProps {
  onClose: () => void
  onConfirm: (report: ReportInsert, onSuccess: () => void) => void
}

/**
 * CloseMonthModal — Confirma el cierre del mes actual.
 * Muestra un resumen y al confirmar guarda el snapshot en Supabase.
 */
export const CloseMonthModal = ({ onClose, onConfirm }: CloseMonthModalProps) => {
  const budget = useExpenseStore(state => state.budget)
  const expenses = useExpenseStore(state => state.expenses)
  const getSummary = useExpenseStore(state => state.getSummary)
  const resetAll = useExpenseStore(state => state.resetAll)
  const resetExpenses = useExpenseStore(state => state.resetExpenses)
  const [submitting, setSubmitting] = useState(false)
  const [keepBudget, setKeepBudget] = useState(true)

  const summary = getSummary()
  const { nextMonthLabel } = getPlanMonthContext()

  const monthLabel = new Date().toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })
  // Capitalizar primera letra
  const label = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  const handleConfirm = () => {
    if (submitting) return
    setSubmitting(true)

    const report: ReportInsert = {
      label,
      closed_at: new Date().toISOString(),
      budget: budget?.amount ?? 0,
      total_spent: summary.totalSpent,
      remaining_balance: summary.remainingBalance,
      is_over_budget: summary.isOverBudget,
      expenses: expenses,
    }

    onConfirm(report, () => {
      if (keepBudget) {
        resetExpenses()
      } else {
        resetAll()
      }
      onClose()
    })
  }

  return (
    <Modal title="Cerrar mes" icon="calendar-check" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-[13px] text-ds-secondary dark:text-dark-secondary">
          Vas a guardar el reporte de{' '}
          <strong className="text-ds-text dark:text-dark-text">{label}</strong> y reiniciar los
          datos del mes actual.
        </p>

        {/* Resumen */}
        <div className="rounded-lg border border-ds-border dark:border-dark-border p-4 space-y-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-ds-secondary dark:text-dark-secondary">Presupuesto</span>
            <span className="font-medium text-ds-text dark:text-dark-text">
              {formatCurrency(budget?.amount ?? 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ds-secondary dark:text-dark-secondary">Total gastado</span>
            <span className="font-medium text-ds-text dark:text-dark-text">
              {formatCurrency(summary.totalSpent)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ds-secondary dark:text-dark-secondary">Saldo</span>
            <span
              className={`font-medium ${summary.isOverBudget ? 'text-danger' : 'text-ds-text dark:text-dark-text'}`}
            >
              {formatCurrency(summary.remainingBalance)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ds-secondary dark:text-dark-secondary">Gastos</span>
            <span className="font-medium text-ds-text dark:text-dark-text">{expenses.length}</span>
          </div>
        </div>

        {/* Opción para conservar presupuesto */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={keepBudget}
            onChange={e => setKeepBudget(e.target.checked)}
            className="size-4 rounded border-ds-border dark:border-dark-border accent-primary cursor-pointer"
          />
          <span className="text-[13px] text-ds-text dark:text-dark-text">
            Mantener presupuesto para {nextMonthLabel}
          </span>
        </label>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="md" fullWidth onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleConfirm}
            loading={submitting}
            disabled={!budget || expenses.length === 0}
          >
            {submitting ? 'Cerrando...' : 'Cerrar mes'}
          </Button>
        </div>

        {(!budget || expenses.length === 0) && (
          <p className="text-[12px] text-ds-secondary dark:text-dark-secondary text-center">
            Necesitás tener presupuesto y al menos un gasto para cerrar el mes.
          </p>
        )}
      </div>
    </Modal>
  )
}
