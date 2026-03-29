import { useEffect } from 'react'
import { useExpenseStore } from '../../../store/expense-store'
import { useEditExpenseForm } from '../hooks/use-edit-expense-form'
import { ExpenseFormProvider } from '../context/expense-form-provider'
import { ExpenseForm } from './expense-form'
import { getPlanMonthContext } from '../../../core/date/plan-month-labels'
import { Modal } from '../../../shared/ui/modal'

export const EditExpenseModal = () => {
  const editingExpense = useExpenseStore(s => s.editingExpense)
  const closeModal = useExpenseStore(s => s.closeModal)

  if (!editingExpense) return null

  return <EditExpenseModalContent key={editingExpense.id} onClose={closeModal} />
}

const EditExpenseModalContent = ({ onClose }: { onClose: () => void }) => {
  const editingExpense = useExpenseStore(s => s.editingExpense)!
  const expenseModalTarget = useExpenseStore(s => s.expenseModalTarget)
  const formValue = useEditExpenseForm(editingExpense, onClose)

  useEffect(() => {
    formValue.amountRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isPlanned = expenseModalTarget === 'planned'
  const { nextMonthLabel } = getPlanMonthContext()
  const title = isPlanned ? `Editar plan (${nextMonthLabel})` : 'Editar gasto'
  const submitLabel = isPlanned ? 'Guardar en el plan' : 'Guardar gasto'

  return (
    <Modal title={title} icon="pencil-edit" onClose={onClose}>
      <ExpenseFormProvider value={formValue}>
        <ExpenseForm onCancel={onClose} submitLabel={submitLabel} />
      </ExpenseFormProvider>
    </Modal>
  )
}
