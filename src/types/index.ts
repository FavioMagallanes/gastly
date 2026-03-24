export type Category = 'BBVA' | 'SUPERVIELLE' | 'PRESTAMO' | 'SERVICIOS' | 'COLEGIO' | 'OTROS'

/**
 * Expense — Modelo de gasto mensual.
 *
 * - `totalAmount`  → Monto que se paga **este mes** (la cuota, no el total del producto).
 * - `installment`  → Texto libre con formato "X/Y" (ej: "1/6").
 *                     Solo se usa cuando la categoría es tarjeta (BBVA o SUPERVIELLE).
 *                     Es informativo; NO se usa para calcular montos.
 * - `category`     → Método de pago / origen del gasto.
 * - `description`  → Detalle opcional del gasto (ej: "Heladera", "Netflix").
 */
export interface Expense {
  id: string
  description?: string
  category: Category
  /** Monto de la cuota que se paga este mes */
  totalAmount: number
  /**
   * Indicador de cuota en formato libre "X/Y" (ej: "2/6").
   * Solo presente cuando category es BBVA o SUPERVIELLE.
   */
  installment?: string
  registeredAt: string
}

export interface Budget {
  amount: number
  configuredAt: string
}

export interface MonthlySummary {
  budget: number
  totalSpent: number
  remainingBalance: number
  isOverBudget: boolean
}

export const CARD_CATEGORIES: Category[] = ['BBVA', 'SUPERVIELLE']

export const CATEGORY_LABELS: Record<Category, string> = {
  BBVA: 'Tarjeta BBVA',
  SUPERVIELLE: 'Tarjeta Supervielle',
  PRESTAMO: 'Préstamo',
  SERVICIOS: 'Servicios',
  COLEGIO: 'Colegio',
  OTROS: 'Otros',
}

export const isCardCategory = (category: Category): boolean => CARD_CATEGORIES.includes(category)
