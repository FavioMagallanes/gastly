import { useEffect } from 'react'
import { useExpenseStore } from '../../store/expense-store'
import { useEditExpenseForm } from './use-edit-expense-form'
import { ExpenseForm } from '../expense-registration/expense-form'

export const EditExpenseModal = () => {
  const isModalOpen = useExpenseStore(s => s.isModalOpen)
  const editingExpense = useExpenseStore(s => s.editingExpense)
  const closeModal = useExpenseStore(s => s.closeModal)

  if (!isModalOpen || !editingExpense) return null

  return <EditExpenseModalContent key={editingExpense.id} onClose={closeModal} />
}

const EditExpenseModalContent = ({ onClose }: { onClose: () => void }) => {
  const editingExpense = useExpenseStore(s => s.editingExpense)!

  const {
    fields,
    errors,
    showInstallments,
    amountPerInstallment,
    amountRef,
    setField,
    handleSubmit,
  } = useEditExpenseForm(editingExpense, onClose)

  useEffect(() => {
    amountRef.current?.focus()
  }, [amountRef])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Editar gasto"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full sm:max-w-md bg-background p-6 flex flex-col gap-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Editar gasto</h2>
          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={onClose}
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
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
