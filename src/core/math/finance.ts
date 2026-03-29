import Big from 'big.js'
import type { Expense } from '../../types'

Big.RM = Big.roundHalfUp

/**
 * Suma todos los `totalAmount` de los gastos.
 * `totalAmount` representa el monto de la cuota que se paga este mes.
 */
export const calcTotalSpent = (expenses: Expense[]): number =>
  expenses.reduce(
    (runningTotal, expense) => Big(runningTotal).plus(expense.totalAmount).toNumber(),
    0,
  )

export const calcRemainingBalance = (budget: number, totalSpent: number): number =>
  Big(budget).minus(totalSpent).toNumber()
