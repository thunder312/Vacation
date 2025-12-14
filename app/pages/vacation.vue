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
          <VacationRequestCard
              v-for="req in userRequests"
              :key="req.id"
              :request="req"
          />
        </div>
      </div>

      <!-- Tab: Übersicht (nur für office) -->
      <div v-show="activeTab === 'overview' && currentUser?.role === 'office'" class="tab-content">
        <h2>Übersicht aller Urlaubsanträge</h2>

        <div class="pdf-export-section">
          <h3>Alle Urlaube exportieren</h3>
          <button @click="handleExportAllVacations" class="btn-pdf">
            📄 Als PDF exportieren
          </button>
        </div>

        <div class="requests-list">
          <h3>Alle Anträge</h3>
          <div v-if="allRequests.length === 0" class="empty-state">
            Keine Anträge vorhanden
          </div>
          <div v-for="req in allRequests" :key="req.id" class="request-card approval">
            <div class="request-header">
              <div>
                <strong>{{ req.user }}</strong>
                <span class="request-date">
                  {{ formatDate(req.startDate) }} - {{ formatDate(req.endDate) }}
                </span>
              </div>
              <span :class="['status', req.status]">
                {{ getStatusTextWithIcon(req.status) }}
              </span>
            </div>
            <p v-if="req.reason" class="request-reason">{{ req.reason }}</p>
            <div class="request-footer">
              <small>
                Urlaubstage: {{ calculateVacationDays(req.startDate, req.endDate) }}
                ({{ calculateDays(req.startDate, req.endDate) }} Tage gesamt)
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Teamlead -->
      <div v-show="activeTab === 'teamlead'" class="tab-content">
        <h2>Anträge zur 1. Genehmigung</h2>

        <div v-if="currentUser?.role !== 'office'" class="pdf-export-section">
          <h3>Team-Urlaube exportieren</h3>
          <button @click="handleExportTeamVacations" class="btn-pdf">
            📄 Als PDF exportieren
          </button>
        </div>

        <div v-else class="pdf-export-section">
          <h3>Team-Urlaube exportieren</h3>
          <button @click="handleExportTeamVacations" class="btn-pdf">
            📄 Als PDF exportieren
          </button>
        </div>

        <div v-if="pendingTeamleadRequests.length === 0" class="empty-state">
          Keine Anträge zur Genehmigung
        </div>
        <div v-for="req in pendingTeamleadRequests" :key="req.id">
          <!-- Office: Nur anzeigen, keine Buttons -->
          <div v-if="currentUser?.role === 'office'" class="request-card approval">
            <div class="request-header">
              <div>
                <strong>{{ req.user }}</strong>
                <span class="request-date">
                  {{ formatDate(req.startDate) }} - {{ formatDate(req.endDate) }}
                </span>
              </div>
              <span :class="['status', req.status]">
                {{ getStatusTextWithIcon(req.status) }}
              </span>
            </div>
            <p v-if="req.reason" class="request-reason">{{ req.reason }}</p>
            <div class="request-footer">
              <small>
                Urlaubstage: {{ calculateVacationDays(req.startDate, req.endDate) }}
                ({{ calculateDays(req.startDate, req.endDate) }} Tage gesamt)
              </small>
            </div>
          </div>

          <!-- Teamlead/Manager: Mit Approve/Reject Buttons -->
          <VacationApprovalCard
              v-else
              :request="req"
              @approve="handleApprove($event, 'teamlead')"
              @reject="handleReject"
          />
        </div>
      </div>

      <!-- Tab 3: Manager -->
      <div v-show="activeTab === 'manager'" class="tab-content">
        <h2>Anträge zur 2. Genehmigung</h2>

        <div class="pdf-export-section">
          <h3>Alle Urlaube exportieren</h3>
          <button @click="handleExportAllVacations" class="btn-pdf">
            📄 Als PDF exportieren
          </button>
        </div>

        <div v-if="pendingManagerRequests.length === 0" class="empty-state">
          Keine Anträge zur Genehmigung
        </div>
        <div v-for="req in pendingManagerRequests" :key="req.id">
          <!-- Office: Nur anzeigen, keine Buttons -->
          <div v-if="currentUser?.role === 'office'" class="request-card approval">
            <div class="request-header">
              <div>
                <strong>{{ req.user }}</strong>
                <span class="request-date">
                  {{ formatDate(req.startDate) }} - {{ formatDate(req.endDate) }}
                </span>
              </div>
              <span :class="['status', req.status]">
                {{ getStatusTextWithIcon(req.status) }}
              </span>
            </div>
            <p v-if="req.reason" class="request-reason">{{ req.reason }}</p>
            <div v-if="req.teamleadApprovalDate" class="approval-info">
              <small>✓ Genehmigt von Teamlead am {{ formatDate(req.teamleadApprovalDate) }}</small>
            </div>
            <div class="request-footer">
              <small>
                Urlaubstage: {{ calculateVacationDays(req.startDate, req.endDate) }}
                ({{ calculateDays(req.startDate, req.endDate) }} Tage gesamt)
              </small>
            </div>
          </div>

          <!-- Manager: Mit Approve/Reject Buttons -->
          <VacationApprovalCard
              v-else
              :request="req"
              :show-teamlead-approval="true"
              @approve="handleApprove($event, 'manager')"
              @reject="handleReject"
          />
        </div>
      </div>

      <!-- Tab 4: Firmeninterne Urlaubsregelung (nur für manager/admin) -->
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
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/types/vacation'
import { formatDate, calculateDays, calculateWorkdays, getStatusTextWithIcon } from '~/utils/dateHelpers'

const { currentUser, logout, isAuthenticated, initAuth } = useAuth()
const { getAllRules } = useHalfDayRules()
const { getCurrentUserBalance } = useVacationBalance()

// Halbtags-Regelungen als Array von Datums-Strings
const halfDayDates = computed(() => getAllRules.value.map(rule => rule.date))

// Urlaubskonto des aktuellen Users
const userBalance = computed(() => {
  if (!currentUser.value?.username) return null
  return getCurrentUserBalance(currentUser.value.username).value
})

// Helper-Funktion für Urlaubstage-Berechnung mit Halbtagen
const calculateVacationDays = (startDate: string, endDate: string) => {
  return calculateWorkdays(startDate, endDate, halfDayDates.value)
}

// Auth beim Laden initialisieren
onMounted(() => {
  initAuth()
  
  // Redirect wenn nicht eingeloggt
  if (!isAuthenticated.value) {
    navigateTo('/login')
  }
})

// Redirect wenn nicht eingeloggt (auch nach Mount prüfen)
watch(isAuthenticated, (authenticated) => {
  if (!authenticated) {
    navigateTo('/login')
  }
})

const activeTab = ref(currentUser.value?.role === 'office' ? 'overview' : 'antrag')

// Composables
const {
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

const {
  exportMyApprovedVacations,
  exportTeamVacations,
  exportAllVacations
} = usePdfExport()

const toast = useToast()

const { currentTheme, toggleTheme, initTheme } = useTheme()

// Theme beim Laden initialisieren
onMounted(() => {
  initTheme()
})

// Computed Properties - mit userId statt displayName
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
const handleSubmitRequest = (startDate: string, endDate: string, reason: string) => {
  if (!currentUser.value) return
  
  submitRequest(
    currentUser.value.username,
    currentUser.value.displayName,
    startDate,
    endDate,
    reason
  )
  toast.success('Antrag erfolgreich eingereicht!')
}

const handleApprove = (id: number, level: 'teamlead' | 'manager') => {
  if (approveRequest(id, level)) {
    toast.success('Antrag genehmigt!')
  }
}

const handleReject = (id: number) => {
  if (rejectRequest(id)) {
    toast.info('Antrag abgelehnt')
  }
}

const handleExportMyVacations = () => {
  if (!currentUser.value) return
  exportMyApprovedVacations(
    approvedUserRequests.value, 
    currentUser.value.displayName,
    currentUser.value.username
  )
}

const handleExportTeamVacations = () => {
  if (!currentUser.value) return
  exportTeamVacations(allTeamRequests.value, currentUser.value.displayName)
}

const handleExportAllVacations = () => {
  if (!currentUser.value) return
  exportAllVacations(allRequests.value, currentUser.value.displayName)
}

const handleLogout = () => {
  logout()
  navigateTo('/login')
}
</script>
