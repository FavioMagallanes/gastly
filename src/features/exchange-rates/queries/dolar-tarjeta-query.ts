import { queryOptions } from '@tanstack/react-query'
import { fetchDolarTarjeta } from '../api/fetch-dolar-tarjeta'

export const dolarTarjetaQueryKey = ['fx', 'dolar', 'tarjeta'] as const

/**
 * Opciones compartidas para `useQuery` / `prefetchQuery` / `invalidateQueries`.
 * No incluye `enabled`: definirlo en el hook o en el callsite.
 */
export const dolarTarjetaQueryOptions = queryOptions({
  queryKey: dolarTarjetaQueryKey,
  queryFn: fetchDolarTarjeta,
  staleTime: 1000 * 60 * 30,
  gcTime: 1000 * 60 * 60,
  retry: 1,
})
