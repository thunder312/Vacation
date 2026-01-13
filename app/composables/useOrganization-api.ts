// composables/useOrganization-api.ts
import type { OrgNode, Team } from '~/types/vacation'

export const useOrganization = () => {
  const toast = useToast()
  
  // State für Org-Daten (wird vom Server geladen)
  const orgNodes = useState<OrgNode[]>('orgNodes', () => [])
  const loading = useState('orgLoading', () => false)

  // Org-Daten vom Server laden
  const fetchOrganization = async () => {
    loading.value = true
    try {
      const data = await $fetch<OrgNode[]>('/api/organization')
      // Administrator-Benutzer im Organigramm ausblenden
      orgNodes.value = data.filter(node => node.role !== 'administrator')
    } catch (error) {
      console.error('Failed to fetch organization:', error)
      toast.error('Fehler beim Laden des Organigramms')
    } finally {
      loading.value = false
    }
  }

  // Teams mit Mitgliedern
  const getTeams = computed((): Team[] => {
    const teamleads = orgNodes.value.filter(n => n.role === 'teamlead')
    
    return teamleads.map(tl => ({
      teamleadId: tl.userId,
      teamleadName: tl.displayName,
      members: orgNodes.value
        .filter(n => n.teamleadId?.toLowerCase() === tl.userId.toLowerCase())
        .map(n => n.userId)
    }))
  })

  // Mitarbeiter einem Team zuordnen
  const assignToTeam = async (userId: string, teamleadId: string) => {
    try {
      await $fetch(`/api/organization/${userId}`, {
        method: 'PATCH',
        body: { teamleadId: teamleadId }
      })

      // Lokale Daten aktualisieren
      const node = orgNodes.value.find(n => n.userId === userId)
      if (node) {
        node.teamleadId = teamleadId
      }

      toast.success(`${node?.displayName || userId} wurde Team ${teamleadId} zugeordnet`)
      
      // Trigger User-Management Update
      const orgLastUpdated = useState<number>('orgLastUpdated')
      orgLastUpdated.value = Date.now()
      
      return true
    } catch (error) {
      console.error('Failed to assign to team:', error)
      toast.error('Fehler beim Zuordnen')
      return false
    }
  }

  // Mitarbeiter aus Team entfernen
  const removeFromTeam = async (userId: string) => {
    try {
      await $fetch(`/api/organization/${userId}`, {
        method: 'PATCH',
        body: { teamleadId: null }
      })

      // Lokale Daten aktualisieren
      const node = orgNodes.value.find(n => n.userId === userId)
      if (node) {
        node.teamleadId = undefined
      }

      toast.success(`${node?.displayName || userId} wurde aus dem Team entfernt`)
      
      // Trigger User-Management Update
      const orgLastUpdated = useState<number>('orgLastUpdated')
      orgLastUpdated.value = Date.now()
      
      return true
    } catch (error) {
      console.error('Failed to remove from team:', error)
      toast.error('Fehler beim Entfernen')
      return false
    }
  }

  // Alle Mitarbeiter ohne Team
  const getUnassignedEmployees = computed(() => {
    return orgNodes.value.filter(n => n.role === 'employee' && !n.teamleadId)
  })

  // Team eines bestimmten Teamleiters - CASE INSENSITIVE
  const getTeamMembers = (teamleadId: string) => {
    return computed(() => 
      orgNodes.value.filter(n => 
        n.teamleadId?.toLowerCase() === teamleadId.toLowerCase()
      )
    )
  }

  // Alle Teamleiter
  const getTeamleads = computed(() => {
    return orgNodes.value.filter(n => n.role === 'teamlead')
  })

  // Alle Employees
  const getAllEmployees = computed(() => {
    return orgNodes.value.filter(n => n.role === 'employee')
  })

  // Manager (Administrator ausschließen)
  const getManager = computed(() => {
    return orgNodes.value.find(n => n.role === 'manager' && n.role !== 'administrator')
  })

  // Direkte Untergebene eines Users - CASE INSENSITIVE
  const getDirectReports = (userId: string) => {
    return computed(() => 
      orgNodes.value.filter(n => 
        n.teamleadId?.toLowerCase() === userId.toLowerCase()
      )
    )
  }

  // Hierarchie-Ebene ermitteln
  const getLevel = (userId: string): number => {
    const node = orgNodes.value.find(n => n.userId.toLowerCase() === userId.toLowerCase())
    if (!node) return 0
    if (!node.teamleadId) return 0
    return 1 + getLevel(node.teamleadId)
  }

  // Organigramm als Baum-Struktur
  const getOrgTree = computed(() => {
    const buildTree = (parentId?: string): any[] => {
      return orgNodes.value
        .filter(n => n.teamleadId?.toLowerCase() === parentId?.toLowerCase())
        .map(n => ({
          ...n,
          children: buildTree(n.userId)
        }))
    }

    return orgNodes.value
      .filter(n => !n.teamleadId)
      .map(n => ({
        ...n,
        children: buildTree(n.userId)
      }))
  })

  return {
    orgNodes: readonly(orgNodes),
    loading: readonly(loading),
    fetchOrganization,
    getTeams,
    assignToTeam,
    removeFromTeam,
    getUnassignedEmployees,
    getTeamMembers,
    getTeamleads,
    getAllEmployees,
    getManager,
    getDirectReports,
    getLevel,
    getOrgTree
  }
}
