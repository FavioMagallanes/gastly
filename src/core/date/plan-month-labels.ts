const capitalizeFirst = (value: string): string => {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const monthYearEsAr = (date: Date): string =>
  capitalizeFirst(date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }))

/**
 * Mes calendario en curso y el mes siguiente (para rotular el plan).
 */
export const getPlanMonthContext = (referenceDate: Date = new Date()) => {
  const year = referenceDate.getFullYear()
  const monthIndex = referenceDate.getMonth()
  const nextMonthStart = new Date(year, monthIndex + 1, 1)

  return {
    currentMonthLabel: monthYearEsAr(referenceDate),
    nextMonthLabel: monthYearEsAr(nextMonthStart),
  }
}
