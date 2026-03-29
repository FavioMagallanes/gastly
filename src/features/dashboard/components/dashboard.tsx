import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { useExpenseStore } from '../../../store/expense-store'
import { calcTotalSpent, calcRemainingBalance } from '../../../core/math/finance'
import { formatCurrency } from '../../../core/math/format'
import { fetchReports } from '../../reports/services/report-service'
import { useBudget, BudgetSummary, BudgetForm } from '../../budget'
import {
  useExpenses,
  usePlannedExpenses,
  ExpenseList,
  ExpenseItem,
  ResetButton,
} from '../../expenses'
import { useImportInstallmentsToPlan } from '../../expenses/hooks/use-import-installments-to-plan'
import { useReports, ReportList, CloseMonthModal, ReportDetailModal } from '../../reports'
import { useAuth } from '../../auth'
import { Button } from '../../../shared/ui/button'
import { Icon } from '../../../shared/ui/icon'
import { ThemeToggle } from '../../../shared/ui/theme-toggle'
import { getPlanMonthContext } from '../../../core/date/plan-month-labels'

export const Dashboard = () => {
  const { budget, remainingBalance, totalSpent, isOverBudget, handleSetBudget } = useBudget()
  const { expenses, handleEdit, handleDelete } = useExpenses()
  const {
    plannedExpenses,
    handleEdit: handlePlannedEdit,
    handleDelete: handlePlannedDelete,
    handleClearPlan,
  } = usePlannedExpenses()
  const {
    reports,
    loading: reportsLoading,
    selectedReport,
    setSelectedReport,
    handleCloseMonth,
    handleDeleteReport,
    handleUpdateReport,
  } = useReports()
  const {
    importing: importingInstallmentsToPlan,
    importFromLatestClosedMonth,
    latestClosedLabel,
  } = useImportInstallmentsToPlan(reports)
  const { signOut } = useAuth()
  const openModal = useExpenseStore(s => s.openModal)
  const openPlannedModal = useExpenseStore(s => s.openPlannedModal)
  const resetAll = useExpenseStore(s => s.resetAll)
  const plannedBudget = useExpenseStore(s => s.plannedBudget)
  const setPlannedBudget = useExpenseStore(s => s.setPlannedBudget)
  const prefillPlannedBudgetFromLastReport = useExpenseStore(s => s.prefillPlannedBudgetFromLastReport)

  const [showCloseMonthModal, setShowCloseMonthModal] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [showPlanned, setShowPlanned] = useState(false)

  const { currentMonthLabel, nextMonthLabel } = useMemo(() => getPlanMonthContext(), [])

  const plannedTotalSpent = useMemo(() => calcTotalSpent(plannedExpenses), [plannedExpenses])
  const plannedRemaining = useMemo(() => {
    const cap = plannedBudget?.amount ?? 0
    return calcRemainingBalance(cap, plannedTotalSpent)
  }, [plannedBudget?.amount, plannedTotalSpent])
  const plannedOverBudget = plannedRemaining < 0

  useEffect(() => {
    if (!showPlanned) return
    void prefillPlannedBudgetFromLastReport()
  }, [showPlanned, prefillPlannedBudgetFromLastReport])

  const handleApplyLastClosedBudget = async () => {
    const fromList = reports[0]
    if (fromList) {
      setPlannedBudget(fromList.budget)
      toast.success(`Presupuesto del plan: ${formatCurrency(fromList.budget)} (${fromList.label})`)
      return
    }
    const { data, error } = await fetchReports()
    if (error) {
      toast.error(error)
      return
    }
    const r = data[0]
    if (!r) {
      toast.info('No hay un mes cerrado para copiar el presupuesto.')
      return
    }
    setPlannedBudget(r.budget)
    toast.success(`Presupuesto del plan: ${formatCurrency(r.budget)} (${r.label})`)
  }

  const planIsEmpty = plannedExpenses.length === 0 && !plannedBudget

  return (
    <main className="min-h-screen bg-background dark:bg-dark-bg flex justify-center py-12 transition-colors relative">
      {/* Fondo técnico con patrón de cuadrícula */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] dark:opacity-[0.2] pointer-events-none" />

      <div className="w-full max-w-4xl px-6 md:px-16 relative z-10">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-start justify-between">
            <div className="flex-col items-center mb-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-[0.15em] leading-none text-ds-text dark:text-dark-text uppercase">
                Gastly<span className="text-primary">.</span>
              </h1>
              <div className="flex items-center gap-1.5 text-ds-secondary dark:text-dark-secondary text-[12px] tracking-wide uppercase mt-2 font-medium">
                <Icon name="calendar" size="sm" />
                {currentMonthLabel}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-0.5 md:mt-2">
              <button
                type="button"
                aria-label={`Plan para ${nextMonthLabel}`}
                onClick={() => setShowPlanned(prev => !prev)}
                className={`size-8 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  showPlanned
                    ? 'bg-primary/15 text-primary'
                    : 'text-ds-secondary dark:text-dark-secondary hover:bg-surface dark:hover:bg-dark-hover hover:text-ds-text dark:hover:text-dark-text'
                }`}
              >
                <Icon name="calendar-check" size="xl" />
              </button>
              <button
                type="button"
                aria-label="Ver reportes anteriores"
                onClick={() => setShowReports(prev => !prev)}
                className="size-8 inline-flex items-center justify-center rounded-lg text-ds-secondary dark:text-dark-secondary hover:bg-surface dark:hover:bg-dark-hover hover:text-ds-text dark:hover:text-dark-text transition-colors cursor-pointer"
              >
                <Icon name="archive" size="xl" />
              </button>
              <ThemeToggle />
              <button
                type="button"
                aria-label="Cerrar sesión"
                onClick={signOut}
                className="size-8 inline-flex items-center justify-center rounded-lg text-ds-secondary dark:text-dark-secondary hover:bg-surface dark:hover:bg-dark-hover hover:text-danger transition-colors cursor-pointer"
              >
                <Icon name="logout" size="xl" />
              </button>
            </div>
          </div>

          {/* Budget form */}
          <div className="mt-6">
            <BudgetForm
              key={budget ? 'editing' : 'new'}
              onSubmit={handleSetBudget}
              isEditing={!!budget}
              initialValue={budget?.amount}
            />
          </div>
        </header>

        {/* Stats */}
        {budget && (
          <section className="mb-10">
            <BudgetSummary
              budgetAmount={budget.amount}
              totalSpent={totalSpent}
              remainingBalance={remainingBalance}
              isOverBudget={isOverBudget}
            />
          </section>
        )}

        {/* Transactions */}
        <section>
          <div className="mb-4 border-b border-ds-border dark:border-dark-border pb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-ds-text dark:text-dark-text">
              Gastly<span className="text-primary">.</span> ledger
            </h2>
            {budget && expenses.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                aria-label="Nuevo gasto"
                onClick={openModal}
                leadingIcon="add"
              >
                Nuevo gasto
              </Button>
            )}
            </div>


          <ExpenseList
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddFirst={openModal}
            hasBudget={!!budget}
          />
        </section>

        {/* Plan del mes siguiente — referencia según calendario actual */}
        {showPlanned && (
          <section className="mt-10">
            <div className="mb-4 border-b border-ds-border dark:border-dark-border pb-4 flex flex-col gap-4">
              <div className="w-full min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-ds-text dark:text-dark-text">
                  Plan para {nextMonthLabel}
                </h2>
                <p className="text-[12px] text-ds-secondary dark:text-dark-secondary mt-2 w-full max-w-2xl leading-relaxed text-pretty">
                  <span className="text-ds-text dark:text-dark-text font-medium">
                    Mes en curso: {currentMonthLabel}.
                  </span>{' '}
                  Esta sección arma la referencia para{' '}
                  <strong className="text-ds-text dark:text-dark-text">{nextMonthLabel}</strong>. El
                  presupuesto de referencia se puede cargar desde el último mes cerrado y editarlo. Con{' '}
                  <strong className="text-ds-text dark:text-dark-text">Traer cuotas</strong> sumás al plan
                  la siguiente cuota de cada compra en tarjeta del último mes cerrado (ej. si en el reporte
                  figura 1/3, entra 2/3). Los gastos nuevos los cargás con Agregar gasto. Nada de esto suma
                  al ledger de {currentMonthLabel}; si registrás una compra en cuotas en el ledger, la
                  siguiente cuota puede aparecer sola en este plan.
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
                  loading={importingInstallmentsToPlan}
                  disabled={importingInstallmentsToPlan || (reportsLoading && reports.length === 0)}
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
                    : latestClosedLabel
                      ? `Traer cuotas (${latestClosedLabel})`
                      : 'Traer cuotas del mes cerrado'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon="archive"
                  disabled={reportsLoading}
                  title={
                    reportsLoading ? 'Cargando reportes…' : 'Usa el presupuesto del último mes cerrado'
                  }
                  onClick={() => {
                    void handleApplyLastClosedBudget()
                  }}
                >
                  Presupuesto del mes cerrado
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leadingIcon="delete"
                  disabled={planIsEmpty}
                  title={planIsEmpty ? 'No hay plan para vaciar' : undefined}
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
                fieldLabel={`Presupuesto del plan (${nextMonthLabel})`}
              />
            </div>

            {plannedBudget && (
              <div className="mb-8">
                <BudgetSummary
                  budgetAmount={plannedBudget.amount}
                  totalSpent={plannedTotalSpent}
                  remainingBalance={plannedRemaining}
                  isOverBudget={plannedOverBudget}
                  budgetFooterNote={`Referencia para ${nextMonthLabel}`}
                  remainingFooterNote={
                    plannedOverBudget
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
            )}
          </section>
        )}

        {/* Footer actions */}
        {budget && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-ds-border dark:border-dark-border">
            <div className="flex items-center gap-2">
              <ResetButton onConfirm={resetAll} />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCloseMonthModal(true)}
                leadingIcon="check"
                disabled={!budget || expenses.length === 0}
              >
                Cerrar mes
              </Button>
            </div>
          </div>
        )}

        {/* Reportes anteriores — collapsible */}
        {showReports && (
          <section className="mt-10">
            <div className="mb-4 border-b border-ds-border dark:border-dark-border pb-2">
              <h2 className="text-lg font-semibold tracking-tight text-ds-text dark:text-dark-text">
                Reportes anteriores
              </h2>
            </div>
            <ReportList
              reports={reports}
              loading={reportsLoading}
              onSelect={setSelectedReport}
              onDelete={handleDeleteReport}
            />
          </section>
        )}
      </div>

      {/* Modales */}
      {showCloseMonthModal && (
        <CloseMonthModal
          onClose={() => setShowCloseMonthModal(false)}
          onConfirm={handleCloseMonth}
        />
      )}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdate={handleUpdateReport}
        />
      )}
    </main>
  )
}
