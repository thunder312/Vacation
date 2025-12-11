import type { VacationRequest } from '~/types/vacation'

export const useVacationRequests = () => {
    // Mock-Daten (später durch API ersetzen)
    const requests = ref<VacationRequest[]>([
        {
            id: 1,
            user: 'Max Mustermann',
            startDate: '2025-12-15',
            endDate: '2025-12-20',
            reason: 'Weihnachtsurlaub',
            status: 'pending'
        },
        {
            id: 2,
            user: 'Anna Schmidt',
            startDate: '2026-01-10',
            endDate: '2026-01-15',
            reason: 'Familienbesuch',
            status: 'teamleiter_approved',
            teamleiterApprovalDate: '2025-11-25'
        }
    ])

    const submitRequest = (
        user: string,
        startDate: string,
        endDate: string,
        reason: string
    ) => {
        const request: VacationRequest = {
            id: Date.now(),
            user,
            startDate,
            endDate,
            reason,
            status: 'pending'
        }

        requests.value.push(request)
        return request
    }

    const approveRequest = (id: number, level: 'teamleiter' | 'chef') => {
        const request = requests.value.find(r => r.id === id)
        if (!request) return false

        if (level === 'teamleiter') {
            request.status = 'teamleiter_approved'
            request.teamleiterApprovalDate = new Date().toISOString().split('T')[0]
        } else {
            request.status = 'approved'
            request.chefApprovalDate = new Date().toISOString().split('T')[0]
        }

        return true
    }

    const rejectRequest = (id: number) => {
        const request = requests.value.find(r => r.id === id)
        if (!request) return false

        request.status = 'rejected'
        return true
    }

    const getUserRequests = (username: string) => {
        return computed(() => requests.value.filter(r => r.user === username))
    }

    const getApprovedUserRequests = (username: string) => {
        return computed(() =>
            requests.value.filter(r => r.user === username && r.status === 'approved')
        )
    }

    const getPendingTeamleiterRequests = () => {
        return computed(() => requests.value.filter(r => r.status === 'pending'))
    }

    const getPendingChefRequests = () => {
        return computed(() => requests.value.filter(r => r.status === 'teamleiter_approved'))
    }

    const getAllTeamRequests = (currentUser: string) => {
        return computed(() => requests.value.filter(r => r.user !== currentUser))
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
        getPendingTeamleiterRequests,
        getPendingChefRequests,
        getAllTeamRequests,
        getAllRequests
    }
}