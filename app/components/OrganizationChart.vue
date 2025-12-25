<template>
  <div class="organization-chart">
    <div class="chart-header">
      <div>
        <h2>{{ t('nav.organization') }}</h2>
        <p class="description">{{ t('organization.description') }}</p>
      </div>
      <div class="export-buttons">
        <button @click="exportOrgChart" class="btn-pdf">📄 {{ t('organization.exportOrgChart') }}</button>
        <button @click="exportTeamOverview" class="btn-pdf">📄 {{ t('organization.exportTeamOverview') }}</button>
      </div>
    </div>

    <div class="teams-overview">
      <div class="section-header" @click="toggleTeamsSection">
        <div class="header-left">
          <span class="toggle-icon">{{ showTeamsSection ? '▼' : '▶' }}</span>
          <h3>{{ t('organization.teamManagement') }}</h3>
          <span class="count-badge">{{ teams?.length || 0 }} {{ t('organization.teams') }}</span>
        </div>
        <span class="description-collapsed" v-if="!showTeamsSection">
          {{ t('organization.assignEmployeesToTeams') }}
        </span>
      </div>
      
      <div v-show="showTeamsSection" class="section-content">
        <div ref="teamsGridRef" class="teams-grid">
        <div v-for="team in teams || []" :key="team.teamleadId" class="team-card">
          <div class="team-header">
            <h4>👥 Team {{ team.teamleadName }}</h4>
            <span class="team-count">{{ team.members?.length || 0 }} {{ t('roles.employee') }}</span>
          </div>
          <div class="team-members">
            <div v-if="!team.members || team.members.length === 0" class="empty-team">
              {{ t('organization.noEmployeesAssigned') }}
            </div>
            <div v-for="memberId in team.members || []" :key="memberId" class="member-item">
              {{ getDisplayName(memberId) }}
              <button 
                v-if="isEditable" 
                @click="handleRemove(memberId)" 
                class="remove-btn"
                :title="t('organization.removeFromTeam')"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>

    <div class="org-tree-section">
      <div class="section-header" @click="toggleOrgTree">
        <div class="header-left">
          <span class="toggle-icon">{{ showOrgTree ? '▼' : '▶' }}</span>
          <h3>{{ t('organization.orgChart') }}</h3>
        </div>
        <span class="description-collapsed" v-if="!showOrgTree">
          {{ t('organization.graphicalRepresentation') }}
        </span>
      </div>

      <div v-show="showOrgTree" class="section-content">
        <div ref="orgTreeRef" class="org-tree">
          <div class="manager-level">
            <div v-for="manager in managers" :key="manager.userId" class="org-node manager">
              <div class="node-header">
                <div class="node-icon">👔</div>
                <div class="node-info">
                  <div class="node-name">{{ manager.displayName }}</div>
                  <div class="node-role">{{ t('roles.manager') }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="org-connector-vertical"></div>

          <div class="teamlead-level">
            <div v-for="office in officeUsers" :key="office.userId" class="org-node office">
              <div class="node-header">
                <div class="node-icon">📋</div>
                <div class="node-info">
                  <div class="node-name">{{ office.displayName }}</div>
                  <div class="node-role">{{ t('roles.office') }}</div>
                </div>
              </div>
            </div>

            <div v-for="teamlead in teamleads" :key="teamlead.userId" class="org-node teamlead">
              <div class="node-header">
                <div class="node-icon">👨‍💼</div>
                <div class="node-info">
                  <div class="node-name">{{ teamlead.displayName }}</div>
                  <div class="node-role">{{ t('roles.teamlead') }}</div>
                </div>
              </div>

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

            <div v-for="sysadmin in sysadminUsers" :key="sysadmin.userId" class="org-node sysadmin">
              <div class="node-header">
                <div class="node-icon">⚙️</div>
                <div class="node-info">
                  <div class="node-name">{{ sysadmin.displayName }}</div>
                  <div class="node-role">{{ t('roles.sysadmin') }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="unassignedEmployees.length > 0" class="unassigned-section">
            <h4>⚠️ {{ t('organization.unassignedEmployees') }}</h4>
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
  const nodes = orgNodes.value || []
  return {
    managers: nodes.filter(n => n.role === 'manager'),
    teamleads: nodes.filter(n => n.role === 'teamlead'),
    officeUsers: nodes.filter(n => n.role === 'office'),
    sysadminUsers: nodes.filter(n => n.role === 'sysadmin'),
    unassignedEmployees: nodes.filter(n => n.role === 'employee' && !n.teamId),
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
  // Füge teamMembers zu jedem Teamlead hinzu
  return tls.map(tl => ({
    ...tl,
    teamMembers: (orgNodes.value || []).filter(n => n.teamId === tl.userId)
  }))
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

  // Stelle sicher, dass das Organigramm sichtbar ist
  if (!showOrgTree.value) {
    showOrgTree.value = true
    await nextTick()
    // Warte kurz damit das CSS gerendert wird
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  toast.info(t('vacation.pdfGenerating'))
  
  try {
    // Importiere html2canvas
    const html2canvas = (await import('html2canvas')).default
    
    // Erstelle Screenshot vom Organigramm
    const canvas = await html2canvas(orgTreeRef.value, {
      scale: 2, // Höhere Auflösung
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    })
    
    const imgData = canvas.toDataURL('image/png')
    
    // Erstelle PDF
    const { jsPDF } = await import('jspdf')
    
    // Berechne Dimensionen
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = imgWidth / imgHeight
    
    // A4 Landscape: 297mm x 210mm
    const pdfWidth = 297
    const pdfHeight = 210
    const margin = 20
    
    let finalWidth = pdfWidth - (2 * margin)
    let finalHeight = finalWidth / ratio
    
    // Wenn zu hoch, an Höhe anpassen
    if (finalHeight > pdfHeight - (2 * margin)) {
      finalHeight = pdfHeight - (2 * margin)
      finalWidth = finalHeight * ratio
    }
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    // Titel
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Organigramm', pdfWidth / 2, 15, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Erstellt am: ' + new Date().toLocaleDateString('de-DE'), pdfWidth / 2, 22, { align: 'center' })
    
    // Bild zentriert einfügen
    const x = (pdfWidth - finalWidth) / 2
    const y = 30
    
    doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
    
    // PDF öffnen
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000)
    
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

  // Stelle sicher, dass die Team-Section sichtbar ist
  if (!showTeamsSection.value) {
    showTeamsSection.value = true
    await nextTick()
    // Warte kurz damit das CSS gerendert wird
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  toast.info(t('vacation.pdfGenerating'))
  
  try {
    // Importiere html2canvas
    const html2canvas = (await import('html2canvas')).default
    
    // Erstelle Screenshot von der Team-Grid
    const canvas = await html2canvas(teamsGridRef.value, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    })
    
    const imgData = canvas.toDataURL('image/png')
    
    // Erstelle PDF
    const { jsPDF } = await import('jspdf')
    
    // Berechne Dimensionen
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = imgWidth / imgHeight
    
    // A4 Portrait: 210mm x 297mm
    const pdfWidth = 210
    const pdfHeight = 297
    const margin = 15
    
    let finalWidth = pdfWidth - (2 * margin)
    let finalHeight = finalWidth / ratio
    
    // Mehrere Seiten wenn das Bild zu hoch ist
    const maxHeightPerPage = pdfHeight - 50
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Titel auf erster Seite
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Teamübersicht', pdfWidth / 2, 15, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Erstellt am: ' + new Date().toLocaleDateString('de-DE'), pdfWidth / 2, 22, { align: 'center' })
    
    // Statistik
    const totalTeams = teams.value.length
    const totalMembers = teams.value.reduce((sum: number, t: any) => sum + (t.members?.length || 0), 0)
    doc.setFontSize(9)
    doc.text(`${totalTeams} Teams | ${totalMembers} Mitarbeiter`, pdfWidth / 2, 28, { align: 'center' })
    
    // Wenn das Bild auf eine Seite passt
    if (finalHeight <= maxHeightPerPage) {
      const x = margin
      const y = 35
      doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
    } else {
      // Bild auf mehrere Seiten aufteilen
      let currentY = 0
      let pageNum = 0
      
      while (currentY < imgHeight) {
        if (pageNum > 0) {
          doc.addPage()
        }
        
        const sourceY = currentY
        const sourceHeight = Math.min(imgHeight - currentY, (maxHeightPerPage / finalHeight) * imgHeight)
        const destHeight = (sourceHeight / imgHeight) * finalHeight
        
        // Canvas-Ausschnitt erstellen
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = imgWidth
        tempCanvas.height = sourceHeight
        const tempCtx = tempCanvas.getContext('2d')
        
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight)
          const tempImgData = tempCanvas.toDataURL('image/png')
          
          const startY = pageNum === 0 ? 35 : 15
          doc.addImage(tempImgData, 'PNG', margin, startY, finalWidth, destHeight)
        }
        
        currentY += sourceHeight
        pageNum++
      }
    }
    
    // PDF öffnen
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000)
    
    toast.success(t('vacation.pdfCreated'))
  } catch (error) {
    console.error('Fehler beim PDF-Export:', error)
    toast.error(t('errors.creatingPdf'))
  }
}
</script>
