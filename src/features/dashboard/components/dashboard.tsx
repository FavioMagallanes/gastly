import { useExpenseStore } from '../../../store/expense-store'
import { useBudget, BudgetSummary, BudgetForm } from '../../budget'
import { useExpenses, ExpenseList, ResetButton } from '../../expenses'
import { Button } from '../../../shared/ui/button'
import { Icon } from '../../../shared/ui/icon'
import { ThemeToggle } from '../../../shared/ui/theme-toggle'

export const Dashboard = () => {
  const { budget, remainingBalance, totalSpent, isOverBudget, handleSetBudget, handleEditBudget } =
    useBudget()
  const { expenses, handleEdit, handleDelete } = useExpenses()
  const openModal = useExpenseStore(s => s.openModal)
  const resetAll = useExpenseStore(s => s.resetAll)

  return (
    <main className="min-h-screen bg-white dark:bg-dark-bg flex justify-center py-12 transition-colors">
      <div className="w-full max-w-4xl px-6 md:px-16">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-start justify-between">
            <div className="flex-col items-center mb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter leading-none text-ds-text dark:text-dark-text">
                Control de Gastos
              </h1>
              <div className="flex items-center gap-1.5 text-ds-secondary dark:text-dark-secondary text-[13px] tracking-normal">
                <Icon name="calendar" size="sm" />
                {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <ThemeToggle />
            </div>
          </div>

          {/* Budget form */}
          <div className="mt-6">
            <BudgetForm
              key={budget ? 'editing' : 'new'}
              onSubmit={budget ? handleEditBudget : handleSetBudget}
              isEditing={!!budget}
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
          <div className="mb-4 border-b border-ds-border dark:border-dark-border pb-2">
            <h2 className="text-lg font-semibold tracking-tight text-ds-text dark:text-dark-text">
              Movimientos recientes
            </h2>
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
            <ResetButton onConfirm={resetAll} />
            <Button
              variant="primary"
              size="icon"
              aria-label="Nuevo gasto"
              onClick={openModal}
              leadingIcon="add"
              className="hidden md:inline-flex"
            />
          </div>
        )}
      </div>
    </main>
  )
}
