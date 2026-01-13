export interface VacationRequest {
    id: number
    user: string // Format: "Vorname Nachname" für Anzeige
    userId: string // Nachname für Zuordnung (oder admin/office)
    startDate: string
    endDate: string
    reason: string
    status: 'pending' | 'teamlead_approved' | 'approved' | 'rejected' | 'cancelled' | 'withdrawn'
    teamleadApprovalDate?: string
    managerApprovalDate?: string
}

export type UserRole = 'employee' | 'teamlead' | 'manager' | 'office' | 'sysadmin' | 'administrator'

export interface User {
    username: string // Nachname (Login-Name) oder admin/office
    firstName?: string // Optional: nur für normale Accounts
    lastName?: string // Optional: nur für normale Accounts
    password: string
    role: UserRole
    displayName: string
    isActive: number
}

export interface HalfDayRule {
    id: number
    date: string // ISO format: YYYY-MM-DD
    description: string
    createdBy: string
    createdAt: string
}

export interface VacationBalance {
    userId: string
    totalDays: number // Gesamt verfügbare Urlaubstage (Standard: 30)
    carryoverDays: number // Übertrag aus Vorjahr
    standardDays: number // Standard-Urlaubstage (30)
    usedDays: number // Genommene Urlaubstage (nur approved)
    remainingDays: number // Verbleibende Tage
    year: number
}

export interface UserCarryover {
    userId: string
    year: number
    carryoverDays: number
    expiryDate?: string // Optional: Verfallsdatum für Übertrag
}

export interface OrgNode {
    userId: string
    displayName: string
    role: UserRole
    teamleadId?: string // ID des Teamleiters (für employees und teamleads)
    username: string
    isActive: number
}

export interface Team {
    teamleadId: string
    teamleadName: string
    members: string[] // Array von userIds
}
