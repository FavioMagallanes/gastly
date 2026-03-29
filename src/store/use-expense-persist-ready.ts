import { useEffect, useState } from 'react'
import { useExpenseStore } from './expense-store'

/**
 * Evita pintar el dashboard con el estado vacío inicial antes de que Zustand
 * termine de leer localStorage (clave por usuario).
 */
export const useExpensePersistReady = (active: boolean) => {
  const [, setHydrationVersion] = useState(0)

  useEffect(() => {
    if (!active) return
    return useExpenseStore.persist.onFinishHydration(() => {
      setHydrationVersion(v => v + 1)
    })
  }, [active])

  if (!active) return true
  return useExpenseStore.persist.hasHydrated()
}
