export interface VacationRequest {
    id: number
    user: string // Format: "Vorname Nachname" für Anzeige
    userId: string // Nachname für Zuordnung (oder admin/office)
    startDate: string
    endDate: string
    reason: string
    status: 'pending' | 'teamleiter_approved' | 'approved' | 'rejected'
    teamleiterApprovalDate?: string
    chefApprovalDate?: string
}

export type UserRole = 'employee' | 'teamleiter' | 'chef' | 'office'

export interface User {
    username: string // Nachname (Login-Name) oder admin/office
    firstName?: string // Optional: nur für normale Accounts
    lastName?: string // Optional: nur für normale Accounts
    password: string
    role: UserRole
    displayName: string // "Vorname Nachname" oder "admin"/"office"
}
