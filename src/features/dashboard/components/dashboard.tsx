import { useState, useMemo } from 'react'
import { useExpenseStore } from '../../../store/expense-store'
import { useBudget, BudgetSummary, BudgetForm } from '../../budget'
import {
  useExpenses,
  ExpenseList,
  ResetButton,
} from '../../expenses'
import { useReports, ReportList, CloseMonthModal, ReportDetailModal } from '../../reports'
import { useAuth } from '../../auth'
import { Button } from '../../../shared/ui/button'
import { getPlanMonthContext } from '../../../core/date/plan-month-labels'
import { isLedgerCycleReported } from '../../reports/utils/is-ledger-cycle-reported'
import { DashboardHeader } from './dashboard-header'
import { PlannedMonthSection } from './planned-month-section'
import { LEDGER_SEALED_HINT } from '../../../core/copy/ledger-sealed-hint'

export const Dashboard = () => {
  const { budget, remainingBalance, totalSpent, isOverBudget, handleSetBudget } = useBudget()
  const { expenses, handleEdit, handleDelete } = useExpenses()
  const {
    reports,
    loading: reportsLoading,
    selectedReport,
    setSelectedReport,
    handleCloseMonth,
    handleDeleteReport,
    handleUpdateReport,
  } = useReports()
  const { signOut } = useAuth()
  const openModal = useExpenseStore(state => state.openModal)
  const resetAll = useExpenseStore(state => state.resetAll)
  const plannedExpenses = useExpenseStore(state => state.plannedExpenses)
  const plannedBudget = useExpenseStore(state => state.plannedBudget)
  const hasPlanInProgress =
    plannedExpenses.length > 0 || plannedBudget !== null

  const [showCloseMonthModal, setShowCloseMonthModal] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [showPlanned, setShowPlanned] = useState(false)

  const { ledgerMonthLabel, paymentMonthLabel, planTargetMonthName } = useMemo(
    () => getPlanMonthContext(),
    [],
  )

  /** No depender de `reportsLoading`: al volver a la pestaña Supabase renueva el token y el objeto
   * `user` cambia; un refetch ponía loading=true y el ledger “se abría” un instante con datos viejos. */
  const isLedgerSealed = isLedgerCycleReported(
    reports,
    ledgerMonthLabel,
    paymentMonthLabel,
  )
  /** No bloquear el ledger mientras cargan reportes: evita ~1s de UI “vacía” o deshabilitada. */
  const isLedgerActionsLocked = isLedgerSealed

  return (
    <main className="min-h-screen bg-background dark:bg-dark-bg flex justify-center py-12 transition-colors relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] dark:opacity-[0.2] pointer-events-none" />

      <div className="w-full max-w-4xl px-6 md:px-16 relative z-10">
        <div className="mb-10">
          <DashboardHeader
            paymentMonthLabel={paymentMonthLabel}
            ledgerMonthLabel={ledgerMonthLabel}
            planTargetMonthName={planTargetMonthName}
            isPlannedPanelOpen={showPlanned}
            onTogglePlannedPanel={() => setShowPlanned(prev => !prev)}
            onToggleReportsPanel={() => setShowReports(prev => !prev)}
            onSignOut={signOut}
            showLedgerClosedDot={isLedgerSealed}
            showPlanActiveDot={hasPlanInProgress}
          />
          <div className="mt-6">
            <BudgetForm
              key={budget != null ? `ledger-${budget.amount}` : 'ledger-new'}
              onSubmit={handleSetBudget}
              isEditing={!!budget}
              initialValue={budget?.amount}
              disabled={isLedgerActionsLocked}
            />
          </div>
        </div>

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

        <section>
          <div className="mb-4 border-b border-ds-border dark:border-dark-border pb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-ds-text dark:text-dark-text">
              Gastly<span className="text-primary">.</span> ledger
            </h2>
            {budget && expenses.length > 0 && !isLedgerActionsLocked && (
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

          {isLedgerSealed && (
            <p className="text-[12px] text-ds-secondary dark:text-dark-secondary mb-3 max-w-2xl leading-relaxed text-pretty">
              {LEDGER_SEALED_HINT}
            </p>
          )}

          <ExpenseList
            expenses={expenses}
            listCaption={`Ledger · cargás en ${ledgerMonthLabel} · liquidación ${paymentMonthLabel}`}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddFirst={openModal}
            hasBudget={!!budget}
            canAddExpenses={!isLedgerActionsLocked}
            ledgerReadOnly={isLedgerActionsLocked}
            suppressEmptyDescription={isLedgerSealed}
            hideEmptyState={isLedgerSealed}
          />
        </section>

        {showPlanned && (
          <PlannedMonthSection
            ledgerMonthLabel={ledgerMonthLabel}
            paymentMonthLabel={paymentMonthLabel}
            planTargetMonthName={planTargetMonthName}
            reports={reports}
            reportsLoading={reportsLoading}
          />
        )}

        {budget && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-ds-border dark:border-dark-border">
            <div className="flex items-center gap-2">
              <ResetButton onConfirm={resetAll} />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCloseMonthModal(true)}
                leadingIcon="check"
                disabled={!budget || expenses.length === 0 || isLedgerActionsLocked}
                title={isLedgerSealed ? LEDGER_SEALED_HINT : undefined}
              >
                Cerrar mes
              </Button>
            </div>
          </div>
        )}

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
