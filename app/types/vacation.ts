export interface VacationRequest {
    id: number
    user: string // Format: "Vorname Nachname" für Anzeige
    userId: string // Nachname für Zuordnung (oder admin/office)
    startDate: string
    endDate: string
    reason: string
    status: 'pending' | 'teamlead_approved' | 'approved' | 'rejected'
    teamleadApprovalDate?: string
    managerApprovalDate?: string
}

export type UserRole = 'employee' | 'teamlead' | 'manager' | 'office'

export interface User {
    username: string // Nachname (Login-Name) oder admin/office
    firstName?: string // Optional: nur für normale Accounts
    lastName?: string // Optional: nur für normale Accounts
    password: string
    role: UserRole
    displayName: string // "Vorname Nachname" oder "admin"/"office"
}
