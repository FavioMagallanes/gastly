import type { UseQueryResult } from '@tanstack/react-query'
import type { DolarTarjetaQuote } from '../../exchange-rates'
import type { ExpenseFormFxState } from '../context/expense-form-context'
import type { CardAmountCurrency, ValidateExpenseFx } from './validation'

export const buildFxCardState = (
  q: UseQueryResult<DolarTarjetaQuote, Error>,
): ExpenseFormFxState => ({
  venta: q.data?.venta,
  isPending: q.isPending,
  isError: q.isError,
  updatedAtLabel: q.data?.fechaActualizacion
    ? new Date(q.data.fechaActualizacion).toLocaleString('es-AR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : undefined,
})

export const buildValidateExpenseFx = (
  showInstallments: boolean,
  cardAmountCurrency: CardAmountCurrency,
  q: UseQueryResult<DolarTarjetaQuote, Error>,
): ValidateExpenseFx | undefined => {
  if (!showInstallments || cardAmountCurrency !== 'USD') return undefined
  if (q.isPending) return { status: 'pending' }
  if (q.isError || q.data == null) return { status: 'error' }
  const venta = q.data.venta
  if (typeof venta !== 'number' || venta <= 0) return { status: 'error' }
  return { status: 'ready', venta }
}
