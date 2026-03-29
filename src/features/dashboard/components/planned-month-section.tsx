import { useEffect, useMemo } from 'react'
import { useExpenseStore } from '../../../store/expense-store'
import { calcTotalSpent, calcRemainingBalance } from '../../../core/math/finance'
import { usePlannedExpenses } from '../../expenses/hooks/use-planned-expenses'
import { useImportInstallmentsToPlan } from '../../expenses/hooks/use-import-installments-to-plan'
import { BudgetSummary, BudgetForm } from '../../budget'
import { ExpenseItem } from '../../expenses'
import { Button } from '../../../shared/ui/button'
import { Icon } from '../../../shared/ui/icon'
import { useApplyClosedReportBudgetToPlan } from '../hooks/use-apply-closed-report-budget-to-plan'
import type { MonthlyReport } from '../../../types/database'

type PlannedMonthSectionProps = {
  ledgerMonthLabel: string
  paymentMonthLabel: string
  planTargetMonthName: string
  reports: MonthlyReport[]
  reportsLoading: boolean
}

export const PlannedMonthSection = ({
  ledgerMonthLabel,
  paymentMonthLabel,
  planTargetMonthName,
  reports,
  reportsLoading,
}: PlannedMonthSectionProps) => {
  const {
    plannedExpenses,
    handleEdit: handlePlannedEdit,
    handleDelete: handlePlannedDelete,
    handleClearPlan,
  } = usePlannedExpenses()
  const { isImportingInstallments, importFromLatestClosedMonth, latestClosedMonthLabel } =
    useImportInstallmentsToPlan(reports)

  const openPlannedModal = useExpenseStore(state => state.openPlannedModal)
  const plannedBudget = useExpenseStore(state => state.plannedBudget)
  const setPlannedBudget = useExpenseStore(state => state.setPlannedBudget)
  const prefillPlannedBudgetFromLastReport = useExpenseStore(
    state => state.prefillPlannedBudgetFromLastReport,
  )

  const { applyLatestClosedReportBudget } = useApplyClosedReportBudgetToPlan(
    reports,
    setPlannedBudget,
  )

  useEffect(() => {
    void prefillPlannedBudgetFromLastReport()
  }, [prefillPlannedBudgetFromLastReport])

  const plannedTotalSpent = useMemo(() => calcTotalSpent(plannedExpenses), [plannedExpenses])
  const plannedRemaining = useMemo(() => {
    const cap = plannedBudget?.amount ?? 0
    return calcRemainingBalance(cap, plannedTotalSpent)
  }, [plannedBudget?.amount, plannedTotalSpent])
  const isPlannedOverBudget = plannedRemaining < 0
  const isPlanEmpty = plannedExpenses.length === 0 && !plannedBudget

  return (
    <section className="mt-10">
      <div className="mb-4 border-b border-ds-border dark:border-dark-border pb-4 flex flex-col gap-4">
        <div className="w-full min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-ds-text dark:text-dark-text">
            A pagar en {planTargetMonthName}
          </h2>
          <p className="text-[12px] text-ds-secondary dark:text-dark-secondary mt-2 w-full max-w-2xl leading-relaxed text-pretty">
            <span className="text-ds-text dark:text-dark-text font-medium">
              Ledger (registro): {ledgerMonthLabel}
            </span>
            . Ese resumen suele liquidarse en{' '}
            <strong className="text-ds-text dark:text-dark-text">{paymentMonthLabel}</strong>. Acá
            proyectás lo que estimás{' '}
            <strong className="text-ds-text dark:text-dark-text">
              a pagar en {planTargetMonthName}
            </strong>
            . El presupuesto de referencia se puede cargar desde el último mes cerrado y editarlo.
            Con <strong className="text-ds-text dark:text-dark-text">Traer cuotas</strong> sumás al
            plan la siguiente cuota de cada compra en tarjeta del último mes cerrado (ej. si en el
            reporte figura 1/3, entra 2/3). Los gastos nuevos los cargás con Agregar gasto. Nada de
            esto suma al ledger de {ledgerMonthLabel}; si registrás una compra en cuotas en el
            ledger, la siguiente cuota puede aparecer sola en este plan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full">
          <Button variant="secondary" size="sm" leadingIcon="add" onClick={openPlannedModal}>
            {plannedExpenses.length === 0 ? 'Agregar gasto' : 'Agregar más gastos'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leadingIcon="credit-card"
            loading={isImportingInstallments}
            disabled={isImportingInstallments || (reportsLoading && reports.length === 0)}
            title={
              reportsLoading && reports.length === 0
                ? 'Cargando reportes…'
                : 'Siguiente cuota de cada gasto en tarjeta del último mes cerrado'
            }
            onClick={() => {
              void importFromLatestClosedMonth()
            }}
          >
            {reportsLoading && reports.length === 0
              ? 'Cargando reportes…'
              : latestClosedMonthLabel
                ? `Traer cuotas (${latestClosedMonthLabel})`
                : 'Traer cuotas del mes cerrado'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leadingIcon="archive"
            disabled={reportsLoading && reports.length === 0}
            title={
              reportsLoading && reports.length === 0
                ? 'Cargando reportes…'
                : 'Usa el presupuesto del último mes cerrado'
            }
            onClick={() => {
              void applyLatestClosedReportBudget()
            }}
          >
            Presupuesto del mes cerrado
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leadingIcon="delete"
            disabled={isPlanEmpty}
            title={isPlanEmpty ? 'No hay plan para vaciar' : undefined}
            onClick={handleClearPlan}
            className="text-ds-secondary hover:text-danger!"
          >
            Vaciar plan
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <BudgetForm
          key={plannedBudget ? `pb-${plannedBudget.configuredAt}` : 'pb-new'}
          onSubmit={setPlannedBudget}
          isEditing={!!plannedBudget}
          initialValue={plannedBudget?.amount}
          fieldLabel={`Presupuesto a pagar en ${planTargetMonthName}`}
        />
      </div>

      {plannedBudget && (
        <div className="mb-8">
          <BudgetSummary
            budgetAmount={plannedBudget.amount}
            totalSpent={plannedTotalSpent}
            remainingBalance={plannedRemaining}
            isOverBudget={isPlannedOverBudget}
            budgetFooterNote={`Para ${planTargetMonthName}`}
            remainingFooterNote={
              isPlannedOverBudget
                ? 'Superaste el presupuesto planificado'
                : 'Dentro del presupuesto planificado'
            }
          />
        </div>
      )}

      {plannedExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-ds-border dark:border-dark-border bg-surface/30 dark:bg-dark-surface/10 rounded-none">
          <Icon
            name="calendar-check"
            size="xl"
            className="text-ds-secondary/40 dark:text-dark-secondary/40 mb-3"
          />
          <p className="text-sm text-ds-secondary dark:text-dark-secondary text-center max-w-[320px]">
            Todavía no hay ítems en el plan. Agregá suscripciones o la próxima cuota de compras en
            tarjeta.
          </p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={openPlannedModal}>
            Agregar gasto
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ds-secondary dark:text-dark-secondary px-1 pb-3 mb-1 border-b border-ds-border dark:border-dark-border">
            Movimientos del plan · a pagar en {planTargetMonthName}
          </p>
          <ul className="flex flex-col gap-2">
            {plannedExpenses.map(expense => (
              <li key={expense.id}>
                <ExpenseItem
                  expense={expense}
                  onEdit={handlePlannedEdit}
                  onDelete={handlePlannedDelete}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
