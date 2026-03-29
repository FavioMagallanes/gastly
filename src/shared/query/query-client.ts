import { QueryClient } from '@tanstack/react-query'

/**
 * Defaults for generic queries. FX (`features/exchange-rates`) overrides stale/gc times
 * via `dolarTarjetaQueryOptions`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
