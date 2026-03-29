export type CardAmountCurrency = 'ARS' | 'USD'

export interface ExpenseFormFields {
  description: string
  categoryId: string
  totalAmount: string
  currentInstallment: string
  totalInstallments: string
  banco: string
  /** Solo tarjeta: moneda del monto ingresado. */
  cardAmountCurrency: CardAmountCurrency
}

export type ExpenseErrors = Partial<Record<keyof ExpenseFormFields, string>>

export const emptyExpenseFormFields = (): ExpenseFormFields => ({
  description: '',
  categoryId: 'otros',
  totalAmount: '',
  currentInstallment: '',
  totalInstallments: '',
  banco: '',
  cardAmountCurrency: 'ARS',
})

export type ValidateExpenseFx =
  | { status: 'ready'; venta: number }
  | { status: 'pending' }
  | { status: 'error' }

/**
 * Tarjeta: si ambos campos de cuotas van vacíos, se persiste como pago único `1/1`.
 */
export const resolveInstallmentForSubmit = (
  currentInstallment: string,
  totalInstallments: string,
): string => {
  const trimmedCurrent = currentInstallment.trim()
  const trimmedTotal = totalInstallments.trim()
  if (trimmedCurrent === '' && trimmedTotal === '') return '1/1'
  return `${trimmedCurrent}/${trimmedTotal}`
}

export const validateExpense = (
  fields: ExpenseFormFields,
  requiresBank: boolean,
  showInstallments: boolean,
  fx?: ValidateExpenseFx,
): ExpenseErrors => {
  const errors: ExpenseErrors = {}
  const amount = parseFloat(fields.totalAmount)
  const isUsdCard = showInstallments && fields.cardAmountCurrency === 'USD'

  if (isUsdCard) {
    if (fx?.status === 'pending') {
      errors.totalAmount = 'Cargando cotización dólar tarjeta…'
    } else if (fx?.status === 'error' || fx?.status !== 'ready') {
      errors.totalAmount = 'No se pudo obtener el dólar tarjeta. Reintentá.'
    } else if (!fields.totalAmount || isNaN(amount) || amount <= 0) {
      errors.totalAmount = 'Ingresá un monto en USD mayor a 0'
    }
  } else {
    if (!fields.totalAmount || isNaN(amount) || amount <= 0) {
      errors.totalAmount = 'Ingresá un monto válido mayor a 0'
    }
  }

  if (requiresBank && !fields.banco) {
    errors.banco = 'Seleccioná un banco'
  }

  if (showInstallments) {
    const trimmedCurrentInstallment = fields.currentInstallment.trim()
    const trimmedTotalInstallments = fields.totalInstallments.trim()
    const bothEmpty = trimmedCurrentInstallment === '' && trimmedTotalInstallments === ''

    if (!bothEmpty) {
      const parsedCurrent = parseInt(fields.currentInstallment, 10)
      const parsedTotal = parseInt(fields.totalInstallments, 10)

      if (!trimmedCurrentInstallment || isNaN(parsedCurrent) || parsedCurrent < 1) {
        errors.currentInstallment = 'Cuota actual inválida'
      }

      if (!trimmedTotalInstallments || isNaN(parsedTotal) || parsedTotal < 1) {
        errors.totalInstallments = 'Total de cuotas inválido'
      }

      if (
        !errors.currentInstallment &&
        !errors.totalInstallments &&
        parsedCurrent > parsedTotal
      ) {
        errors.currentInstallment = 'No puede superar el total'
      }
    }
  }

  return errors
}
