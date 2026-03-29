import { useEffect } from 'react'
import { getPlanMonthContext } from '../../../core/date/plan-month-labels'
import { Modal } from '../../../shared/ui/modal'
import { useExpenseStore } from '../../../store/expense-store'
import { ExpenseFormProvider } from '../context/expense-form-provider'
import { useExpenseForm } from '../hooks/use-expense-form'
import { ExpenseForm } from './expense-form'

export const NewExpenseModal = () => {
  const closeModal = useExpenseStore(s => s.closeModal)
  const expenseModalTarget = useExpenseStore(s => s.expenseModalTarget)
  const plannedCount = useExpenseStore(s => s.plannedExpenses.length)
  const formValue = useExpenseForm(closeModal)

  const isPlanned = expenseModalTarget === 'planned'
  const { nextMonthLabel } = getPlanMonthContext()

  useEffect(() => {
    formValue.amountRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const title = isPlanned ? `Nuevo gasto · plan ${nextMonthLabel}` : 'Registro rápido'
  const submitLabel = (() => {
    if (!isPlanned) return 'Guardar gasto'
    return plannedCount === 0 ? 'Agregar gasto' : 'Agregar gasto al plan'
  })()

  return (
    <Modal title={title} icon="receipt-dollar" onClose={closeModal}>
      <ExpenseFormProvider value={formValue}>
        <ExpenseForm onCancel={closeModal} submitLabel={submitLabel} />
      </ExpenseFormProvider>
    </Modal>
  )
}
