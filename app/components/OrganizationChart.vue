<template>
  <div class="organization-chart">
    <div class="chart-header">
      <div>
        <h2>{{ t('nav.organization') }}</h2>
        <p class="description">{{ t('organization.description') }}</p>
      </div>
      <div class="export-buttons">
        <button @click="exportOrgChart" class="btn-pdf">{{ icons.organization?.pdf || '📄' }} {{ t('organization.exportOrgChart') }}</button>
        <button @click="exportTeamOverview" class="btn-pdf">{{ icons.organization?.pdf || '📄' }} {{ t('organization.exportTeamOverview') }}</button>
      </div>
    </div>

    <div class="teams-overview">
      <div class="section-header" @click="toggleTeamsSection">
        <h3>
          <span class="toggle-icon">{{ showTeamsSection ? (icons.ui?.expand || '▼') : (icons.ui?.collapse || '▶') }}</span>
          {{ t('organization.teamManagement') }} ({{ teams?.length || 0 }})
        </h3>
        <span class="description-collapsed" v-if="!showTeamsSection">
          {{ t('organization.assignEmployeesToTeams') }}
        </span>
      </div>

      <div v-show="showTeamsSection" class="section-content">
        <div ref="teamsGridRef" class="teams-grid">
          <div v-for="teamlead in teamleads || []" :key="teamlead._key" class="team-card">
            <div class="team-header">
              <h4>{{ icons.roles?.teamlead || '👥' }} Team {{ teamlead.displayName }}</h4>
              <span class="team-count">{{ teamlead.teamMembers?.length || 0 }} {{ t('roles.employeeShort') }}</span>
            </div>
            <div class="team-members">
              <div v-if="!teamlead.teamMembers || teamlead.teamMembers.length === 0" class="empty-team">
                {{ t('organization.noEmployeesAssigned') }}
              </div>
              <div v-for="member in teamlead.teamMembers || []" :key="member.userId" class="member-item">
                {{ member.displayName }}
                <button
                    v-if="isEditable"
                    @click="handleRemove(member.userId)"
                    class="remove-btn"
                    :title="t('organization.removeFromTeam')"
                >
                  {{ icons.organization?.remove || '✕' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="org-tree-section">
      <div class="section-header" @click="toggleOrgTree">
        <h3>
          <span class="toggle-icon">{{ showOrgTree ? (icons.ui?.expand || '▼') : (icons.ui?.collapse || '▶') }}</span>
          {{ t('organization.orgChart') }}
        </h3>
        <span class="description-collapsed" v-if="!showOrgTree">
          {{ t('organization.graphicalRepresentation') }}
        </span>
      </div>

      <div v-show="showOrgTree" class="section-content">
        <div class="org-tree-wrapper">
          <div ref="orgTreeRef" class="org-tree">
            <!-- Manager-Ebene -->
            <div class="manager-level">
              <div v-for="manager in managers" :key="manager.userId" class="org-node manager">
                <div class="node-header">
                  <div class="node-icon">{{ icons.roles?.manager || '👔' }}</div>
                  <div class="node-info">
                    <div class="node-name">{{ manager.displayName }}</div>
                    <div class="node-role">{{ t('roles.manager') }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Verbindungslinie Manager -> Teamleiter -->
            <div class="org-connector-vertical"></div>
            <div class="org-connector-horizontal"></div>

            <!-- Teamleiter-Ebene mit allen Rollen -->
            <div class="teamlead-level">
              <!-- Office -->
              <div v-for="office in officeUsers" :key="office.userId" class="team-column">
                <div class="org-connector-vertical-small"></div>
                <div class="org-node office">
                  <div class="node-header">
                    <div class="node-icon">{{ icons.roles?.office || '📋' }}</div>
                    <div class="node-info">
                      <div class="node-name">{{ office.displayName }}</div>
                      <div class="node-role">{{ t('roles.office') }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sysadmin (direkt nach Office, ohne Untergebene) -->
              <div v-for="sysadmin in sysadminUsers" :key="sysadmin.userId" class="team-column">
                <div class="org-connector-vertical-small"></div>
                <div class="org-node sysadmin">
                  <div class="node-header">
                    <div class="node-icon">{{ icons.roles?.sysadmin || '🔧' }}</div>
                    <div class="node-info">
                      <div class="node-name">{{ sysadmin.displayName }}</div>
                      <div class="node-role">{{ t('roles.sysadmin') }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Teamleiter mit Mitarbeitern -->
              <div v-for="teamlead in teamleads" :key="teamlead._key" class="team-column">
                <div class="org-connector-vertical-small"></div>
                <div class="org-node teamlead">
                  <div class="node-header">
                    <div class="node-icon">{{ icons.organization?.boss || '👨‍💼' }}</div>
                    <div class="node-info">
                      <div class="node-name">{{ teamlead.displayName }}</div>
                      <div class="node-role">{{ t('roles.teamlead') }}</div>
                    </div>
                  </div>
                </div>

                <!-- Mitarbeiter unter dem Teamleiter -->
                <div v-if="teamlead.teamMembers && teamlead.teamMembers.length > 0" class="employees-tree">
                  <div class="org-connector-vertical-small"></div>
                  <div class="employees-row">
                    <div v-for="employee in teamlead.teamMembers" :key="employee.userId" class="org-node employee">
                      <div class="node-header">
                        <div class="node-icon">{{ icons.roles?.employee || '👤' }}</div>
                        <div class="node-info">
                          <div class="node-name">{{ employee.displayName }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Nicht zugeordnete Mitarbeiter -->
            <div v-if="unassignedEmployees.length > 0" class="unassigned-section">
              <h4>{{ icons.ui?.warning || '⚠️' }} {{ t('organization.unassignedEmployees') }}</h4>
              <div class="unassigned-list">
                <div v-for="employee in unassignedEmployees" :key="employee.userId" class="org-node employee unassigned">
                  <div class="node-header">
                    <div class="node-icon">{{ icons.roles?.employee || '👤' }}</div>
                    <div class="node-info">
                      <div class="node-name">{{ employee.displayName }}</div>
                      <div class="node-role">{{ t('roles.employee') }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { exportOrgChart as exportOrgChartPdf, exportTeamOverview as exportTeamOverviewPdf } from '~/utils/pdf'
import { icons } from '~/config/icons'

const { t } = useI18n()
const toast = useToast()

const props = defineProps<{
  organization?: any
  isEditable?: boolean
}>()

const emit = defineEmits(['remove-from-team'])

const showTeamsSection = ref(false)
const showOrgTree = ref(false)
const orgTreeRef = ref<HTMLElement | null>(null)
const teamsGridRef = ref<HTMLElement | null>(null)

// Lade Organization-Daten wenn nicht als Prop übergeben
const {
  orgNodes,
  getTeams,
  getManager,
  getTeamleads,
  getAllEmployees,
  getUnassignedEmployees,
  fetchOrganization
} = useOrganization()

// Transformiere orgNodes zu erwarteter Struktur
const organization = computed(() => {
  if (props.organization) {
    return props.organization
  }

  // Gruppiere orgNodes nach Rolle
  const nodes = (orgNodes.value || []).filter(n => n.isActive === 1)
  return {
    managers: nodes.filter(n => n.role === 'manager'),
    teamleads: nodes.filter(n => n.role === 'teamlead'),
    officeUsers: nodes.filter(n => n.role === 'office'),
    sysadminUsers: nodes.filter(n => n.role === 'sysadmin'),
    unassignedEmployees: nodes.filter(n => n.role === 'employee' && !n.teamleadId),
    teams: getTeams.value
  }
})

// Lade Daten beim Mount wenn nicht als Prop übergeben
onMounted(() => {
  if (!props.organization && orgNodes.value.length === 0) {
    fetchOrganization()
  }
})

const toggleTeamsSection = () => {
  showTeamsSection.value = !showTeamsSection.value
}

const toggleOrgTree = () => {
  showOrgTree.value = !showOrgTree.value
}

const managers = computed(() => organization.value?.managers || [])
const teamleads = computed(() => {
  const tls = organization.value?.teamleads || []

  return tls.map(tl => {
    // Finde Members direkt aus orgNodes
    const members = (orgNodes.value || []).filter(n =>
        n.teamleadId === tl.userId && n.isActive === 1
    )

    // Wichtig: Neues Objekt mit spread
    return {
      ...tl,
      teamMembers: members,
      // Force reactive update
      _key: `${tl.userId}-${members.length}`
    }
  })
})

const teamsFiltered = computed(() => {
  const allTeams = getTeams.value || []

  return allTeams.map(team => ({
    ...team,
    // Filter members: nur aktive User
    members: (team.members || []).filter(memberId => {
      const member = orgNodes.value?.find(n => n.userId === memberId)
      return member && member.isActive === 1
    })
  })).filter(team => {
    // Entferne Teams mit deaktivierten Teamleitern
    const teamlead = orgNodes.value?.find(n => n.userId === team.teamleadId)
    return teamlead && teamlead.isActive === 1
  })
})


const officeUsers = computed(() => organization.value?.officeUsers || [])
const sysadminUsers = computed(() => organization.value?.sysadminUsers || [])
const unassignedEmployees = computed(() => organization.value?.unassignedEmployees || [])
const teams = computed(() => organization.value?.teams || [])

const allUsers = computed(() => {
  const users = new Map()

  managers.value.forEach((u: any) => users.set(u.userId, u))
  teamleads.value.forEach((u: any) => users.set(u.userId, u))
  officeUsers.value.forEach((u: any) => users.set(u.userId, u))
  sysadminUsers.value.forEach((u: any) => users.set(u.userId, u))
  unassignedEmployees.value.forEach((u: any) => users.set(u.userId, u))

  teamleads.value.forEach((tl: any) => {
    tl.teamMembers?.forEach((emp: any) => users.set(emp.userId, emp))
  })

  return users
})

const getDisplayName = (userId: string) => {
  const user = allUsers.value.get(userId)
  return user?.displayName || userId
}

const handleRemove = (userId: string) => {
  emit('remove-from-team', userId)
}

const exportOrgChart = async () => {
  if (!orgTreeRef.value) {
    toast.error('Organigramm nicht gefunden')
    return
  }

  if (!showOrgTree.value) {
    showOrgTree.value = true
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  toast.info(t('vacation.pdfGenerating'))

  try {
    await exportOrgChartPdf(orgTreeRef.value, t)
    toast.success(t('vacation.pdfCreated'))
  } catch (error) {
    console.error('Fehler beim PDF-Export:', error)
    toast.error(t('errors.creatingPdf'))
  }
}

const exportTeamOverview = async () => {
  if (!teamsGridRef.value) {
    toast.error('Team-Übersicht nicht gefunden')
    return
  }

  if (!showTeamsSection.value) {
    showTeamsSection.value = true
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  toast.info(t('vacation.pdfGenerating'))

  try {
    await exportTeamOverviewPdf(teamsGridRef.value, teams.value, t)
    toast.success(t('vacation.pdfCreated'))
  } catch (error) {
    console.error('Fehler beim PDF-Export:', error)
    toast.error(t('errors.creatingPdf'))
  }
}

</script>
