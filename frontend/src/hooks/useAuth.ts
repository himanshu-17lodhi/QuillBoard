import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/stores/useStore'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const setUserStore = useStore((state) => state.setUser)

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          setError(sessionError.message)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!profileError && profile) {
            setUserStore({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              avatarUrl: profile.avatar_url,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            })
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (session?.user) {
          // Get user profile on sign in
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUserStore({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              avatarUrl: profile.avatar_url,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            })
          }
        } else {
          // Clear user store on sign out
          setUserStore(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUserStore])

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed'
      setError(errorMessage)
      return { data: null, error: new Error(errorMessage) }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed'
      setError(errorMessage)
      return { data: null, error: new Error(errorMessage) }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google sign in failed'
      setError(errorMessage)
      return { data: null, error: new Error(errorMessage) }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGithub = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'GitHub sign in failed'
      setError(errorMessage)
      return { data: null, error: new Error(errorMessage) }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError(error.message)
        return { error }
      }

      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed'
      setError(errorMessage)
      return { error: new Error(errorMessage) }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed'
      setError(errorMessage)
      return { data: null, error: new Error(errorMessage) }
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password update failed'
      setError(errorMessage)
      return { data: null, error: new Error(errorMessage) }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: { name?: string; avatar_url?: string }) => {
    setLoading(true)
    setError(null)
    
    try {
      if (!user) {
        throw new Error('No user logged in')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      // Update local state
      if (data) {
        setUserStore({
          id: data.id,
          email: data.email,
          name: data.name,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        })
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed'
      setError(errorMessage)
      return { data: null, error: new Error(errorMessage) }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated: !!user,
  }
}