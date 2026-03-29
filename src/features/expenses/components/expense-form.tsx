import { useMemo } from 'react'
import clsx from 'clsx'
import { convertUsdCardToArs } from '../../../core/math/fx'
import { formatCurrency } from '../../../core/math/format'
import { useExpenseFormContext } from '../context/expense-form-context'
import { CategoryPicker } from './category-picker'
import { Button } from '../../../shared/ui/button'
import { Icon } from '../../../shared/ui/icon'
import { FormField, FormTextInput } from '../../../shared/ui/form-field'
import { BANKS_AR } from '../../../types'

type ExpenseFormProps = {
  onCancel?: () => void
  submitLabel?: string
}

export const ExpenseForm = ({ onCancel, submitLabel = 'Guardar gasto' }: ExpenseFormProps) => {
  const {
    fields,
    errors,
    showInstallments,
    amountRef,
    setField,
    handleSubmit,
    requiresBank,
    fxCard,
  } = useExpenseFormContext()

  const isUsdCardAmount = fields.cardAmountCurrency === 'USD'

  const arsEquivalentPreview = useMemo(() => {
    if (!showInstallments || !isUsdCardAmount || fxCard.venta == null || fxCard.isPending) {
      return null
    }
    const parsedAmount = parseFloat(fields.totalAmount)
    if (!fields.totalAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) return null
    return convertUsdCardToArs(parsedAmount, fxCard.venta)
  }, [showInstallments, isUsdCardAmount, fxCard.venta, fxCard.isPending, fields.totalAmount])

  return (
    <div className="flex flex-col gap-5 w-full">
      <FormField label="Descripción">
        <FormTextInput
          type="text"
          placeholder="¿Qué compraste?"
          value={fields.description}
          onChange={e => setField('description', e.target.value)}
          autoFocus
        />
      </FormField>

      <div className="flex gap-3">
        <div className={showInstallments ? 'flex-1' : 'w-full'}>
          <CategoryPicker value={fields.categoryId} onChange={v => setField('categoryId', v)} />
        </div>
        {showInstallments && (
          <div className="flex-1">
            <FormField label="Cuotas" error={errors.currentInstallment || errors.totalInstallments}>
              <div className="flex items-center gap-2">
                <FormTextInput
                  type="number"
                  min="1"
                  placeholder="1"
                  value={fields.currentInstallment}
                  onChange={e => setField('currentInstallment', e.target.value)}
                  error={errors.currentInstallment}
                />
                <span className="text-ds-secondary dark:text-dark-secondary text-sm font-medium shrink-0">
                  de
                </span>
                <FormTextInput
                  type="number"
                  min="1"
                  placeholder="6"
                  value={fields.totalInstallments}
                  onChange={e => setField('totalInstallments', e.target.value)}
                  error={errors.totalInstallments}
                />
              </div>
            </FormField>
          </div>
        )}
      </div>

      {showInstallments && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-ds-secondary dark:text-dark-secondary uppercase tracking-widest">
            Moneda del monto
          </span>
          <div className="flex p-0.5 rounded-lg border border-ds-border dark:border-dark-border bg-surface/50 dark:bg-dark-surface/50 gap-0.5">
            <button
              type="button"
              onClick={() => setField('cardAmountCurrency', 'ARS')}
              className={clsx(
                'flex-1 rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer',
                fields.cardAmountCurrency === 'ARS'
                  ? 'bg-primary text-white'
                  : 'text-ds-secondary dark:text-dark-secondary hover:text-ds-text dark:hover:text-dark-text',
              )}
            >
              Pesos (ARS)
            </button>
            <button
              type="button"
              onClick={() => setField('cardAmountCurrency', 'USD')}
              className={clsx(
                'flex-1 rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer',
                fields.cardAmountCurrency === 'USD'
                  ? 'bg-primary text-white'
                  : 'text-ds-secondary dark:text-dark-secondary hover:text-ds-text dark:hover:text-dark-text',
              )}
            >
              Dólares (tarjeta)
            </button>
          </div>
        </div>
      )}

      <FormField
        label={showInstallments && isUsdCardAmount ? 'Monto en USD' : 'Monto'}
        error={errors.totalAmount}
      >
        <FormTextInput
          ref={amountRef}
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          prefix={showInstallments && isUsdCardAmount ? 'US$' : '$'}
          value={fields.totalAmount}
          onChange={e => setField('totalAmount', e.target.value)}
          error={errors.totalAmount}
        />
      </FormField>

      {showInstallments && isUsdCardAmount && (
        <div className="text-[11px] text-ds-secondary dark:text-dark-secondary leading-relaxed space-y-1">
          {fxCard.isPending && <p>Consultando cotización dólar tarjeta (DolarApi)…</p>}
          {fxCard.isError && !fxCard.isPending && (
            <p className="text-red-500">No se pudo cargar la cotización. Probá de nuevo.</p>
          )}
          {fxCard.venta != null && !fxCard.isPending && !fxCard.isError && (
            <p>
              <span className="font-semibold text-ds-text dark:text-dark-text">
                Dólar tarjeta venta:
              </span>{' '}
              {formatCurrency(fxCard.venta)}
              {fxCard.updatedAtLabel && (
                <span className="opacity-80"> · {fxCard.updatedAtLabel}</span>
              )}
            </p>
          )}
          {arsEquivalentPreview != null && (
            <p className="font-medium text-ds-text dark:text-dark-text">
              Equivalente en tu resumen: {formatCurrency(arsEquivalentPreview)} ARS{' '}
              <span className="text-xs text-ds-secondary dark:text-dark-secondary">
                *aproximado
              </span>
            </p>
          )}
        </div>
      )}

      {requiresBank && (
        <FormField label="Banco" error={errors.banco}>
          <div className="relative">
            <select
              value={fields.banco}
              onChange={e => setField('banco', e.target.value)}
              className="w-full appearance-none border border-ds-border dark:border-dark-border rounded-lg bg-surface dark:bg-dark-surface px-3 py-2.5 pr-10 text-sm outline-none transition-all focus:ring-1 focus:ring-primary/50 cursor-pointer [&>option]:font-normal [&>option]:text-ds-text [&>option]:bg-white dark:[&>option]:text-dark-text dark:[&>option]:bg-dark-surface"
              required
            >
              <option value="">Seleccioná un banco</option>
              {BANKS_AR.map(banco => (
                <option key={banco} value={banco}>
                  {banco}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon
                name="unfold-more"
                size="base"
                className="text-ds-secondary dark:text-dark-secondary"
              />
            </span>
          </div>
        </FormField>
      )}

      {showInstallments && (
        <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2.5">
          <Icon name="info" size="base" className="text-primary mt-0.5" />
          <p className="text-xs text-ds-secondary dark:text-dark-secondary leading-relaxed">
            <span className="font-semibold text-ds-text dark:text-dark-text">Pro tip:</span> Cuotas
            reales: cuota actual y total (ej. 2 de 6). Suscripciones fijas (Netflix, etc.): dejá
            vacío o 1/1. Compras en el exterior en USD usan la cotización{' '}
            <strong>dólar tarjeta</strong> al guardar.
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button variant="ghost" size="md" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button variant="primary" size="md" trailingIcon="check" onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
