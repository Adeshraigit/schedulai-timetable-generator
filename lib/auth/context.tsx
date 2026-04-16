'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import type { UserRole } from './rbac'

interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  department_id: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as UserRole,
        department_id: data.department_id,
      })
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        await fetchProfile(user.id)
      }
      
      setIsLoading(false)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Hook to check if user has specific permission
 */
export function usePermission(permission: (role: UserRole) => boolean): boolean {
  const { profile } = useAuth()
  if (!profile) return false
  return permission(profile.role)
}

/**
 * Hook to get user's available actions
 */
export function useAvailableActions() {
  const { profile } = useAuth()
  
  if (!profile) {
    return {
      canManageDepartments: false,
      canManageUsers: false,
      canManageCourses: false,
      canManageProfessors: false,
      canManageRooms: false,
      canCreateTimetables: false,
      canPublishTimetables: false,
      canDeleteTimetables: false,
      canCreateConstraints: false,
      canViewReports: false,
    }
  }

  const roleHierarchy: UserRole[] = ['coordinator', 'professor', 'hod', 'admin']
  const hasMinimumRole = (role: UserRole, required: UserRole) => {
    return roleHierarchy.indexOf(role) >= roleHierarchy.indexOf(required)
  }

  return {
    canManageDepartments: profile.role === 'admin',
    canManageUsers: hasMinimumRole(profile.role, 'hod'),
    canManageCourses: hasMinimumRole(profile.role, 'hod'),
    canManageProfessors: hasMinimumRole(profile.role, 'hod'),
    canManageRooms: hasMinimumRole(profile.role, 'hod'),
    canCreateTimetables: hasMinimumRole(profile.role, 'coordinator'),
    canPublishTimetables: hasMinimumRole(profile.role, 'hod'),
    canDeleteTimetables: hasMinimumRole(profile.role, 'hod'),
    canCreateConstraints: hasMinimumRole(profile.role, 'professor'),
    canViewReports: hasMinimumRole(profile.role, 'coordinator'),
  }
}
