import { CategoryPicker } from './category-picker'
import { LedgerInput } from '../../shared/ui/ledger-input'
import { PrimaryButton } from '../../shared/ui/primary-button'
import type { Category } from '../../types'
import type { RefObject } from 'react'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)

interface ExpenseFormProps {
  description: string
  category: Category
  totalAmount: string
  totalInstallments: string
  currentInstallment: string
  showInstallments: boolean
  amountPerInstallment: number | null
  amountRef: RefObject<HTMLInputElement | null>
  errors: Partial<Record<string, string>>
  onDescriptionChange: (v: string) => void
  onCategoryChange: (v: Category) => void
  onTotalAmountChange: (v: string) => void
  onTotalInstallmentsChange: (v: string) => void
  onCurrentInstallmentChange: (v: string) => void
  onSubmit: () => void
  onCancel?: () => void
}

export const ExpenseForm = ({
  description,
  category,
  totalAmount,
  totalInstallments,
  currentInstallment,
  showInstallments,
  amountPerInstallment,
  amountRef,
  errors,
  onDescriptionChange,
  onCategoryChange,
  onTotalAmountChange,
  onTotalInstallmentsChange,
  onCurrentInstallmentChange,
  onSubmit,
  onCancel,
}: ExpenseFormProps) => (
  <div className="flex flex-col gap-5 w-full">
    <LedgerInput
      ref={amountRef}
      label="Monto total"
      type="number"
      min="0"
      step="0.01"
      placeholder="0.00"
      value={totalAmount}
      onChange={e => onTotalAmountChange(e.target.value)}
      error={errors.totalAmount}
      autoFocus
    />

    <LedgerInput
      label="Descripción (opcional)"
      type="text"
      placeholder="Ej: Supermercado"
      value={description}
      onChange={e => onDescriptionChange(e.target.value)}
    />

    <CategoryPicker value={category} onChange={onCategoryChange} />

    {showInstallments && (
      <div className="flex gap-3">
        <LedgerInput
          label="Cuota actual"
          type="number"
          min="1"
          placeholder="1"
          value={currentInstallment}
          onChange={e => onCurrentInstallmentChange(e.target.value)}
          error={errors.currentInstallment}
        />
        <LedgerInput
          label="Total cuotas"
          type="number"
          min="1"
          placeholder="12"
          value={totalInstallments}
          onChange={e => onTotalInstallmentsChange(e.target.value)}
          error={errors.totalInstallments}
        />
      </div>
    )}

    {amountPerInstallment !== null && (
      <p className="text-xs text-gray-500">
        Valor por cuota:{' '}
        <span className="font-semibold text-primary">{formatCurrency(amountPerInstallment)}</span>
      </p>
    )}

    <div className="flex flex-col gap-2 pt-1">
      <PrimaryButton type="button" onClick={onSubmit}>
        Guardar gasto
      </PrimaryButton>
      {onCancel && (
        <PrimaryButton type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </PrimaryButton>
      )}
    </div>
  </div>
)
