<template>
  <div class="organization-chart">
    <div class="chart-header">
      <div>
        <h2>{{ t('nav.organization') }}</h2>
        <p class="description">
          Überblick über die Organisationsstruktur und Team-Zuordnungen.
        </p>
      </div>
      <div class="export-buttons">
        <button @click="exportOrgChart" class="btn-pdf">
          📄 Organigramm als PDF
        </button>
        <button @click="exportTeamOverview" class="btn-pdf">
          📄 Teamübersicht als PDF
        </button>
      </div>
    </div>

    <!-- 1. Team-Verwaltung (OBEN) -->
    <div class="teams-overview">
      <div class="section-header" @click="toggleTeamsSection">
        <div class="header-left">
          <span class="toggle-icon">{{ showTeamsSection ? '▼' : '▶' }}</span>
          <h3>Team-Verwaltung</h3>
          <span class="count-badge">{{ teams?.length || 0 }} Teams</span>
        </div>
        <span class="description-collapsed" v-if="!showTeamsSection">
          Mitarbeiter den Teams zuordnen
        </span>
      </div>
      
      <div v-show="showTeamsSection" class="section-content">
        <div class="teams-grid">
        <div v-for="team in teams || []" :key="team.teamleadId" class="team-card">
          <div class="team-header">
            <h4>👥 Team {{ team.teamleadName }}</h4>
            <span class="team-count">{{ team.members?.length || 0 }} {{ t('roles.employee') }}</span>
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
    </div>

    <!-- 2. Organigramm (UNTEN - EINKLAPPBAR) -->
    <div class="org-tree-section">
      <div class="section-header" @click="toggleOrgTree">
        <div class="header-left">
          <span class="toggle-icon">{{ showOrgTree ? '▼' : '▶' }}</span>
          <h3>Organigramm</h3>
        </div>
        <span class="description-collapsed" v-if="!showOrgTree">
          Grafische Darstellung der Organisationsstruktur
        </span>
      </div>

      <div v-show="showOrgTree" class="section-content">
        <div ref="orgTreeRef" class="org-tree">
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
            <!-- Office (kann mehrere sein) -->
            <div v-for="office in officeUsers" :key="office.userId" class="org-node office">
              <div class="node-header">
                <div class="node-icon">📋</div>
                <div class="node-info">
                  <div class="node-name">{{ office.displayName }}</div>
                  <div class="node-role">Office</div>
                </div>
              </div>
            </div>

            <!-- Teamleads -->
            <div v-for="teamlead in teamleads" :key="teamlead.userId" class="org-node teamlead">
              <div class="node-header">
                <div class="node-icon">👨‍💼</div>
                <div class="node-info">
                  <div class="node-name">{{ teamlead.displayName }}</div>
                  <div class="node-role">Teamleiter</div>
                </div>
              </div>

              <!-- Mitarbeiter des Teams -->
              <div v-if="teamlead.teamMembers && teamlead.teamMembers.length > 0" class="team-members-tree">
                <div class="org-connector-vertical-small"></div>
                <div class="employees-level">
                  <div v-for="employee in teamlead.teamMembers" :key="employee.userId" class="org-node employee">
                    <div class="node-header">
                      <div class="node-icon">👤</div>
                      <div class="node-info">
                        <div class="node-name">{{ employee.displayName }}</div>
                        <div class="node-role">{{ t('roles.employee') }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sysadmin (kann mehrere sein) -->
            <div v-for="sysadmin in sysadminUsers" :key="sysadmin.userId" class="org-node sysadmin">
              <div class="node-header">
                <div class="node-icon">⚙️</div>
                <div class="node-info">
                  <div class="node-name">{{ sysadmin.displayName }}</div>
                  <div class="node-role">Sysadmin</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Nicht zugeordnete Mitarbeiter -->
          <div v-if="unassignedEmployees.length > 0" class="unassigned-section">
            <h4>⚠️ Nicht zugeordnete Mitarbeiter</h4>
            <div class="unassigned-list">
              <div v-for="employee in unassignedEmployees" :key="employee.userId" class="org-node employee unassigned">
                <div class="node-header">
                  <div class="node-icon">👤</div>
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
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

const props = defineProps<{
  organization: any
  isEditable?: boolean
}>()

const emit = defineEmits(['remove-from-team'])

// State
const showTeamsSection = ref(false)  // Standard eingeklappt
const showOrgTree = ref(false)       // Standard eingeklappt
const orgTreeRef = ref<HTMLElement | null>(null)

// Toggle Functions
const toggleTeamsSection = () => {
  showTeamsSection.value = !showTeamsSection.value
}

const toggleOrgTree = () => {
  showOrgTree.value = !showOrgTree.value
}

// Computed
const managers = computed(() => props.organization?.managers || [])
const teamleads = computed(() => props.organization?.teamleads || [])
const officeUsers = computed(() => props.organization?.officeUsers || [])
const sysadminUsers = computed(() => props.organization?.sysadminUsers || [])
const unassignedEmployees = computed(() => props.organization?.unassignedEmployees || [])
const teams = computed(() => props.organization?.teams || [])

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

// PDF Export Functions
const exportOrgChart = async () => {
  toast.info('PDF-Export wird vorbereitet...')
  
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Organigramm', 148, 20, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Erstellt am: ' + new Date().toLocaleDateString('de-DE'), 148, 28, { align: 'center' })
    
    let y = 45
    
    // Manager
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Manager', 20, y)
    y += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    managers.value.forEach((m: any) => {
      doc.text('- ' + m.displayName, 25, y)
      y += 6
    })
    y += 5
    
    // Teams
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Teams', 20, y)
    y += 8
    
    doc.setFontSize(10)
    teamleads.value.forEach((tl: any) => {
      doc.setFont('helvetica', 'bold')
      doc.text('Team ' + tl.displayName + ':', 25, y)
      y += 6
      
      doc.setFont('helvetica', 'normal')
      if (tl.teamMembers && tl.teamMembers.length > 0) {
        tl.teamMembers.forEach((emp: any) => {
          doc.text('  - ' + emp.displayName, 30, y)
          y += 5
        })
      } else {
        doc.text('  (Keine Mitarbeiter)', 30, y)
        y += 5
      }
      y += 3
    })
    
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000)
    
    toast.success('PDF erfolgreich erstellt')
  } catch (error) {
    console.error('Fehler beim PDF-Export:', error)
    toast.error('Fehler beim PDF-Export')
  }
}

const exportTeamOverview = async () => {
  toast.info('Teamübersicht wird erstellt...')
  
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Teamübersicht', 105, 20, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Erstellt am: ' + new Date().toLocaleDateString('de-DE'), 105, 28, { align: 'center' })
    
    let y = 45
    
    teams.value.forEach((team: any) => {
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Team ' + team.teamleadName, 20, y)
      y += 8
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      if (team.members && team.members.length > 0) {
        team.members.forEach((memberId: string) => {
          doc.text('- ' + getDisplayName(memberId), 25, y)
          y += 6
        })
      } else {
        doc.text('(Keine Mitarbeiter)', 25, y)
        y += 6
      }
      
      y += 10
    })
    
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000)
    
    toast.success('PDF erfolgreich erstellt')
  } catch (error) {
    console.error('Fehler beim PDF-Export:', error)
    toast.error('Fehler beim PDF-Export')
  }
}
</script>
