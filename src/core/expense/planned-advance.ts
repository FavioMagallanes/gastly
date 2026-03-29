import type { Expense } from '../../types'
import { isCardCategory } from '../../types'

export const INSTALLMENT_RE = /^(\d+)\s*\/\s*(\d+)$/

/**
 * Si el gasto del ledger es tarjeta con cuota X/Y y X < Y > 1, devuelve la fila para el plan
 * del próximo mes con (X+1)/Y, enlazada al gasto del ledger.
 */
export const buildForwardInstallmentPlanRow = (ledger: Expense): Expense | null => {
  const inst = ledger.installment?.trim()
  if (!inst || !isCardCategory(ledger.categoryId)) return null
  const m = inst.match(INSTALLMENT_RE)
  if (!m) return null
  const cur = Number(m[1])
  const tot = Number(m[2])
  if (Number.isNaN(cur) || Number.isNaN(tot) || tot <= 1 || cur >= tot) return null

  return {
    id: crypto.randomUUID(),
    registeredAt: new Date().toISOString(),
    description: ledger.description,
    categoryId: ledger.categoryId,
    totalAmount: ledger.totalAmount,
    installment: `${cur + 1}/${tot}`,
    banco: ledger.banco,
    forwardedFromLedgerId: ledger.id,
  }
}

/** Clave estable para detectar duplicados al importar al plan. */
export const plannedExpenseRowKey = (
  e: Pick<Expense, 'categoryId' | 'description' | 'installment' | 'totalAmount' | 'banco'>,
): string =>
  `${e.categoryId}|${(e.description ?? '').trim().toLowerCase()}|${e.installment ?? ''}|${e.totalAmount}|${e.banco ?? ''}`

/** Filas listas para agregar al plan (siguiente cuota) desde el snapshot de un mes cerrado. */
export const collectNextInstallmentPlanPayloadsFromReportExpenses = (
  reportExpenses: Expense[],
  existingPlanned: Expense[],
): Omit<Expense, 'id' | 'registeredAt'>[] => {
  const toAdd: Omit<Expense, 'id' | 'registeredAt'>[] = []
  const seenKeys = new Set<string>()

  for (const e of reportExpenses) {
    const payload = buildNextInstallmentPayloadFromReportExpense(e)
    if (!payload) continue
    const key = plannedExpenseRowKey({
      categoryId: payload.categoryId,
      description: payload.description,
      installment: payload.installment,
      totalAmount: payload.totalAmount,
      banco: payload.banco,
    })
    if (seenKeys.has(key)) continue
    if (existingPlanned.some(p => plannedExpenseRowKey(p) === key)) continue
    seenKeys.add(key)
    toAdd.push(payload)
  }

  return toAdd
}

/**
 * Desde un gasto del reporte cerrado (cuota X/Y en tarjeta), arma el payload de la siguiente cuota
 * para el plan. Sin `forwardedFromLedgerId` (no hay gasto activo en el ledger).
 */
export const buildNextInstallmentPayloadFromReportExpense = (
  e: Expense,
): Omit<Expense, 'id' | 'registeredAt' | 'forwardedFromLedgerId'> | null => {
  const inst = e.installment?.trim()
  if (!inst || !isCardCategory(e.categoryId)) return null
  const m = inst.match(INSTALLMENT_RE)
  if (!m) return null
  const cur = Number(m[1])
  const tot = Number(m[2])
  if (Number.isNaN(cur) || Number.isNaN(tot) || tot <= 1 || cur >= tot) return null

  return {
    description: e.description,
    categoryId: e.categoryId,
    totalAmount: e.totalAmount,
    installment: `${cur + 1}/${tot}`,
    banco: e.banco,
  }
}
