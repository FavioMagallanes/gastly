import { useQuery } from '@tanstack/react-query'
import { dolarTarjetaQueryOptions } from '../queries/dolar-tarjeta-query'

/**
 * Cotización dólar tarjeta (compra/venta) vía TanStack Query.
 * Mantener `enabled` en false salvo cuando el usuario elige USD en una categoría tarjeta
 * para no llamar a la API en vano.
 */
export const useDolarTarjeta = (enabled: boolean) =>
  useQuery({
    ...dolarTarjetaQueryOptions,
    enabled,
  })
