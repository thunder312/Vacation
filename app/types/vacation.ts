export interface VacationRequest {
    id: number
    user: string
    startDate: string
    endDate: string
    reason: string
    status: 'pending' | 'teamleiter_approved' | 'approved' | 'rejected'
    teamleiterApprovalDate?: string
    chefApprovalDate?: string
}

export type UserRole = 'employee' | 'teamleiter' | 'chef'