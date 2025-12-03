<template>
  <div class="vacation-container">
    <div class="header">
      <h1>Urlaubsantrags-System</h1>
      <div class="user-info">
        <span>Angemeldet als: <strong>{{ currentUser }}</strong></span>
        <button @click="logout" class="logout-btn">Abmelden</button>
      </div>
    </div>

    <div class="tabs">
      <button
          v-for="tab in visibleTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab', { active: activeTab === tab.id }]"
      >
        {{ tab.label }}
        <span v-if="tab.count > 0" class="badge">{{ tab.count }}</span>
      </button>
    </div>

    <div class="content">
      <div v-show="activeTab === 'antrag'" class="tab-content">
        <h2>Neuer Urlaubsantrag</h2>
        <form @submit.prevent="submitRequest" class="request-form">
          <div class="form-row">
            <div class="form-group">
              <label>Von</label>
              <input v-model="newRequest.startDate" type="date" required />
            </div>
            <div class="form-group">
              <label>Bis</label>
              <input v-model="newRequest.endDate" type="date" required />
            </div>
          </div>

          <div class="form-group">
            <label>Grund / Bemerkung</label>
            <textarea v-model="newRequest.reason" rows="3" placeholder="Optional"></textarea>
          </div>

          <button type="submit" class="submit-btn">Antrag einreichen</button>
        </form>

        <div class="pdf-export-section">
          <h3>Genehmigte Urlaube exportieren</h3>
          <button
              @click="exportMyApprovedVacations"
              class="btn-pdf"
              :disabled="approvedUserRequests.length === 0"
          >
            📄 Als PDF exportieren
          </button>
        </div>

        <div class="requests-list">
          <h3>Meine Anträge</h3>
          <div v-if="userRequests.length === 0" class="empty-state">
            Keine Anträge vorhanden
          </div>
          <div v-for="req in userRequests" :key="req.id" class="request-card">
            <div class="request-header">
              <span class="request-date">{{ formatDate(req.startDate) }} - {{ formatDate(req.endDate) }}</span>
              <span :class="['status', req.status]">{{ getStatusText(req.status) }}</span>
            </div>
            <p v-if="req.reason" class="request-reason">{{ req.reason }}</p>
            <div class="request-footer">
              <small>Tage: {{ calculateDays(req.startDate, req.endDate) }}</small>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'teamleiter'" class="tab-content">
        <h2>Anträge zur 1. Genehmigung</h2>

        <div class="pdf-export-section">
          <h3>Team-Urlaube exportieren</h3>
          <button
              @click="exportTeamVacations"
              class="btn-pdf"
          >
            📄 Als PDF exportieren
          </button>
        </div>

        <div v-if="pendingTeamleiterRequests.length === 0" class="empty-state">
          Keine Anträge zur Genehmigung
        </div>
        <div v-for="req in pendingTeamleiterRequests" :key="req.id" class="request-card approval">
          <div class="request-header">
            <div>
              <strong>{{ req.user }}</strong>
              <span class="request-date">{{ formatDate(req.startDate) }} - {{ formatDate(req.endDate) }}</span>
            </div>
            <span :class="['status', req.status]">{{ getStatusText(req.status) }}</span>
          </div>
          <p v-if="req.reason" class="request-reason">{{ req.reason }}</p>
          <div class="request-footer">
            <small>Tage: {{ calculateDays(req.startDate, req.endDate) }}</small>
          </div>
          <div class="approval-actions">
            <button @click="approveRequest(req.id, 'teamleiter')" class="approve-btn">
              ✓ Genehmigen
            </button>
            <button @click="rejectRequest(req.id, 'teamleiter')" class="reject-btn">
              ✗ Ablehnen
            </button>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'chef'" class="tab-content">
        <h2>Anträge zur 2. Genehmigung</h2>

        <div class="pdf-export-section">
          <h3>Alle Urlaube exportieren</h3>
          <button
              @click="exportAllVacations"
              class="btn-pdf"
          >
            📄 Als PDF exportieren
          </button>
        </div>

        <div v-if="pendingChefRequests.length === 0" class="empty-state">
          Keine Anträge zur Genehmigung
        </div>
        <div v-for="req in pendingChefRequests" :key="req.id" class="request-card approval">
          <div class="request-header">
            <div>
              <strong>{{ req.user }}</strong>
              <span class="request-date">{{ formatDate(req.startDate) }} - {{ formatDate(req.endDate) }}</span>
            </div>
            <span :class="['status', req.status]">{{ getStatusText(req.status) }}</span>
          </div>
          <p v-if="req.reason" class="request-reason">{{ req.reason }}</p>
          <div class="approval-info">
            <small>✓ Genehmigt von Teamleiter am {{ formatDate(req.teamleiterApprovalDate) }}</small>
          </div>
          <div class="request-footer">
            <small>Tage: {{ calculateDays(req.startDate, req.endDate) }}</small>
          </div>
          <div class="approval-actions">
            <button @click="approveRequest(req.id, 'chef')" class="approve-btn">
              ✓ Genehmigen
            </button>
            <button @click="rejectRequest(req.id, 'chef')" class="reject-btn">
              ✗ Ablehnen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface VacationRequest {
  id: number
  user: string
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'teamleiter_approved' | 'approved' | 'rejected'
  teamleiterApprovalDate?: string
  chefApprovalDate?: string
}

const route = useRoute()
const currentUser = ref((route.query.user as string) || 'Benutzer')
const userRole = ref((route.query.role as string) || 'employee')

const activeTab = ref('antrag')

const newRequest = ref({
  startDate: '',
  endDate: '',
  reason: ''
})

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

const visibleTabs = computed(() => {
  const tabs = [
    { id: 'antrag', label: 'Mein Antrag', count: 0 }
  ]

  if (userRole.value === 'teamleiter' || userRole.value === 'chef') {
    tabs.push({
      id: 'teamleiter',
      label: 'Teamleiter',
      count: pendingTeamleiterRequests.value.length
    })
  }

  if (userRole.value === 'chef') {
    tabs.push({
      id: 'chef',
      label: 'Chef',
      count: pendingChefRequests.value.length
    })
  }

  return tabs
})

const userRequests = computed(() => {
  return requests.value.filter(r => r.user === currentUser.value)
})

const approvedUserRequests = computed(() => {
  return requests.value.filter(r => r.user === currentUser.value && r.status === 'approved')
})

const pendingTeamleiterRequests = computed(() => {
  return requests.value.filter(r => r.status === 'pending')
})

const pendingChefRequests = computed(() => {
  return requests.value.filter(r => r.status === 'teamleiter_approved')
})

const allTeamRequests = computed(() => {
  // Für Teamleiter: Alle Anfragen außer eigene
  return requests.value.filter(r => r.user !== currentUser.value)
})

const allRequests = computed(() => {
  // Für Chef: Alle Anfragen
  return requests.value
})

const submitRequest = () => {
  const request: VacationRequest = {
    id: Date.now(),
    user: currentUser.value,
    startDate: newRequest.value.startDate,
    endDate: newRequest.value.endDate,
    reason: newRequest.value.reason,
    status: 'pending'
  }

  requests.value.push(request)

  newRequest.value = {
    startDate: '',
    endDate: '',
    reason: ''
  }

  alert('Antrag erfolgreich eingereicht!')
}

const approveRequest = (id: number, level: 'teamleiter' | 'chef') => {
  const request = requests.value.find(r => r.id === id)
  if (!request) return

  if (level === 'teamleiter') {
    request.status = 'teamleiter_approved'
    request.teamleiterApprovalDate = new Date().toISOString().split('T')[0]
  } else {
    request.status = 'approved'
    request.chefApprovalDate = new Date().toISOString().split('T')[0]
  }

  alert('Antrag genehmigt!')
}

const rejectRequest = (id: number, level: string) => {
  const request = requests.value.find(r => r.id === id)
  if (!request) return

  request.status = 'rejected'
  alert('Antrag abgelehnt!')
}

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const calculateDays = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'Ausstehend',
    teamleiter_approved: 'Teamleiter ✓',
    approved: 'Genehmigt ✓✓',
    rejected: 'Abgelehnt'
  }
  return statusMap[status] || status
}

const logout = () => {
  navigateTo('/login')
}

// PDF Export Funktionen
const exportMyApprovedVacations = () => {
  console.log('Export gestartet...')
  console.log('Genehmigte Anträge:', approvedUserRequests.value.length)

  if (approvedUserRequests.value.length === 0) {
    alert('Keine genehmigten Urlaube vorhanden')
    return
  }

  try {
    console.log('Erstelle jsPDF...')
    const doc = new jsPDF()
    console.log('jsPDF erstellt:', doc)

    // Titel
    doc.setFontSize(18)
    doc.text('Meine genehmigten Urlaube', 14, 20)

    // Benutzer Info
    doc.setFontSize(11)
    doc.text(`Mitarbeiter: ${currentUser.value}`, 14, 30)
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 36)

    console.log('Erstelle Tabellendaten...')
    // Tabelle
    const tableData: string[][] = approvedUserRequests.value.map(req => [
      formatDate(req.startDate),
      formatDate(req.endDate),
      calculateDays(req.startDate, req.endDate).toString(),
      req.reason || '-',
      getStatusText(req.status)
    ])

    console.log('Tabellendaten:', tableData)
    console.log('Rufe autoTable auf...')

    (doc as any).autoTable({
      startY: 45,
      head: [['Von', 'Bis', 'Tage', 'Grund', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234] },
      styles: { fontSize: 10, cellPadding: 3 }
    })

    console.log('autoTable fertig')

    // Gesamtstatistik
    const totalDays = approvedUserRequests.value.reduce((sum, req) =>
        sum + calculateDays(req.startDate, req.endDate), 0
    )

    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(11)
    doc.text(`Gesamt genehmigte Urlaubstage: ${totalDays}`, 14, finalY)

    console.log('Speichere PDF...')
    const filename = `Urlaube_${currentUser.value}_${new Date().toISOString().split('T')[0]}.pdf`
    console.log('Dateiname:', filename)
    doc.save(filename)
    console.log('PDF gespeichert!')

  } catch (error) {
    console.error('Fehler beim PDF-Export:', error)
    alert('Fehler beim PDF-Export: ' + error)
  }
}

const exportTeamVacations = () => {
  const doc = new jsPDF()

  // Titel
  doc.setFontSize(18)
  doc.text('Team-Urlaubsübersicht', 14, 20)

  // Info
  doc.setFontSize(11)
  doc.text(`Teamleiter: ${currentUser.value}`, 14, 30)
  doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 36)

  // Tabelle mit allen Team-Urlauben
  const tableData = allTeamRequests.value.map(req => [
    req.user,
    formatDate(req.startDate),
    formatDate(req.endDate),
    calculateDays(req.startDate, req.endDate).toString(),
    req.reason || '-',
    getStatusText(req.status)
  ])

  (doc as any).autoTable({
    startY: 45,
    head: [['Mitarbeiter', 'Von', 'Bis', 'Tage', 'Grund', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234] },
    styles: { fontSize: 9, cellPadding: 2 }
  })

  // Statistik
  const approvedCount = allTeamRequests.value.filter(r => r.status === 'approved').length
  const pendingCount = allTeamRequests.value.filter(r => r.status === 'pending').length

  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(10)
  doc.text(`Gesamt Anträge: ${allTeamRequests.value.length}`, 14, finalY)
  doc.text(`Genehmigt: ${approvedCount}`, 14, finalY + 6)
  doc.text(`Ausstehend: ${pendingCount}`, 14, finalY + 12)

  doc.save(`Team_Urlaube_${new Date().toISOString().split('T')[0]}.pdf`)
}

const exportAllVacations = () => {
  const doc = new jsPDF()

  // Titel
  doc.setFontSize(18)
  doc.text('Urlaubsübersicht - Gesamtunternehmen', 14, 20)

  // Info
  doc.setFontSize(11)
  doc.text(`Erstellt von: ${currentUser.value} (Chef)`, 14, 30)
  doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 36)

  // Tabelle mit allen Urlauben
  const tableData = allRequests.value.map(req => [
    req.user,
    formatDate(req.startDate),
    formatDate(req.endDate),
    calculateDays(req.startDate, req.endDate).toString(),
    req.reason || '-',
    getStatusText(req.status)
  ])

  (doc as any).autoTable({
    startY: 45,
    head: [['Mitarbeiter', 'Von', 'Bis', 'Tage', 'Grund', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234] },
    styles: { fontSize: 9, cellPadding: 2 }
  })

  // Detaillierte Statistik
  const totalRequests = allRequests.value.length
  const approvedCount = allRequests.value.filter(r => r.status === 'approved').length
  const teamleiterApprovedCount = allRequests.value.filter(r => r.status === 'teamleiter_approved').length
  const pendingCount = allRequests.value.filter(r => r.status === 'pending').length
  const rejectedCount = allRequests.value.filter(r => r.status === 'rejected').length

  const totalApprovedDays = allRequests.value
      .filter(r => r.status === 'approved')
      .reduce((sum, req) => sum + calculateDays(req.startDate, req.endDate), 0)

  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text('Statistik:', 14, finalY)
  doc.setFont(undefined, 'normal')
  doc.text(`Gesamt Anträge: ${totalRequests}`, 14, finalY + 6)
  doc.text(`Vollständig genehmigt: ${approvedCount}`, 14, finalY + 12)
  doc.text(`Bei Chef ausstehend: ${teamleiterApprovedCount}`, 14, finalY + 18)
  doc.text(`Bei Teamleiter ausstehend: ${pendingCount}`, 14, finalY + 24)
  doc.text(`Abgelehnt: ${rejectedCount}`, 14, finalY + 30)
  doc.text(`Genehmigte Urlaubstage gesamt: ${totalApprovedDays}`, 14, finalY + 36)

  doc.save(`Alle_Urlaube_${new Date().toISOString().split('T')[0]}.pdf`)
}
</script>
