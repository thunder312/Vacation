<template>
  <div class="organization-chart">
    <h2>Organigramm</h2>
    <p class="description">
      Überblick über die Organisationsstruktur und Team-Zuordnungen.
    </p>

    <!-- Organigramm Baum -->
    <div class="org-tree">
      <!-- Manager-Ebene -->
      <div class="manager-level">
        <div v-for="manager in managers" :key="manager.userId" class="org-node manager">
          <div class="node-header">
            <div class="node-icon">👔</div>
            <div class="node-info">
              <div class="node-name">{{ manager.displayName }}</div>
              <div class="node-role">Manager</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Verbindungslinie -->
      <div class="org-connector-vertical"></div>

      <!-- Teamlead & Office Ebene -->
      <div class="teamlead-level">
        <!-- Office -->
        <div v-if="officeUser" class="org-node office">
          <div class="node-header">
            <div class="node-icon">📋</div>
            <div class="node-info">
              <div class="node-name">{{ officeUser.displayName }}</div>
              <div class="node-role">Office</div>
            </div>
          </div>
        </div>

        <!-- Teamleads -->
        <div v-for="teamlead in teamleads" :key="teamlead.userId" class="teamlead-container">
          <div class="org-node teamlead">
            <div class="node-header">
              <div class="node-icon">👥</div>
              <div class="node-info">
                <div class="node-name">{{ teamlead.displayName }}</div>
                <div class="node-role">Teamleiter</div>
              </div>
            </div>
            <div class="node-actions">
              {{ getTeamMemberCount(teamlead.userId) }} Mitarbeiter
            </div>
          </div>

          <!-- Mitarbeiter des Teams -->
          <div class="employee-level">
            <div class="org-connector-vertical-short"></div>
            <div class="employees-container">
              <div 
                v-for="employee in getTeamEmployees(teamlead.userId)" 
                :key="employee.userId" 
                class="org-node employee"
              >
                <div class="node-header">
                  <div class="node-icon">👤</div>
                  <div class="node-info">
                    <div class="node-name">{{ employee.displayName }}</div>
                    <div class="node-role">Mitarbeiter</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Team-Übersicht -->
    <div class="teams-overview">
      <h3>Team-Übersicht</h3>
      <div class="teams-grid">
        <div v-for="team in teams || []" :key="team.teamleadId" class="team-card">
          <div class="team-header">
            <h4>👥 Team {{ team.teamleadName }}</h4>
            <span class="team-count">{{ team.members?.length || 0 }} Mitarbeiter</span>
          </div>
          <div class="team-members">
            <div v-if="!team.members || team.members.length === 0" class="empty-team">
              Keine Mitarbeiter zugeordnet
            </div>
            <div v-for="memberId in team.members || []" :key="memberId" class="member-item">
              {{ getDisplayName(memberId) }}
              <button 
                v-if="isEditable" 
                @click="handleRemove(memberId)" 
                class="remove-btn"
                title="Aus Team entfernen"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Nicht zugeordnete Mitarbeiter (nur im Edit-Modus) -->
    <div v-if="isEditable && unassignedEmployees && unassignedEmployees.length > 0" class="unassigned-section">
      <h3>⚠️ Nicht zugeordnete Mitarbeiter</h3>
      <div class="unassigned-list">
        <div v-for="emp in unassignedEmployees" :key="emp.userId" class="unassigned-item">
          <span>{{ emp.displayName }}</span>
          <select @change="handleAssignFromDropdown($event, emp.userId)" class="assign-select">
            <option value="">Team zuordnen...</option>
            <option v-for="tl in teamleads" :key="tl.userId" :value="tl.userId">
              Team {{ tl.displayName }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Team-Verwaltung (nur für Manager/Admin) -->
    <div v-if="isEditable" class="team-management">
      <h3>Team-Verwaltung</h3>
      <div class="management-form">
        <div class="form-row">
          <div class="form-group">
            <label>Mitarbeiter</label>
            <select v-model="selectedEmployee">
              <option value="">Mitarbeiter wählen...</option>
              <option v-for="emp in allEmployees" :key="emp.userId" :value="emp.userId">
                {{ emp.displayName }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Teamleiter</label>
            <select v-model="selectedTeamlead">
              <option value="">Teamleiter wählen...</option>
              <option v-for="tl in teamleads" :key="tl.userId" :value="tl.userId">
                {{ tl.displayName }}
              </option>
            </select>
          </div>
        </div>
        <button 
          @click="handleAssignManual" 
          :disabled="!selectedEmployee || !selectedTeamlead"
          class="btn-primary"
        >
          Zuordnung speichern
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { currentUser } = useAuth()
const { 
  assignToTeam, 
  removeFromTeam,
  getUnassignedEmployees,
  getTeamleads,
  getAllEmployees,
  orgNodes
} = useOrganization()

const unassignedEmployees = getUnassignedEmployees
const teamleads = getTeamleads
const allEmployees = getAllEmployees

const selectedEmployee = ref('')
const selectedTeamlead = ref('')

// Manager-Nodes (nur Stefan Schulz, nicht admin)
const managers = computed(() => {
  return orgNodes.value?.filter(n => n.role === 'manager' && n.userId !== 'admin') || []
})

// Office-User
const officeUser = computed(() => {
  return orgNodes.value?.find(n => n.role === 'office')
})

// Alle Teams mit Info
const teams = computed(() => {
  return teamleads.value?.map(tl => ({
    teamleadId: tl.userId,
    teamleadName: tl.displayName,
    members: orgNodes.value?.filter(n => n.teamId === tl.userId).map(n => n.userId) || []
  })) || []
})

// Mitarbeiter eines bestimmten Teams
const getTeamEmployees = (teamleadId: string) => {
  return orgNodes.value?.filter(n => n.teamId === teamleadId) || []
}

// Anzahl Mitarbeiter im Team
const getTeamMemberCount = (teamleadId: string) => {
  const employees = getTeamEmployees(teamleadId)
  return employees?.length || 0
}

// Nur Manager und Admin können bearbeiten
const isEditable = computed(() => {
  return currentUser.value?.role === 'manager'
})

const getDisplayName = (userId: string) => {
  const node = orgNodes.value?.find(n => n.userId === userId)
  return node?.displayName || userId
}

const handleAssign = async (userId: string, teamleadId: string) => {
  await assignToTeam(userId, teamleadId)
}

const handleRemove = async (userId: string) => {
  if (confirm('Mitarbeiter aus Team entfernen?')) {
    await removeFromTeam(userId)
  }
}

const handleAssignFromDropdown = async (event: Event, userId: string) => {
  const target = event.target as HTMLSelectElement
  const teamleadId = target.value
  if (teamleadId) {
    await assignToTeam(userId, teamleadId)
    target.value = ''
  }
}

const handleAssignManual = () => {
  if (selectedEmployee.value && selectedTeamlead.value) {
    assignToTeam(selectedEmployee.value, selectedTeamlead.value)
    selectedEmployee.value = ''
    selectedTeamlead.value = ''
  }
}
</script>
