import type { OrgNode, Team } from '~/types/vacation'

export const useOrganization = () => {
    const toast = useToast()

    // Organigramm-Struktur
    const orgNodes = ref<OrgNode[]>([
        // Manager (Top) - admin ausgeblendet (reine Verwaltungsrolle)
        { userId: 'Schulz', displayName: 'Stefan Schulz', role: 'manager' },
        
        // Office (direkt unter Manager)
        { userId: 'Meyer', displayName: 'Sandra Meyer', role: 'office', managerId: 'Schulz' },
        
        // Teamleads (unter Manager)
        { userId: 'Mueller', displayName: 'Thomas Mueller', role: 'teamlead', managerId: 'Schulz' },
        { userId: 'Weber', displayName: 'Sarah Weber', role: 'teamlead', managerId: 'Schulz' },
        { userId: 'Fischer', displayName: 'Michael Fischer', role: 'teamlead', managerId: 'Schulz' },
        
        // Employees - Team Mueller
        { userId: 'Mustermann', displayName: 'Max Mustermann', role: 'employee', teamId: 'Mueller', managerId: 'Mueller' },
        { userId: 'Schmidt', displayName: 'Anna Schmidt', role: 'employee', teamId: 'Mueller', managerId: 'Mueller' },
        { userId: 'Schneider', displayName: 'Lisa Schneider', role: 'employee', teamId: 'Mueller', managerId: 'Mueller' },
        
        // Employees - Team Weber
        { userId: 'Becker', displayName: 'Jonas Becker', role: 'employee', teamId: 'Weber', managerId: 'Weber' },
        { userId: 'Hoffmann', displayName: 'Julia Hoffmann', role: 'employee', teamId: 'Weber', managerId: 'Weber' },
        { userId: 'Koch', displayName: 'Daniel Koch', role: 'employee', teamId: 'Weber', managerId: 'Weber' },
        
        // Employees - Team Fischer
        { userId: 'Bauer', displayName: 'Laura Bauer', role: 'employee', teamId: 'Fischer', managerId: 'Fischer' },
        { userId: 'Richter', displayName: 'Sebastian Richter', role: 'employee', teamId: 'Fischer', managerId: 'Fischer' },
        { userId: 'Klein', displayName: 'Nina Klein', role: 'employee', teamId: 'Fischer', managerId: 'Fischer' },
        { userId: 'Wolf', displayName: 'Tim Wolf', role: 'employee', teamId: 'Fischer', managerId: 'Fischer' },
    ])

    // Teams mit Mitgliedern
    const getTeams = computed((): Team[] => {
        const teamleads = orgNodes.value.filter(n => n.role === 'teamlead')
        
        return teamleads.map(tl => ({
            teamleadId: tl.userId,
            teamleadName: tl.displayName,
            members: orgNodes.value
                .filter(n => n.teamId === tl.userId)
                .map(n => n.userId)
        }))
    })

    // Mitarbeiter einem Team zuordnen
    const assignToTeam = (userId: string, teamleadId: string) => {
        const node = orgNodes.value.find(n => n.userId === userId)
        if (!node) return false

        node.teamId = teamleadId
        node.managerId = teamleadId
        toast.success(`${node.displayName} wurde Team ${teamleadId} zugeordnet`)
        return true
    }

    // Mitarbeiter aus Team entfernen
    const removeFromTeam = (userId: string) => {
        const node = orgNodes.value.find(n => n.userId === userId)
        if (!node) return false

        node.teamId = undefined
        node.managerId = undefined
        toast.success(`${node.displayName} wurde aus dem Team entfernt`)
        return true
    }

    // Alle Mitarbeiter ohne Team
    const getUnassignedEmployees = computed(() => {
        return orgNodes.value.filter(n => n.role === 'employee' && !n.teamId)
    })

    // Team eines bestimmten Teamleiters
    const getTeamMembers = (teamleadId: string) => {
        return computed(() => 
            orgNodes.value.filter(n => n.teamId === teamleadId)
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

    // Manager
    const getManager = computed(() => {
        return orgNodes.value.find(n => n.role === 'manager' && n.userId !== 'admin')
    })

    // Direkte Untergebene eines Users
    const getDirectReports = (userId: string) => {
        return computed(() => 
            orgNodes.value.filter(n => n.managerId === userId)
        )
    }

    // Hierarchie-Ebene ermitteln
    const getLevel = (userId: string): number => {
        const node = orgNodes.value.find(n => n.userId === userId)
        if (!node) return 0
        if (!node.managerId) return 0 // Top-Level
        return 1 + getLevel(node.managerId)
    }

    // Organigramm als Baum-Struktur
    const getOrgTree = computed(() => {
        const buildTree = (parentId?: string): any[] => {
            return orgNodes.value
                .filter(n => n.managerId === parentId)
                .map(n => ({
                    ...n,
                    children: buildTree(n.userId)
                }))
        }

        // Start bei Nodes ohne Manager (Top-Level)
        return orgNodes.value
            .filter(n => !n.managerId)
            .map(n => ({
                ...n,
                children: buildTree(n.userId)
            }))
    })

    return {
        orgNodes: readonly(orgNodes),
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
