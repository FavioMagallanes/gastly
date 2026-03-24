import { Modal } from '../../../shared/ui/modal'
import { useExpenseStore } from '../../../store/expense-store'
import { ExpenseFormProvider } from '../context/expense-form-provider'
import { useExpenseForm } from '../hooks/use-expense-form'
import { ExpenseForm } from './expense-form'

export const NewExpenseModal = () => {
  const closeModal = useExpenseStore(s => s.closeModal)
  const formValue = useExpenseForm(closeModal)

  return (
    <Modal title="Registro rápido" icon="receipt-dollar" onClose={closeModal}>
      <ExpenseFormProvider value={formValue}>
        <ExpenseForm onCancel={closeModal} />
      </ExpenseFormProvider>
    </Modal>
  )
}
