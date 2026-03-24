/**
 * Formatea un número como moneda ARS (peso argentino).
 *
 * @param value - El monto a formatear.
 * @param decimals - Cantidad mínima de decimales (default: 2).
 */
export const formatCurrency = (value: number, decimals: number = 2): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: decimals,
  }).format(value)
