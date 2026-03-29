import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth'
import { useExpenseStore } from '../../../store/expense-store'
import { fetchUserPlanFromRemote, upsertUserPlanRemote } from '../services/plan-remote-service'

const DEBOUNCE_MS = 900

/**
 * Tras el login: trae el plan desde Supabase (si existe) y lo aplica al store.
 * Si no hay fila en el servidor pero el store local tiene plan, hace un upsert inicial.
 * Cualquier cambio en plannedExpenses / plannedBudget se vuelve a guardar con debounce.
 *
 * @returns false hasta completar el primer fetch del plan (o si no hay usuario), para no
 *   mostrar UI con plan desactualizado respecto a Supabase.
 */
export const usePlanRemoteSync = (): boolean => {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const plannedExpenses = useExpenseStore(state => state.plannedExpenses)
  const plannedBudget = useExpenseStore(state => state.plannedBudget)

  const [pullTick, setPullTick] = useState(0)
  const skipPushRef = useRef(true)
  const [planSyncedUserId, setPlanSyncedUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    queueMicrotask(() => {
      setPlanSyncedUserId(null)
    })

    skipPushRef.current = true
    let cancelled = false

    const run = async () => {
      const remote = await fetchUserPlanFromRemote()
      if (cancelled) return

      if (remote) {
        useExpenseStore.getState().hydratePlannedFromRemote(remote)
      } else {
        const { plannedExpenses: localE, plannedBudget: localB } = useExpenseStore.getState()
        if (localE.length > 0 || localB !== null) {
          const { error } = await upsertUserPlanRemote(localE, localB)
          if (error) {
            console.warn('[plan sync] seed upsert failed:', error)
          }
        }
      }
    }

    void run().finally(() => {
      if (cancelled) return
      skipPushRef.current = false
      setPullTick(t => t + 1)
      setPlanSyncedUserId(userId)
    })

    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!userId || pullTick === 0) return
    if (skipPushRef.current) return

    const handle = window.setTimeout(() => {
      const { plannedExpenses: nextE, plannedBudget: nextB } = useExpenseStore.getState()
      void upsertUserPlanRemote(nextE, nextB).then(({ error }) => {
        if (error) console.warn('[plan sync] upsert failed:', error)
      })
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(handle)
  }, [userId, pullTick, plannedExpenses, plannedBudget])

  return userId === null || planSyncedUserId === userId
}
