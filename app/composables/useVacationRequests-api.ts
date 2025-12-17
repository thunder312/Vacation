// composables/useVacationRequests.ts
import type { VacationRequest } from '~/types/vacation'

export const useVacationRequests = () => {
  const toast = useToast()
  
  // State für alle Requests (wird vom Server geladen)
  const requests = useState<VacationRequest[]>('vacationRequests', () => [])
  const loading = useState('vacationRequestsLoading', () => false)

  // Alle Requests vom Server laden
  const fetchRequests = async () => {
    loading.value = true
    try {
      const data = await $fetch<VacationRequest[]>('/api/vacation-requests')
      requests.value = data
    } catch (error) {
      console.error('Failed to fetch vacation requests:', error)
      toast.error('Fehler beim Laden der Urlaubsanträge')
    } finally {
      loading.value = false
    }
  }

  // Neuen Antrag erstellen
  const submitRequest = async (
    userId: string,
    displayName: string,
    startDate: string,
    endDate: string,
    reason: string
  ) => {
    try {
      const newRequest = await $fetch<VacationRequest>('/api/vacation-requests', {
        method: 'POST',
        body: { userId, displayName, startDate, endDate, reason }
      })

      // Lokale Liste aktualisieren
      requests.value.push(newRequest)
      toast.success('Urlaubsantrag erfolgreich eingereicht')
      
      return newRequest
    } catch (error) {
      console.error('Failed to submit request:', error)
      toast.error('Fehler beim Einreichen des Antrags')
      throw error
    }
  }

  // Antrag genehmigen (Teamlead oder Manager)
  const approveRequest = async (id: number, level: 'teamlead' | 'manager') => {
    try {
      const response = await $fetch<{ success: boolean; status: string }>(`/api/vacation-requests/${id}`, {
        method: 'PATCH',
        body: { action: 'approve', level }
      })

      // Lokale Liste aktualisieren
      const request = requests.value.find(r => r.id === id)
      if (request) {
        request.status = response.status as any
        
        if (level === 'teamlead') {
          request.teamleadApprovalDate = new Date().toISOString()
          toast.success('Urlaubsantrag als Teamleiter genehmigt')
        } else {
          request.managerApprovalDate = new Date().toISOString()
          toast.success('Urlaubsantrag als Manager genehmigt')
        }
      }

      return true
    } catch (error) {
      console.error('Failed to approve request:', error)
      toast.error('Fehler beim Genehmigen des Antrags')
      return false
    }
  }

  // Antrag ablehnen
  const rejectRequest = async (id: number) => {
    try {
      await $fetch(`/api/vacation-requests/${id}`, {
        method: 'PATCH',
        body: { action: 'reject' }
      })

      // Lokale Liste aktualisieren
      const request = requests.value.find(r => r.id === id)
      if (request) {
        request.status = 'rejected'
      }

      toast.success('Urlaubsantrag abgelehnt')
      return true
    } catch (error) {
      console.error('Failed to reject request:', error)
      toast.error('Fehler beim Ablehnen des Antrags')
      return false
    }
  }

  // Computed Properties
  const getUserRequests = (userId: string) => {
    return computed(() => requests.value.filter(r => r.userId === userId))
  }

  const getApprovedUserRequests = (userId: string) => {
    return computed(() => 
      requests.value.filter(r => r.userId === userId && r.status === 'approved')
    )
  }

  const getPendingTeamleadRequests = (teamleadId?: string) => {
    return computed(() => {
      const pending = requests.value.filter(r => r.status === 'pending')
      
      if (!teamleadId) {
        // Manager sieht alle
        return pending
      }
      
      // Teamleads nur ihr Team
      const { getTeamMembers } = useOrganization()
      const teamMemberIds = getTeamMembers(teamleadId).value.map(m => m.userId)
      
      return pending.filter(r => teamMemberIds.includes(r.userId))
    })
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
    requests: readonly(requests),
    loading: readonly(loading),
    fetchRequests,
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
