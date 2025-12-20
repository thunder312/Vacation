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

    <!-- Organigramm Baum -->
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

        <!-- System-Admin -->
        <div v-if="sysadminUser" class="org-node sysadmin">
          <div class="node-header">
            <div class="node-icon">🔧</div>
            <div class="node-info">
              <div class="node-name">{{ sysadminUser.displayName }}</div>
              <div class="node-role">System-Admin</div>
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
                <div class="node-role"> {{ t('users.teamlead') }}</div>
              </div>
            </div>
            <div class="node-actions">
              {{ getTeamMemberCount(teamlead.userId) }} {{ t('roles.employee') }}
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
                    <div class="node-role">{{ t('roles.employee') }}</div>
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
            <label>{{ t('roles.employee') }}</label>
            <select v-model="selectedEmployee">
              <option value="">Mitarbeiter wählen...</option>
              <option v-for="emp in allEmployees" :key="emp.userId" :value="emp.userId">
                {{ emp.displayName }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label> {{ t('users.teamlead') }}</label>
            <select v-model="selectedTeamlead">
              <option value=""> {{ t('users.teamleadSelect') }}</option>
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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import { branding, getPdfHeader } from '~/config/branding'

const toast = useToast()
const { t } = useI18n()
const { currentUser } = useAuth()
const { 
  assignToTeam, 
  removeFromTeam,
  getUnassignedEmployees,
  getTeamleads,
  getAllEmployees,
  orgNodes,
  fetchOrganization
} = useOrganization()

// Daten beim Mounting laden
onMounted(() => {
  fetchOrganization()
})

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

const sysadminUser = computed(() => {
  return orgNodes.value?.find(n => n.role === 'sysadmin')
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

// Refs
const orgTreeRef = ref<HTMLElement | null>(null)

// PDF Export: Organigramm
const exportOrgChart = async () => {
  if (!orgTreeRef.value) {
    toast.error('Organigramm konnte nicht gefunden werden')
    return
  }
  
  try {
    toast.info('PDF wird erstellt...')
    
    // Organigramm als Canvas rendern
    const canvas = await html2canvas(orgTreeRef.value, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    })
    
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    
    // PDF im Querformat erstellen
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4', unit: 'px' })
    
    const pdfWidth = doc.internal.pageSize.getWidth()
    const pdfHeight = doc.internal.pageSize.getHeight()
    
    // Bild skalieren um ins PDF zu passen
    const ratio = Math.min(
      (pdfWidth - 40) / imgWidth,
      (pdfHeight - 80) / imgHeight
    )
    
    const scaledWidth = imgWidth * ratio
    const scaledHeight = imgHeight * ratio
    
    // Zentrieren
    const xOffset = (pdfWidth - scaledWidth) / 2
    const yOffset = 50
    
    // Logo
    const pdfHeader = getPdfHeader()
    try {
      doc.addImage(pdfHeader.logo, 'PNG', pdfWidth - 50, 10, pdfHeader.logoWidth, pdfHeader.logoHeight)
    } catch (error) {
      console.warn('Logo konnte nicht geladen werden')
    }
    
    // Titel
    doc.setFontSize(18)
    doc.text(t('nav.organization')  + `- ${branding.company.name}`, 20, 25)
    
    doc.setFontSize(11)
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, 35)
    
    // Organigramm-Bild
    doc.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight)
    
    // Seitenzahl
    doc.setFontSize(9)
    doc.setTextColor(128, 128, 128)
    const pageText = 'Seite 1/1'
    const textWidth = doc.getTextWidth(pageText)
    doc.text(pageText, (pdfWidth - textWidth) / 2, pdfHeight - 10)
    
    // PDF in neuem Tab öffnen
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, '_blank')
    
    toast.success('Organigramm-PDF erfolgreich erstellt!')
  } catch (error) {
    console.error('Fehler beim PDF-Export:', error)
    toast.error('Fehler beim PDF-Export')
  }
}

// PDF Export: Teamübersicht
const exportTeamOverview = () => {
  try {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' })
    
    // Logo
    const pdfHeader = getPdfHeader()
    try {
      doc.addImage(pdfHeader.logo, 'PNG', 260, 10, pdfHeader.logoWidth, pdfHeader.logoHeight)
    } catch (error) {
      console.warn('Logo konnte nicht geladen werden')
    }
    
    doc.setFontSize(18)
    doc.text(`Teamübersicht - ${branding.company.name}`, 14, 20)
    
    doc.setFontSize(11)
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 28)
    
    let currentY = 40
    
    // Für jeden Teamleiter eine Sektion
    for (const teamlead of teamleads.value) {
      const teamMembers = getTeamEmployees(teamlead.userId)
      
      // Team Header
      doc.setFontSize(14)
      doc.setFont('arial', 'bold')
      doc.text(`Team: ${teamlead.displayName}`, 14, currentY)
      doc.setFont('arial', 'normal')
      doc.setFontSize(10)
      
      currentY += 8
      
      // Team-Mitglieder Tabelle
      const teamData = teamMembers.map(e => [
        e.displayName,
        e.username,
        t('roles.employee')
      ])
      
      autoTable(doc, {
        startY: currentY,
        head: [[t('users.name'), t('users.username'), t('users.role')]],
        body: teamData,
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] },
        styles: { fontSize: 10, cellPadding: 3 },
        margin: { left: 20 }
      })
      
      currentY = (doc as any).lastAutoTable.finalY + 15
      
      // Neue Seite wenn nicht mehr genug Platz
      if (currentY > 170) {
        doc.addPage()
        currentY = 20
      }
    }
    
    // Nicht zugeordnete Mitarbeiter
    const unassigned = unassignedEmployees.value
    if (unassigned.length > 0) {
      doc.setFontSize(14)
      doc.setFont('arial', 'bold')
      doc.text('Nicht zugeordnete Mitarbeiter', 14, currentY)
      doc.setFont('arial', 'normal')
      doc.setFontSize(10)
      
      currentY += 8
      
      const unassignedData = unassigned.map(e => [
        e.displayName,
        e.username,
        t('roles.employee')
      ])
      
      autoTable(doc, {
        startY: currentY,
        head: [[t('users.name'), t('users.username'), t('users.role')]],
        body: unassignedData,
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] },
        styles: { fontSize: 10, cellPadding: 3 },
        margin: { left: 20 }
      })
    }
    
    // Seitenzahlen
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(128, 128, 128)
      const pageText = `Seite ${i}/${pageCount}`
      const pageWidth = doc.internal.pageSize.getWidth()
      const textWidth = doc.getTextWidth(pageText)
      doc.text(pageText, (pageWidth - textWidth) / 2, doc.internal.pageSize.getHeight() - 10)
    }
    
    // PDF in neuem Tab öffnen
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, '_blank')
    
    toast.success('Teamübersicht-PDF erfolgreich erstellt!')
  } catch (error) {
    console.error('Fehler beim PDF-Export:', error)
    toast.error('Fehler beim PDF-Export')
  }
}

</script>
