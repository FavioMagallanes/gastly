import type { MonthlyReport } from '../../../types/database'

let primedUserId: string | null = null
let primedReports: MonthlyReport[] | null = null

/** Llamar tras el fetch del bootstrap para hidratar el primer frame de `useReports` (evita flash en F5). */
export const primeReportsForUser = (userId: string, reports: MonthlyReport[]) => {
  primedUserId = userId
  primedReports = reports
}

/** `null` = no hay datos del bootstrap para este usuario (hay que mostrar loading hasta el fetch del hook). */
export const getPrimedReports = (userId: string): MonthlyReport[] | null => {
  if (primedUserId !== userId || primedReports === null) return null
  return primedReports
}

export const clearReportsPrimeCache = () => {
  primedUserId = null
  primedReports = null
}
