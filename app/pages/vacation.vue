<template>
  <div class="vacation-container">
    <ToastContainer />

    <div class="header">
      <h1>Urlaubsantrags-System</h1>
      <div class="user-info">
        <span>Angemeldet als: <strong>{{ currentUser?.displayName || 'Benutzer' }}</strong></span>
        <button @click="handleLogout" class="logout-btn">Abmelden</button>
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

      <!-- Theme Toggle Button -->
      <button @click="toggleTheme" class="theme-toggle" title="Farbschema wechseln">
        <span v-if="currentTheme === 'business'">☀️</span>
        <span v-else>💼</span>
      </button>
    </div>

    <div class="content">
      <!-- Tab 1: Antrag (für alle außer reine Leserechte) -->
      <div v-show="activeTab === 'antrag'" class="tab-content">
        <!-- Urlaubskonto-Anzeige -->
        <VacationBalanceCard v-if="userBalance" :balance="userBalance" />

        <VacationRequestForm @submit="handleSubmitRequest" />

        <div class="pdf-export-section">
          <h3>Genehmigte Urlaube exportieren</h3>
          <button
              @click="handleExportMyVacations"
              class="btn-pdf"
              :disabled="!approvedUserRequests || approvedUserRequests.length === 0"
          >
            📄 Als PDF exportieren
          </button>
        </div>

        <div class="requests-list">
          <h2>Meine Urlaubsanträge</h2>
          <div v-if="!userRequests || userRequests.length === 0" class="empty-state">
            Noch keine Urlaubsanträge vorhanden
          </div>
          <VacationRequestCard
              v-for="request in userRequests || []"
              :key="request.id"
              :request="request"
              :vacation-days="calculateVacationDays(request.startDate, request.endDate)"
          />
        </div>
      </div>

      <!-- Tab 2: Teamleiter (nur für teamleiter und chef) -->
      <div v-show="activeTab === 'teamlead'" class="tab-content">
        <h2>Urlaubsanträge zur Genehmigung (Teamleiter)</h2>

        <div class="pdf-export-section">
          <h3>Team-Urlaube exportieren</h3>
          <button @click="handleExportTeamVacations" class="btn-pdf">
            📄 Team-PDF exportieren
          </button>
        </div>

        <div v-if="!pendingTeamleadRequests || pendingTeamleadRequests.length === 0" class="empty-state">
          Keine ausstehenden Urlaubsanträge
        </div>
        <template v-else>
          <VacationApprovalCard
              v-for="request in pendingTeamleadRequests"
              :key="request.id"
              :request="request"
              :vacation-days="calculateVacationDays(request.startDate, request.endDate)"
              approval-level="teamlead"
              @approve="handleApprove"
              @reject="handleReject"
          />
        </template>
      </div>

      <!-- Tab 3: Manager (nur für chef) -->
      <div v-show="activeTab === 'manager'" class="tab-content">
        <h2>Urlaubsanträge zur finalen Genehmigung (Manager)</h2>

        <div class="pdf-export-section">
          <h3>Alle Urlaube exportieren</h3>
          <button @click="handleExportAllVacations" class="btn-pdf">
            📄 Alle Urlaube als PDF exportieren
          </button>
        </div>

        <template v-if="pendingManagerRequests && pendingManagerRequests.length > 0">
          <VacationApprovalCard
              v-for="request in pendingManagerRequests"
              :key="request.id"
              :request="request"
              :vacation-days="calculateVacationDays(request.startDate, request.endDate)"
              approval-level="manager"
              @approve="handleApprove"
              @reject="handleReject"
          />
        </template>
        <div v-else class="empty-state">
          Keine ausstehenden Urlaubsanträge für finale Genehmigung
        </div>
      </div>

      <!-- Tab 4: Urlaubsregelung (nur für manager) -->
      <div v-show="activeTab === 'halftimes'" class="tab-content">
        <HalfDayRuleManager />
      </div>

      <!-- Tab 5: Urlaubstage-Übertrag (nur für manager/admin) -->
      <div v-show="activeTab === 'carryover'" class="tab-content">
        <CarryoverManager />
      </div>

      <!-- Tab 6: Organigramm (nur für manager/admin) -->
      <div v-show="activeTab === 'organization'" class="tab-content">
        <OrganizationChart />
      </div>

      <!-- Tab: Übersicht (nur für office) -->
      <div v-show="activeTab === 'overview'" class="tab-content">
        <h2>Übersicht aller Urlaubsanträge</h2>
        <div v-if="!allRequests.value || allRequests.value.length === 0" class="empty-state">
          Keine Urlaubsanträge vorhanden
        </div>
        <VacationRequestCard
            v-for="request in allRequests.value || []"
            :key="request.id"
            :request="request"
            :vacation-days="calculateVacationDays(request.startDate, request.endDate)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { calculateWorkdays } from '~/utils/dateHelpers'

// KEINE Middleware - Auth-Check ist in onMounted

// Auth
const { currentUser, isAuthenticated, logout, initAuth } = useAuth()

const handleLogout = () => {
  logout()
  navigateTo('/login')
}

const activeTab = ref('antrag')

// Composables mit Fetch-Funktionen
const {
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
} = useVacationRequests()

const { fetchOrganization } = useOrganization()
const { fetchHalfDayRules, halfDayDates } = useHalfDayRules()
const { fetchCarryovers } = useCarryover()

const {
  exportMyApprovedVacations,
  exportTeamVacations,
  exportAllVacations
} = usePdfExport()

const toast = useToast()

const { currentTheme, toggleTheme, initTheme } = useTheme()

// Urlaubskonto des aktuellen Users
const { getCurrentUserBalance } = useVacationBalance()
const userBalance = computed(() => {
  if (!currentUser.value?.username) return null
  return getCurrentUserBalance(currentUser.value.username).value
})

// Helper-Funktion für Urlaubstage-Berechnung mit Halbtagen
const calculateVacationDays = (startDate: string, endDate: string) => {
  return calculateWorkdays(startDate, endDate, halfDayDates.value)
}

// Auth beim Laden initialisieren & Daten vom Server laden
onMounted(async () => {
  initAuth()
  
  // Redirect wenn nicht eingeloggt
  if (!isAuthenticated.value) {
    navigateTo('/login')
    return
  }

  // Theme initialisieren
  initTheme()

  // Daten vom Server laden
  await Promise.all([
    fetchRequests(),
    fetchOrganization(),
    fetchHalfDayRules(),
    fetchCarryovers()
  ])
})

// Redirect wenn nicht eingeloggt (auch nach Mount prüfen)
watch(isAuthenticated, (authenticated) => {
  if (!authenticated) {
    navigateTo('/login')
  }
})

// Computed Properties
const userRequests = computed(() => {
  if (!currentUser.value?.username) return []
  return getUserRequests(currentUser.value.username).value
})

const approvedUserRequests = computed(() => {
  if (!currentUser.value?.username) return []
  return getApprovedUserRequests(currentUser.value.username).value
})

// Nur pending Requests für das eigene Team (bei Teamlead) oder alle (bei Manager)
const pendingTeamleadRequests = computed(() => {
  if (!currentUser.value?.username) return []
  
  const allRequests = getAllRequests().value || []
  const pending = allRequests.filter(r => r.status === 'pending')
  
  // Manager sieht alle pending requests (außer Office & Teamleiter)
  if (currentUser.value.role === 'manager') {
    const { orgNodes } = useOrganization()
    return pending.filter(r => {
      const user = orgNodes.value?.find(n => n.userId === r.userId)
      // Keine Office- oder Teamleiter-Anträge hier (die sind im Manager-Tab)
      return user?.role === 'employee'
    })
  } 
  
  // Teamleiter nur ihr Team (nicht ihre eigenen Anträge!)
  if (currentUser.value.role === 'teamlead') {
    const { getTeamMembers } = useOrganization()
    const teamMemberIds = getTeamMembers(currentUser.value.username).value?.map(m => m.userId) || []
    return pending.filter(r => teamMemberIds.includes(r.userId))
  }
  
  // Office sieht alle Employee pending (readonly)
  if (currentUser.value.role === 'office') {
    const { orgNodes } = useOrganization()
    return pending.filter(r => {
      const user = orgNodes.value?.find(n => n.userId === r.userId)
      return user?.role === 'employee'
    })
  }
  
  return []
})

const pendingManagerRequests = computed(() => {
  const requests = getAllRequests()
  const allReqs = requests.value || []
  
  // Manager & Office sehen:
  // 1. Anträge mit status 'teamlead_approved' (normale Employee nach Teamleiter-Genehmigung)
  // 2. Anträge mit status 'pending' von Office oder Teamleitern (die haben keinen Teamleiter)
  return allReqs.filter(r => {
    if (r.status === 'teamlead_approved') return true
    
    // Office & Teamleiter-Anträge (pending) direkt zum Manager
    if (r.status === 'pending') {
      const { orgNodes } = useOrganization()
      const user = orgNodes.value?.find(n => n.userId === r.userId)
      return user?.role === 'office' || user?.role === 'teamlead'
    }
    
    return false
  })
})

const allTeamRequests = computed(() => {
  if (!currentUser.value?.username) return []
  return getAllTeamRequests(currentUser.value.username).value
})

const allRequests = getAllRequests()

const visibleTabs = computed(() => {
  const tabs = [{ id: 'antrag', label: 'Mein Antrag', count: 0 }]

  if (currentUser.value?.role === 'teamlead' || currentUser.value?.role === 'manager') {
    tabs.push({
      id: 'teamlead',
      label: 'Teamleiter',
      count: pendingTeamleadRequests.value.length
    })
  }

  if (currentUser.value?.role === 'manager') {
    tabs.push({
      id: 'manager',
      label: 'Manager',
      count: pendingManagerRequests.value.length
    })
    tabs.push({
      id: 'halftimes',
      label: 'Urlaubsregelung',
      count: 0
    })
    tabs.push({
      id: 'carryover',
      label: 'Übertrag',
      count: 0
    })
  }
  
  // Organigramm für alle (readonly für nicht-Manager)
  tabs.push({
    id: 'organization',
    label: 'Organigramm',
    count: 0
  })

  // Office sieht: Alle Tabs (readonly außer eigene Anträge)
  if (currentUser.value?.role === 'office') {
    return [
      { id: 'antrag', label: 'Mein Antrag', count: 0 },
      { id: 'overview', label: 'Übersicht', count: 0 },
      { id: 'teamlead', label: 'Teamleiter-Ansicht', count: 0 },
      { id: 'manager', label: 'Manager-Ansicht', count: 0 },
      { id: 'halftimes', label: 'Urlaubsregelung', count: 0 },
      { id: 'carryover', label: 'Übertrag', count: 0 },
      { id: 'organization', label: 'Organigramm', count: 0 }
    ]
  }

  return tabs
})

// Event Handlers
const handleSubmitRequest = async (formData: { startDate: string; endDate: string; reason: string }) => {
  if (!currentUser.value) return

  await submitRequest(
      currentUser.value.username,
      currentUser.value.displayName,
      formData.startDate,
      formData.endDate,
      formData.reason
  )
}

const handleApprove = async (requestId: number, level: 'teamlead' | 'manager') => {
  await approveRequest(requestId, level)
}

const handleReject = async (requestId: number) => {
  await rejectRequest(requestId)
}

const handleExportMyVacations = () => {
  if (!currentUser.value?.username) return
  exportMyApprovedVacations(currentUser.value.username)
}

const handleExportTeamVacations = () => {
  if (!currentUser.value?.username) return
  exportTeamVacations(currentUser.value.username)
}

const handleExportAllVacations = () => {
  if (!currentUser.value?.username) return
  exportAllVacations(currentUser.value.username)
}
</script>
