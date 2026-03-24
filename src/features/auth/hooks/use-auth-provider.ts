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
    // Obtener sesión actual al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      rehydrateStore(currentUser?.id)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      rehydrateStore(currentUser?.id)
    })

    return () => subscription.unsubscribe()
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
