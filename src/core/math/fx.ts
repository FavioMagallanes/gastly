import Big from 'big.js'

Big.RM = Big.roundHalfUp

/** Convierte USD a ARS usando la cotización **venta** dólar tarjeta (BCRA / fuente pública). */
export const convertUsdCardToArs = (usd: number, dolarTarjetaVenta: number): number =>
  Big(usd).times(dolarTarjetaVenta).round(2).toNumber()
