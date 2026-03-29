import { useQuery } from '@tanstack/react-query'
import { fetchDolarTarjeta } from '../api/fetch-dolar-tarjeta'

export const dolarTarjetaQueryKey = ['fx', 'dolar', 'tarjeta'] as const

/**
 * Cotización dólar tarjeta (compra/venta). Solo se pide cuando `enabled` (ej. categoría tarjeta).
 */
export const useDolarTarjeta = (enabled: boolean) =>
  useQuery({
    queryKey: dolarTarjetaQueryKey,
    queryFn: fetchDolarTarjeta,
    enabled,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  })
