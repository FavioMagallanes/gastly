import { useState, useMemo } from 'react'
import { useExpenseStore } from '../../../store/expense-store'
import { useBudget, BudgetSummary, BudgetForm } from '../../budget'
import { useExpenses, ExpenseList, ResetButton } from '../../expenses'
import { useReports, ReportList, CloseMonthModal, ReportDetailModal } from '../../reports'
import { useAuth } from '../../auth'
import { Button } from '../../../shared/ui/button'
import { Icon } from '../../../shared/ui/icon'
import { ThemeToggle } from '../../../shared/ui/theme-toggle'

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
  } = useReports()
  const { signOut } = useAuth()
  const openModal = useExpenseStore(s => s.openModal)
  const resetAll = useExpenseStore(s => s.resetAll)

  const [showCloseMonthModal, setShowCloseMonthModal] = useState(false)
  const [showReports, setShowReports] = useState(false)

  const currentMonth = useMemo(
    () => new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
    [],
  )

  return (
    <main className="min-h-screen bg-white dark:bg-dark-bg flex justify-center py-12 transition-colors">
      <div className="w-full max-w-4xl px-6 md:px-16">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-start justify-between">
            <div className="flex-col items-center mb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter leading-none text-ds-text dark:text-dark-text">
                Control de Presupuesto
              </h1>
              <div className="flex items-center gap-1.5 text-ds-secondary dark:text-dark-secondary text-[13px] tracking-normal">
                <Icon name="calendar" size="sm" />
                {currentMonth}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-0.5 md:mt-2">
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
              Gastos del mes
            </h2>
            {budget && (
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
          />
        </section>

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
        <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </main>
  )
}
