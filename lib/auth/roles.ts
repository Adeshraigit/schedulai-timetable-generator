// Shared role types and pure helpers safe for both client and server.
export type UserRole = 'admin' | 'hod' | 'professor' | 'coordinator'

// Higher index means more privileges.
const roleHierarchy: UserRole[] = ['coordinator', 'professor', 'hod', 'admin']

export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = roleHierarchy.indexOf(userRole)
  const requiredLevel = roleHierarchy.indexOf(requiredRole)
  return userLevel >= requiredLevel
}

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  hod: 'Head of Department',
  professor: 'Professor',
  coordinator: 'Coordinator',
}

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
