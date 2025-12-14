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
      <!-- Tab 1: Antrag (für employee, teamleiter, chef) -->
      <div v-show="activeTab === 'antrag' && currentUser?.role !== 'office'" class="tab-content">
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

      <!-- Tab 2: Teamlead (nur für teamleiter und chef) -->
      <div v-show="activeTab === 'teamlead'" class="tab-content">
        <h2>Urlaubsanträge zur Genehmigung (Teamlead)</h2>

        <div class="pdf-export-section">
          <h3>Team-Urlaube exportieren</h3>
          <button @click="handleExportTeamVacations" class="btn-pdf">
            📄 Team-PDF exportieren
          </button>
        </div>

        <div v-if="!pendingTeamleadRequests || pendingTeamleadRequests.length === 0" class="empty-state">
          Keine ausstehenden Urlaubsanträge
        </div>
        <VacationApprovalCard
            v-for="request in pendingTeamleadRequests || []"
            :key="request.id"
            :request="request"
            :vacation-days="calculateVacationDays(request.startDate, request.endDate)"
            approval-level="teamlead"
            @approve="handleApprove"
            @reject="handleReject"
        />
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

        <div v-if="!pendingManagerRequests.value || pendingManagerRequests.value.length === 0" class="empty-state">
          Keine ausstehenden Urlaubsanträge für finale Genehmigung
        </div>
        <VacationApprovalCard
            v-for="request in pendingManagerRequests.value || []"
            :key="request.id"
            :request="request"
            :vacation-days="calculateVacationDays(request.startDate, request.endDate)"
            approval-level="manager"
            @approve="handleApprove"
            @reject="handleReject"
        />
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

const activeTab = ref(currentUser.value?.role === 'office' ? 'overview' : 'antrag')

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
  
  // Manager sieht alle pending requests, Teamleads nur ihr Team
  if (currentUser.value.role === 'manager') {
    return getPendingTeamleadRequests().value
  } else if (currentUser.value.role === 'teamlead') {
    return getPendingTeamleadRequests(currentUser.value.username).value
  }
  
  return []
})

const pendingManagerRequests = getPendingManagerRequests()

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
      label: 'Teamlead',
      count: pendingTeamleadRequests.value?.length || 0
    })
  }

  if (currentUser.value?.role === 'manager') {
    tabs.push({
      id: 'manager',
      label: 'Manager',
      count: pendingManagerRequests.value?.length || 0
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
    tabs.push({
      id: 'organization',
      label: 'Organigramm',
      count: 0
    })
  }

  // Office sieht alle Tabs, aber ohne Badge-Counts
  if (currentUser.value?.role === 'office') {
    return [
      { id: 'overview', label: 'Übersicht', count: 0 },
      { id: 'teamlead', label: 'Teamlead-Ansicht', count: 0 },
      { id: 'manager', label: 'Manager-Ansicht', count: 0 },
      { id: 'carryover', label: 'Übertrag', count: 0 }
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
  exportAllVacations()
}
</script>
