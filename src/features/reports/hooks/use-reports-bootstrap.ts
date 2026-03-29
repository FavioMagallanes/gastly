import { useEffect, useState } from 'react'
import { useAuth } from '../../auth'
import { fetchReports } from '../services/report-service'
import { clearReportsPrimeCache, primeReportsForUser } from '../utils/reports-prime-cache'

/**
 * Primera carga de reportes antes de montar el dashboard.
 * Además de gatear el spinner, deja los datos en `primeReportsForUser` para que `useReports`
 * no arranque en [] tras F5 (doble fetch visual).
 */
export const useReportsBootstrap = () => {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [bootstrappedForUserId, setBootstrappedForUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      clearReportsPrimeCache()
      return
    }

    queueMicrotask(() => {
      setBootstrappedForUserId(null)
    })

    let cancelled = false

    void (async () => {
      const { data, error } = await fetchReports()
      if (!cancelled) {
        if (!error) {
          primeReportsForUser(userId, data)
        }
        setBootstrappedForUserId(userId)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  return userId === null || bootstrappedForUserId === userId
}
