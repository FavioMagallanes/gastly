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
import { Button } from './shared/ui/button'
import { Icon } from './shared/ui/icon'
import { Toaster } from 'sonner'

/* ─── Modal: nuevo gasto ─────────────────────────────────────────────── */
const NewExpenseModal = () => {
  const closeModal = useExpenseStore(s => s.closeModal)
  const { fields, errors, showInstallments, amountRef, setField, handleSubmit } =
    useExpenseForm(closeModal)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nuevo gasto"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40" onClick={closeModal} aria-hidden="true" />
      <div className="relative z-10 w-full sm:max-w-md bg-white border border-ds-border rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ds-border">
          <div className="flex items-center gap-2">
            <Icon name="receipt-dollar" size="xl" className="text-ds-secondary" />
            <h2 className="text-base font-semibold text-ds-text">Registro rápido</h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={closeModal}
            className="size-8 inline-flex items-center justify-center rounded-lg text-ds-secondary hover:bg-surface hover:text-ds-text transition-colors"
          >
            <Icon name="close" size="xl" />
          </button>
        </div>
        <div className="px-6 py-5">
          <ExpenseForm
            description={fields.description}
            category={fields.category}
            totalAmount={fields.totalAmount}
            installment={fields.installment}
            showInstallments={showInstallments}
            amountRef={amountRef}
            errors={errors}
            onDescriptionChange={v => setField('description', v)}
            onCategoryChange={v => setField('category', v)}
            onTotalAmountChange={v => setField('totalAmount', v)}
            onInstallmentChange={v => setField('installment', v)}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </div>
      </div>
    </div>
  )
}

/* ─── Dashboard principal ────────────────────────────────────────────── */
const Dashboard = () => {
  const { budget, remainingBalance, totalSpent, isOverBudget, handleSetBudget, handleEditBudget } =
    useBudget()
  const { expenses, handleEdit, handleDelete } = useExpenses()
  const openModal = useExpenseStore(s => s.openModal)
  const resetAll = useExpenseStore(s => s.resetAll)

  return (
    <main className="min-h-screen bg-white flex justify-center py-12">
      <div className="w-full max-w-4xl px-6 md:px-16">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-ds-text">
              Control de Gastos
            </h1>
            <div className="flex items-center gap-1.5 text-ds-secondary text-[13px] tracking-normal">
              <Icon name="calendar" size="sm" />
              {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Budget form */}
          <div className="mt-6">
            <BudgetForm
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
          <div className="flex items-center justify-between mb-4 border-b border-ds-border pb-2">
            <h2 className="text-lg font-semibold tracking-tight text-ds-text">
              Movimientos recientes
            </h2>
            <Button
              variant="primary"
              size="sm"
              leadingIcon="add"
              onClick={openModal}
              className="hidden md:inline-flex"
            >
              Nuevo gasto
            </Button>
          </div>

          <ExpenseList
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddFirst={openModal}
          />
        </section>

        {/* Footer reset */}
        <div className="flex justify-end mt-8 pt-4 border-t border-ds-border">
          <ResetButton onConfirm={resetAll} />
        </div>
      </div>
    </main>
  )
}

/* ─── App root ───────────────────────────────────────────────────────── */
const App = () => {
  const isModalOpen = useExpenseStore(s => s.isModalOpen)
  const editingExpense = useExpenseStore(s => s.editingExpense)
  const openModal = useExpenseStore(s => s.openModal)

  return (
    <div className="min-h-screen bg-white">
      <Dashboard />

      {/* FAB — solo visible en mobile, en desktop el botón está inline */}
      <Button
        variant="primary"
        size="lg"
        aria-label="Nuevo gasto"
        onClick={openModal}
        className="md:hidden fixed bottom-6 right-6 size-14! rounded-full! shadow-lg hover:scale-105 active:scale-95 transition-transform z-40"
        leadingIcon="add"
      />

      {isModalOpen && !editingExpense && <NewExpenseModal />}
      <EditExpenseModal />

      <Toaster
        position="bottom-center"
        richColors
        toastOptions={{
          style: {
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '13px',
          },
        }}
      />
    </div>
  )
}

export default App
