// server/database/types.ts

export interface DbUser {
  username: string
  password: string
  firstName: string
  lastName: string
  role: 'employee' | 'teamlead' | 'manager' | 'office' | 'sysadmin' | 'administrator'
  vacationDays: number
  isActive: number // SQLite uses 0/1 for boolean
  createdAt: string
  updatedAt?: string
}

export interface DbVacationRequest {
  id: number
  userId: string
  displayName: string
  startDate: string
  endDate: string
  reason: string | null
  status: 'pending' | 'teamlead_approved' | 'approved' | 'rejected' | 'cancelled'
  cancelReason: string | null
  createdAt: string
  teamleadApprovalDate?: string
  managerApprovalDate?: string
}

export interface DbOrganization {
  id: number
  userId: string
  teamleadId: string | null
  createdAt: string
}

export interface DbCarryover {
  id: number
  userId: string
  year: number
  calculatedDays: number
  approvedDays: number | null
  reason: string | null
  status: 'pending' | 'approved'
  createdAt: string
}

export interface DbHalfDayRule {
  id: number
  date: string
  description: string
  createdAt: string
}
