import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getProfile, signIn as dbSignIn, signOut as dbSignOut } from '../lib/database'
import type { Profile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Check if we're in mock mode by looking for mock auth data in the DOM
    const mockElement = document.querySelector('[style*="--auth-context"]') as HTMLElement
    if (mockElement) {
      try {
        const mockData = JSON.parse(mockElement.style.getPropertyValue('--auth-context') || '{}')
        if (mockData.user && mockData.profile) {
          return mockData as AuthContextType
        }
      } catch (e) {
        // Fallback to error if parsing fails
      }
    }
    
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (user) {
      try {
        const userProfile = await getProfile(user.id)
        setProfile(userProfile)
      } catch (error) {
        console.error('Error refreshing profile:', error)
        setProfile(null)
      }
    } else {
      setProfile(null)
    }
  }, [user])

  useEffect(() => {
    if (isSupabaseConfigured()) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } else {
      // Mock mode - no persistent session
      setLoading(false)
    }
  }, [])

  // Separate effect for refreshing profile when user changes
  useEffect(() => {
    if (user) {
      refreshProfile()
    } else {
      setProfile(null)
    }
  }, [user, refreshProfile])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await dbSignIn(email, password)
      
      if (!isSupabaseConfigured()) {
        // In mock mode, manually set user and profile
        setUser(result.user as User)
      }
      // In Supabase mode, the auth state change listener will handle setting the user
    } catch (error) {
      console.error('Signin error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await dbSignOut()
      
      if (!isSupabaseConfigured()) {
        // In mock mode, manually clear user and profile
        setUser(null)
        setProfile(null)
      }
      // In Supabase mode, the auth state change listener will handle clearing the user
    } catch (error) {
      console.error('Signout error:', error)
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}