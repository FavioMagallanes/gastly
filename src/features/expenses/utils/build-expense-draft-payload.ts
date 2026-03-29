import { convertUsdCardToArs } from '../../../core/math/fx'
import type { Expense } from '../../../types'
import { resolveInstallmentForSubmit } from './validation'
import type { ExpenseFormFields } from './validation'

/**
 * Arma el cuerpo del gasto a persistir a partir del estado del formulario (ledger, plan o reporte).
 */
export const buildExpenseDraftPayload = (
  fields: ExpenseFormFields,
  showInstallments: boolean,
  requiresBank: boolean,
  cardUsdVentaRate: number | undefined,
): Omit<Expense, 'id' | 'registeredAt'> => {
  const isUsdCardAmount = showInstallments && fields.cardAmountCurrency === 'USD'
  const usdAmount = parseFloat(fields.totalAmount)

  let totalAmount: number
  let originalAmountUsd: number | undefined
  let fxRateUsdArs: number | undefined

  if (isUsdCardAmount && cardUsdVentaRate != null) {
    totalAmount = convertUsdCardToArs(usdAmount, cardUsdVentaRate)
    originalAmountUsd = usdAmount
    fxRateUsdArs = cardUsdVentaRate
  } else {
    totalAmount = parseFloat(fields.totalAmount)
    originalAmountUsd = undefined
    fxRateUsdArs = undefined
  }

  return {
    description: fields.description || undefined,
    categoryId: fields.categoryId,
    totalAmount,
    originalAmountUsd,
    fxRateUsdArs,
    installment: showInstallments
      ? resolveInstallmentForSubmit(fields.currentInstallment, fields.totalInstallments)
      : undefined,
    banco: requiresBank ? fields.banco || undefined : undefined,
  }
}
