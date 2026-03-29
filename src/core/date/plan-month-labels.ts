const capitalizeFirst = (value: string): string => {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const monthYearEsAr = (d: Date): string =>
  capitalizeFirst(d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }))

/**
 * Mes calendario en curso y el mes siguiente (para rotular el plan).
 */
export const getPlanMonthContext = (referenceDate: Date = new Date()) => {
  const y = referenceDate.getFullYear()
  const m = referenceDate.getMonth()
  const nextMonthStart = new Date(y, m + 1, 1)

  return {
    currentMonthLabel: monthYearEsAr(referenceDate),
    nextMonthLabel: monthYearEsAr(nextMonthStart),
  }
}
