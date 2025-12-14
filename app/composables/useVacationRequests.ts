import type { VacationRequest } from '~/types/vacation'

export const useVacationRequests = () => {
    // Mock-Daten (später durch API ersetzen)
    const requests = ref<VacationRequest[]>([
        {
            id: 1,
            user: 'Max Mustermann',
            userId: 'Mustermann',
            startDate: '2025-12-15',
            endDate: '2025-12-20',
            reason: 'Weihnachtsurlaub',
            status: 'pending'
        },
        {
            id: 2,
            user: 'Anna Schmidt',
            userId: 'Schmidt',
            startDate: '2026-01-10',
            endDate: '2026-01-15',
            reason: 'Familienbesuch',
            status: 'teamlead_approved',
            teamleadApprovalDate: '2025-11-25'
        }
    ])

    const submitRequest = (
        userId: string,
        displayName: string,
        startDate: string,
        endDate: string,
        reason: string
    ) => {
        const request: VacationRequest = {
            id: Date.now(),
            user: displayName,
            userId,
            startDate,
            endDate,
            reason,
            status: 'pending'
        }

        requests.value.push(request)
        return request
    }

    const approveRequest = (id: number, level: 'teamlead' | 'manager') => {
        const request = requests.value.find(r => r.id === id)
        if (!request) return false

        if (level === 'teamlead') {
            request.status = 'teamlead_approved'
            request.teamleadApprovalDate = new Date().toISOString().split('T')[0]
        } else {
            request.status = 'approved'
            request.managerApprovalDate = new Date().toISOString().split('T')[0]
        }

        return true
    }

    const rejectRequest = (id: number) => {
        const request = requests.value.find(r => r.id === id)
        if (!request) return false

        request.status = 'rejected'
        return true
    }

    const getUserRequests = (userId: string) => {
        return computed(() => requests.value.filter(r => r.userId === userId))
    }

    const getApprovedUserRequests = (userId: string) => {
        return computed(() =>
            requests.value.filter(r => r.userId === userId && r.status === 'approved')
        )
    }

    const getPendingTeamleadRequests = () => {
        return computed(() => requests.value.filter(r => r.status === 'pending'))
    }

    const getPendingManagerRequests = () => {
        return computed(() => requests.value.filter(r => r.status === 'teamlead_approved'))
    }

    const getAllTeamRequests = (currentUserId: string) => {
        return computed(() => requests.value.filter(r => r.userId !== currentUserId))
    }

    const getAllRequests = () => {
        return computed(() => [...requests.value])
    }

    return {
        requests,
        submitRequest,
        approveRequest,
        rejectRequest,
        getUserRequests,
        getApprovedUserRequests,
        getPendingTeamleadRequests,
        getPendingManagerRequests,
        getAllTeamRequests,
        getAllRequests
    }
}
