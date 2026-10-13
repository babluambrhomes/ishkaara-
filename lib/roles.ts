export const USER_ROLES = ['User', 'Employee', 'Admin'] as const

export type UserRole = (typeof USER_ROLES)[number]

export const isStaffRole = (role?: string | null): boolean =>
  role === 'Admin' || role === 'Employee'

export const isAdminRole = (role?: string | null): boolean => role === 'Admin'
