import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../core/supabase/client'
import { rehydrateStore } from '../../../store/expense-store'
import type { User } from '@supabase/supabase-js'

/**
 * useAuthProvider — Hook interno que gestiona el estado de autenticación.
 * Se llama UNA sola vez en `AuthProvider`.
 */
export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const bootstrapSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      try {
        await rehydrateStore(currentUser?.id)
      } catch (err) {
        console.error('[auth] rehydrateStore failed', err)
      }
      if (cancelled) return
      setUser(currentUser)
      setLoading(false)
    }

    void bootstrapSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      try {
        await rehydrateStore(currentUser?.id)
      } catch (err) {
        console.error('[auth] rehydrateStore failed', err)
      }
      setUser(currentUser)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({ email, password })
    return error?.message ?? null
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { user, loading, signIn, signUp, signOut }
}
