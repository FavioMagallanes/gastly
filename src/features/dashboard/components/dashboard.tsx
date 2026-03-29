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
import { DashboardHeader } from './dashboard-header'
import { PlannedMonthSection } from './planned-month-section'

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

  const [showCloseMonthModal, setShowCloseMonthModal] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [showPlanned, setShowPlanned] = useState(false)

  const { currentMonthLabel, nextMonthLabel } = useMemo(() => getPlanMonthContext(), [])

  return (
    <main className="min-h-screen bg-background dark:bg-dark-bg flex justify-center py-12 transition-colors relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] dark:opacity-[0.2] pointer-events-none" />

      <div className="w-full max-w-4xl px-6 md:px-16 relative z-10">
        <div className="mb-10">
          <DashboardHeader
            currentMonthLabel={currentMonthLabel}
            nextMonthLabel={nextMonthLabel}
            isPlannedPanelOpen={showPlanned}
            onTogglePlannedPanel={() => setShowPlanned(prev => !prev)}
            onToggleReportsPanel={() => setShowReports(prev => !prev)}
            onSignOut={signOut}
          />
          <div className="mt-6">
            <BudgetForm
              key={budget ? 'editing' : 'new'}
              onSubmit={handleSetBudget}
              isEditing={!!budget}
              initialValue={budget?.amount}
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

        {showPlanned && (
          <PlannedMonthSection
            currentMonthLabel={currentMonthLabel}
            nextMonthLabel={nextMonthLabel}
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
                disabled={!budget || expenses.length === 0}
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
