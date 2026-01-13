// composables/useVacationRequests-api.ts
import type { VacationRequest } from '~/types/vacation'
import { useEventBus } from '~/composables/useEventBus'

export const useVacationRequests = () => {
  const toast = useToast()
  const { t } = useI18n()
  const { emit } = useEventBus()
  
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
      toast.success(t('vacation.requestSuccess'))

      // Bei automatisch genehmigten Anträgen (Manager) den Kalender benachrichtigen
      if (newRequest.status === 'approved') {
        emit('vacation-approved', {
          requestId: newRequest.id,
          level: 'manager',
          status: newRequest.status,
          startDate: newRequest.startDate,
          endDate: newRequest.endDate
        })
      }

      return newRequest
    } catch (error) {
      console.error('Failed to submit request:', error)
      toast.error(t('vacation.requestError'))
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
          toast.success(t('vacation.approveSuccess'))
        } else {
          request.managerApprovalDate = new Date().toISOString()
          toast.success(t('vacation.approveSuccess'))
        }

        // Notify calendar to refresh
        emit('vacation-approved', {
          requestId: id,
          level: level,
          status: response.status,
          startDate: request.startDate,
          endDate: request.endDate
        })
      }

      return true
    } catch (error) {
      console.error('Failed to approve request:', error)
      toast.error(t('vacation.approveError'))
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

      toast.success(t('vacation.rejectSuccess'))
      return true
    } catch (error) {
      console.error('Failed to reject request:', error)
      toast.error(t('vacation.rejectError'))
      return false
    }
  }

  // Antrag zurückziehen (nur vom Antragsteller, nur bei pending Status)
  const withdrawRequest = async (id: number) => {
    try {
      await $fetch(`/api/vacation-requests/${id}`, {
        method: 'PATCH',
        body: { action: 'withdraw' }
      })

      // Lokale Liste aktualisieren
      const request = requests.value.find(r => r.id === id)
      if (request) {
        request.status = 'withdrawn'
      }

      toast.success(t('vacation.withdrawSuccess'))
      return true
    } catch (error) {
      console.error('Failed to withdraw request:', error)
      toast.error(t('vacation.withdrawError'))
      return false
    }
  }

  // Genehmigten Urlaub absagen (nur Manager)
  const cancelRequest = async (id: number, cancellationReason?: string) => {
    try {
      const response = await $fetch<any>(`/api/vacation/${id}/cancel`, {
        method: 'POST',
        body: { cancellationReason }
      })

      // Lokale Liste aktualisieren
      const request = requests.value.find(r => r.id === id)
      if (request) {
        request.status = 'cancelled'
        if (cancellationReason) {
          request.reason = `${request.reason}\n\n[ABGESAGT] ${cancellationReason}`
        }

        // Notify calendar to refresh
        emit('vacation-cancelled', {
          requestId: id,
          startDate: request.startDate,
          endDate: request.endDate,
          reason: cancellationReason
        })
      }

      toast.success(response.message || t('vacation.cancelSuccess'))
      return true
    } catch (error: any) {
      console.error('Failed to cancel request:', error)
      toast.error(error.data?.message || t('vacation.cancelError'))
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
    return computed(() => {
      const { orgNodes } = useOrganization()

      return requests.value.filter(r => {
        // Anträge, die vom Teamlead genehmigt wurden
        if (r.status === 'teamlead_approved') return true

        // Pending Anträge von Usern ohne Teamlead (Teamleiter, Office, etc.)
        if (r.status === 'pending') {
          const userNode = orgNodes.value.find(n => n.userId === r.userId)
          // User hat keinen Teamlead ODER ist selbst Teamlead/Office/Manager
          if (userNode && (!userNode.teamleadId || ['teamlead', 'office', 'manager', 'sysadmin'].includes(userNode.role))) {
            return true
          }
        }

        return false
      })
    })
  }

  const getAllTeamRequests = (currentUserId: string) => {
    return computed(() => requests.value.filter(r => r.userId !== currentUserId))
  }

  const getAllRequests = () => {
    return computed(() => [...requests.value])
  }

  // NEUE FUNKTIONEN FÜR vacation.vue
  
  // Team-Requests für einen Teamleiter (alle außer pending)
  const getTeamRequests = (teamleadId: string) => {
    return computed(() => {
      const { getTeamMembers } = useOrganization()
      const teamMemberIds = getTeamMembers(teamleadId).value.map(m => m.userId)
      return requests.value.filter(r => 
        teamMemberIds.includes(r.userId) && r.status !== 'pending'
      )
    })
  }

  // Manager-Requests (teamlead_approved + pending von Usern ohne Teamlead)
  const getManagerRequests = () => {
    return computed(() => {
      const { orgNodes } = useOrganization()

      return requests.value.filter(r => {
        // Anträge, die vom Teamlead genehmigt wurden
        if (r.status === 'teamlead_approved') return true

        // Pending Anträge von Usern ohne Teamlead (Teamleiter, Office, etc.)
        if (r.status === 'pending') {
          const userNode = orgNodes.value.find(n => n.userId === r.userId)
          // User hat keinen Teamlead ODER ist selbst Teamlead/Office/Manager
          if (userNode && (!userNode.teamleadId || ['teamlead', 'office', 'manager', 'sysadmin'].includes(userNode.role))) {
            return true
          }
        }

        return false
      })
    })
  }

  // Genehmigte Requests (für Manager zum Absagen)
  const getApprovedRequests = () => {
    return computed(() => 
      requests.value.filter(r => r.status === 'approved')
    )
  }

  return {
    requests: readonly(requests),
    loading: readonly(loading),
    fetchRequests,
    submitRequest,
    approveRequest,
    rejectRequest,
    withdrawRequest,
    cancelRequest,
    getUserRequests,
    getApprovedUserRequests,
    getPendingTeamleadRequests,
    getPendingManagerRequests,
    getAllTeamRequests,
    getAllRequests,
    getTeamRequests,
    getManagerRequests,
    getApprovedRequests
  }
}
