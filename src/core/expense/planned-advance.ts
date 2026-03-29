import type { Expense } from '../../types'
import { isCardCategory } from '../../types'

export const INSTALLMENT_RE = /^(\d+)\s*\/\s*(\d+)$/

/**
 * Si el gasto del ledger es tarjeta con cuota X/Y y X < Y > 1, devuelve la fila para el plan
 * del próximo mes con (X+1)/Y, enlazada al gasto del ledger.
 */
export const buildForwardInstallmentPlanRow = (ledgerExpense: Expense): Expense | null => {
  const installment = ledgerExpense.installment?.trim()
  if (!installment || !isCardCategory(ledgerExpense.categoryId)) return null
  const match = installment.match(INSTALLMENT_RE)
  if (!match) return null
  const currentNumber = Number(match[1])
  const totalNumber = Number(match[2])
  if (
    Number.isNaN(currentNumber) ||
    Number.isNaN(totalNumber) ||
    totalNumber <= 1 ||
    currentNumber >= totalNumber
  ) {
    return null
  }

  return {
    id: crypto.randomUUID(),
    registeredAt: new Date().toISOString(),
    description: ledgerExpense.description,
    categoryId: ledgerExpense.categoryId,
    totalAmount: ledgerExpense.totalAmount,
    installment: `${currentNumber + 1}/${totalNumber}`,
    banco: ledgerExpense.banco,
    forwardedFromLedgerId: ledgerExpense.id,
  }
}

/** Clave estable para detectar duplicados al importar al plan. */
export const plannedExpenseRowKey = (
  expense: Pick<
    Expense,
    'categoryId' | 'description' | 'installment' | 'totalAmount' | 'banco'
  >,
): string =>
  `${expense.categoryId}|${(expense.description ?? '').trim().toLowerCase()}|${expense.installment ?? ''}|${expense.totalAmount}|${expense.banco ?? ''}`

/** Filas listas para agregar al plan (siguiente cuota) desde el snapshot de un mes cerrado. */
export const collectNextInstallmentPlanPayloadsFromReportExpenses = (
  reportExpenses: Expense[],
  existingPlanned: Expense[],
): Omit<Expense, 'id' | 'registeredAt'>[] => {
  const payloadsToAdd: Omit<Expense, 'id' | 'registeredAt'>[] = []
  const seenKeys = new Set<string>()

  for (const reportExpense of reportExpenses) {
    const payload = buildNextInstallmentPayloadFromReportExpense(reportExpense)
    if (!payload) continue
    const key = plannedExpenseRowKey({
      categoryId: payload.categoryId,
      description: payload.description,
      installment: payload.installment,
      totalAmount: payload.totalAmount,
      banco: payload.banco,
    })
    if (seenKeys.has(key)) continue
    if (
      existingPlanned.some(
        plannedExpense => plannedExpenseRowKey(plannedExpense) === key,
      )
    ) {
      continue
    }
    seenKeys.add(key)
    payloadsToAdd.push(payload)
  }

  return payloadsToAdd
}

/**
 * Desde un gasto del reporte cerrado (cuota X/Y en tarjeta), arma el payload de la siguiente cuota
 * para el plan. Sin `forwardedFromLedgerId` (no hay gasto activo en el ledger).
 */
export const buildNextInstallmentPayloadFromReportExpense = (
  reportExpense: Expense,
): Omit<Expense, 'id' | 'registeredAt' | 'forwardedFromLedgerId'> | null => {
  const installment = reportExpense.installment?.trim()
  if (!installment || !isCardCategory(reportExpense.categoryId)) return null
  const match = installment.match(INSTALLMENT_RE)
  if (!match) return null
  const currentNumber = Number(match[1])
  const totalNumber = Number(match[2])
  if (
    Number.isNaN(currentNumber) ||
    Number.isNaN(totalNumber) ||
    totalNumber <= 1 ||
    currentNumber >= totalNumber
  ) {
    return null
  }

  return {
    description: reportExpense.description,
    categoryId: reportExpense.categoryId,
    totalAmount: reportExpense.totalAmount,
    installment: `${currentNumber + 1}/${totalNumber}`,
    banco: reportExpense.banco,
  }
}
