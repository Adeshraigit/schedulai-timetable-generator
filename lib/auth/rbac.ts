import { createClient } from '@/lib/supabase/server'

// User roles in order of privilege
export type UserRole = 'admin' | 'hod' | 'professor' | 'coordinator'

// Role hierarchy - higher index = more privileges
const roleHierarchy: UserRole[] = ['coordinator', 'professor', 'hod', 'admin']

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  department_id: string | null
}

/**
 * Get the current user's profile from the database
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role as UserRole,
    department_id: profile.department_id,
  }
}

/**
 * Check if user has at least the required role level
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = roleHierarchy.indexOf(userRole)
  const requiredLevel = roleHierarchy.indexOf(requiredRole)
  return userLevel >= requiredLevel
}

/**
 * Check if user can access a specific resource
 */
export function canAccessResource(
  userRole: UserRole,
  userDepartmentId: string | null,
  resourceDepartmentId: string | null
): boolean {
  // Admins can access everything
  if (userRole === 'admin') return true
  
  // HODs can access their own department
  if (userRole === 'hod') {
    return userDepartmentId === resourceDepartmentId
  }
  
  // Professors and coordinators can access their department
  return userDepartmentId === resourceDepartmentId
}

/**
 * Permission definitions for different actions
 */
export const permissions = {
  // Timetable permissions
  timetable: {
    create: (role: UserRole) => hasMinimumRole(role, 'coordinator'),
    read: (role: UserRole) => hasMinimumRole(role, 'coordinator'),
    update: (role: UserRole) => hasMinimumRole(role, 'coordinator'),
    delete: (role: UserRole) => hasMinimumRole(role, 'hod'),
    publish: (role: UserRole) => hasMinimumRole(role, 'hod'),
    generate: (role: UserRole) => hasMinimumRole(role, 'coordinator'),
  },
  
  // Course permissions
  course: {
    create: (role: UserRole) => hasMinimumRole(role, 'hod'),
    read: (role: UserRole) => hasMinimumRole(role, 'coordinator'),
    update: (role: UserRole) => hasMinimumRole(role, 'hod'),
    delete: (role: UserRole) => hasMinimumRole(role, 'hod'),
  },
  
  // Professor permissions
  professor: {
    create: (role: UserRole) => hasMinimumRole(role, 'hod'),
    read: (role: UserRole) => hasMinimumRole(role, 'coordinator'),
    update: (role: UserRole) => hasMinimumRole(role, 'hod'),
    delete: (role: UserRole) => hasMinimumRole(role, 'hod'),
    updateOwn: (role: UserRole) => hasMinimumRole(role, 'professor'),
  },
  
  // Room permissions
  room: {
    create: (role: UserRole) => hasMinimumRole(role, 'hod'),
    read: (role: UserRole) => hasMinimumRole(role, 'coordinator'),
    update: (role: UserRole) => hasMinimumRole(role, 'hod'),
    delete: (role: UserRole) => hasMinimumRole(role, 'hod'),
  },
  
  // Constraint permissions
  constraint: {
    create: (role: UserRole) => hasMinimumRole(role, 'professor'),
    read: (role: UserRole) => hasMinimumRole(role, 'coordinator'),
    update: (role: UserRole) => hasMinimumRole(role, 'professor'),
    delete: (role: UserRole) => hasMinimumRole(role, 'professor'),
  },
  
  // Department permissions
  department: {
    create: (role: UserRole) => role === 'admin',
    read: () => true,
    update: (role: UserRole) => role === 'admin',
    delete: (role: UserRole) => role === 'admin',
  },
  
  // User management permissions
  user: {
    create: (role: UserRole) => role === 'admin',
    read: (role: UserRole) => hasMinimumRole(role, 'hod'),
    update: (role: UserRole) => hasMinimumRole(role, 'hod'),
    delete: (role: UserRole) => role === 'admin',
    changeRole: (role: UserRole) => role === 'admin',
  },
}

/**
 * Role display labels
 */
export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  hod: 'Head of Department',
  professor: 'Professor',
  coordinator: 'Coordinator',
}

/**
 * Get available actions for a role
 */
export function getAvailableActions(role: UserRole) {
  return {
    canManageDepartments: role === 'admin',
    canManageUsers: hasMinimumRole(role, 'hod'),
    canManageCourses: hasMinimumRole(role, 'hod'),
    canManageProfessors: hasMinimumRole(role, 'hod'),
    canManageRooms: hasMinimumRole(role, 'hod'),
    canCreateTimetables: hasMinimumRole(role, 'coordinator'),
    canPublishTimetables: hasMinimumRole(role, 'hod'),
    canDeleteTimetables: hasMinimumRole(role, 'hod'),
    canCreateConstraints: hasMinimumRole(role, 'professor'),
    canViewReports: hasMinimumRole(role, 'coordinator'),
  }
}
