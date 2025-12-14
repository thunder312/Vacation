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
                Urlaubstage: {{ calculateWorkdays(req.startDate, req.endDate) }}
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
                Urlaubstage: {{ calculateWorkdays(req.startDate, req.endDate) }}
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
                Urlaubstage: {{ calculateWorkdays(req.startDate, req.endDate) }}
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
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/types/vacation'
import { formatDate, calculateDays, calculateWorkdays, getStatusTextWithIcon } from '~/utils/dateHelpers'

const { currentUser, logout, isAuthenticated, initAuth } = useAuth()

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

const pendingTeamleadRequests = getPendingTeamleadRequests()
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
  }

  // Office sieht alle Tabs, aber ohne Badge-Counts
  if (currentUser.value?.role === 'office') {
    return [
      { id: 'overview', label: 'Übersicht', count: 0 },
      { id: 'teamlead', label: 'Teamlead-Ansicht', count: 0 },
      { id: 'manager', label: 'Manager-Ansicht', count: 0 }
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
  exportMyApprovedVacations(approvedUserRequests.value, currentUser.value.displayName)
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

<style scoped>
.vacation-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-gray-200);
}

.header h1 {
  margin: 0;
  color: var(--color-gray-800);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logout-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-error);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background: var(--color-error-dark);
}

.tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-gray-200);
  position: relative;
}

.tab {
  padding: var(--spacing-md) var(--spacing-lg);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-gray-600);
  transition: all 0.2s;
  position: relative;
}

.tab:hover {
  color: var(--color-primary);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.badge {
  display: inline-block;
  margin-left: var(--spacing-xs);
  padding: 2px 8px;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.theme-toggle {
  margin-left: auto;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-gray-100);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1.25rem;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background: var(--color-gray-200);
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pdf-export-section {
  background: var(--color-white);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
}

.pdf-export-section h3 {
  margin: 0 0 var(--spacing-md);
  color: var(--color-gray-700);
  font-size: 1rem;
}

.btn-pdf {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn-pdf:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-pdf:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.requests-list {
  background: var(--color-white);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.requests-list h3 {
  margin: 0 0 var(--spacing-lg);
  color: var(--color-gray-800);
}

.empty-state {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--color-gray-500);
  font-style: italic;
}

.request-card {
  background: var(--color-gray-50);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  border-left: 4px solid var(--color-gray-300);
}

.request-card.approval {
  border-left-color: var(--color-primary);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.request-header strong {
  display: block;
  color: var(--color-gray-800);
  font-size: 1.125rem;
}

.request-date {
  display: block;
  color: var(--color-gray-600);
  font-size: 0.875rem;
  margin-top: var(--spacing-xs);
}

.status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status.pending {
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.status.teamleiter_approved {
  background: var(--color-info-light);
  color: var(--color-info-dark);
}

.status.approved {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.status.rejected {
  background: var(--color-error-light);
  color: var(--color-error-dark);
}

.request-reason {
  margin: var(--spacing-sm) 0;
  color: var(--color-gray-700);
  font-style: italic;
}

.approval-info {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-success-light);
  border-radius: var(--radius-sm);
  color: var(--color-success-dark);
}

.request-footer {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-gray-200);
  color: var(--color-gray-600);
}
</style>
