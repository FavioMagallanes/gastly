import { useExpenseStore } from './store/expense-store'
import { useBudget } from './features/budget/use-budget'
import { useExpenses } from './features/expense-history/use-expenses'
import { useExpenseForm } from './features/expense-registration/use-expense-form'
import { BudgetSummary } from './features/budget/budget-summary'
import { BudgetForm } from './features/budget/budget-form'
import { ExpenseList } from './features/expense-history/expense-list'
import { ExpenseForm } from './features/expense-registration/expense-form'
import { EditExpenseModal } from './features/expense-history/edit-expense-modal'
import { ResetButton } from './features/expense-history/reset-button'

const NewExpenseModal = () => {
  const closeModal = useExpenseStore(s => s.closeModal)
  const {
    fields,
    errors,
    showInstallments,
    amountPerInstallment,
    amountRef,
    setField,
    handleSubmit,
  } = useExpenseForm(closeModal)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nuevo gasto"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/30" onClick={closeModal} aria-hidden="true" />
      <div className="relative z-10 w-full sm:max-w-md bg-background p-6 flex flex-col gap-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Nuevo gasto</h2>
          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <ExpenseForm
          description={fields.description}
          category={fields.category}
          totalAmount={fields.totalAmount}
          totalInstallments={fields.totalInstallments}
          currentInstallment={fields.currentInstallment}
          showInstallments={showInstallments}
          amountPerInstallment={amountPerInstallment}
          amountRef={amountRef}
          errors={errors}
          onDescriptionChange={v => setField('description', v)}
          onCategoryChange={v => setField('category', v)}
          onTotalAmountChange={v => setField('totalAmount', v)}
          onTotalInstallmentsChange={v => setField('totalInstallments', v)}
          onCurrentInstallmentChange={v => setField('currentInstallment', v)}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </div>
    </div>
  )
}

const Dashboard = () => {
  const {
    budget,
    remainingBalance,
    totalSpent,
    isOverBudget,
    error,
    handleSetBudget,
    handleEditBudget,
  } = useBudget()
  const { expenses, handleEdit, handleDelete } = useExpenses()
  const openModal = useExpenseStore(s => s.openModal)
  const resetAll = useExpenseStore(s => s.resetAll)

  return (
    <div className="min-h-svh bg-background">
      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 tracking-tight">Control de Gastos</h1>
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </span>
        </header>

        {budget ? (
          <>
            <BudgetSummary
              budgetAmount={budget.amount}
              totalSpent={totalSpent}
              remainingBalance={remainingBalance}
              isOverBudget={isOverBudget}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleEditBudget(budget.amount)}
                className="text-xs text-gray-400 hover:text-primary transition-colors underline-offset-2 hover:underline"
              >
                Editar presupuesto
              </button>
            </div>
          </>
        ) : (
          <div className="bg-surface-container-low p-5 flex flex-col gap-4">
            <p className="text-sm text-gray-600 font-medium">Configurá tu presupuesto mensual</p>
            <BudgetForm onSubmit={handleSetBudget} isEditing={false} error={error} />
          </div>
        )}

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Gastos</h2>
            <button
              type="button"
              onClick={openModal}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              <span aria-hidden="true">＋</span>
              Nuevo gasto
            </button>
          </div>
          <ExpenseList
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddFirst={openModal}
          />
        </section>

        <footer className="flex justify-end pt-2">
          <ResetButton onConfirm={resetAll} />
        </footer>
      </div>
    </div>
  )
}

const App = () => {
  const isModalOpen = useExpenseStore(s => s.isModalOpen)
  const editingExpense = useExpenseStore(s => s.editingExpense)

  return (
    <>
      <Dashboard />
      {isModalOpen && !editingExpense && <NewExpenseModal />}
      <EditExpenseModal />
    </>
  )
}

export default App
