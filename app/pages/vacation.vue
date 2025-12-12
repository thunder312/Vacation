<template>
  <div class="vacation-container">
    <ToastContainer />

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
      <!-- Tab 1: Antrag (für employee, teamleiter, chef) -->
      <div v-show="activeTab === 'antrag' && userRole !== 'office'" class="tab-content">
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
      <div v-show="activeTab === 'overview' && userRole === 'office'" class="tab-content">
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

      <!-- Tab 2: Teamleiter -->
      <div v-show="activeTab === 'teamleiter'" class="tab-content">
        <h2>Anträge zur 1. Genehmigung</h2>

        <div v-if="userRole !== 'office'" class="pdf-export-section">
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

        <div v-if="pendingTeamleiterRequests.length === 0" class="empty-state">
          Keine Anträge zur Genehmigung
        </div>
        <div v-for="req in pendingTeamleiterRequests" :key="req.id">
          <!-- Office: Nur anzeigen, keine Buttons -->
          <div v-if="userRole === 'office'" class="request-card approval">
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

          <!-- Teamleiter/Chef: Mit Approve/Reject Buttons -->
          <VacationApprovalCard
              v-else
              :request="req"
              @approve="handleApprove($event, 'teamleiter')"
              @reject="handleReject"
          />
        </div>
      </div>

      <!-- Tab 3: Chef -->
      <div v-show="activeTab === 'chef'" class="tab-content">
        <h2>Anträge zur 2. Genehmigung</h2>

        <div class="pdf-export-section">
          <h3>Alle Urlaube exportieren</h3>
          <button @click="handleExportAllVacations" class="btn-pdf">
            📄 Als PDF exportieren
          </button>
        </div>

        <div v-if="pendingChefRequests.length === 0" class="empty-state">
          Keine Anträge zur Genehmigung
        </div>
        <div v-for="req in pendingChefRequests" :key="req.id">
          <!-- Office: Nur anzeigen, keine Buttons -->
          <div v-if="userRole === 'office'" class="request-card approval">
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
            <div v-if="req.teamleiterApprovalDate" class="approval-info">
              <small>✓ Genehmigt von Teamleiter am {{ formatDate(req.teamleiterApprovalDate) }}</small>
            </div>
            <div class="request-footer">
              <small>
                Urlaubstage: {{ calculateWorkdays(req.startDate, req.endDate) }}
                ({{ calculateDays(req.startDate, req.endDate) }} Tage gesamt)
              </small>
            </div>
          </div>

          <!-- Chef: Mit Approve/Reject Buttons -->
          <VacationApprovalCard
              v-else
              :request="req"
              :show-teamleiter-approval="true"
              @approve="handleApprove($event, 'chef')"
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

const route = useRoute()

// Prüfe ob Benutzer eingeloggt ist
if (!route.query.user || !route.query.role) {
  navigateTo('/login')
}

const currentUser = ref((route.query.user as string) || 'Benutzer')
const userRole = ref<UserRole>((route.query.role as UserRole) || 'employee')
const activeTab = ref(userRole.value === 'office' ? 'overview' : 'antrag')

// Composables
const {
  submitRequest,
  approveRequest,
  rejectRequest,
  getUserRequests,
  getApprovedUserRequests,
  getPendingTeamleiterRequests,
  getPendingChefRequests,
  getAllTeamRequests,
  getAllRequests
} = useVacationRequests()

const {
  exportMyApprovedVacations,
  exportTeamVacations,
  exportAllVacations
} = usePdfExport()

const toast = useToast()

// Computed Properties
const userRequests = getUserRequests(currentUser.value)
const approvedUserRequests = getApprovedUserRequests(currentUser.value)
const pendingTeamleiterRequests = getPendingTeamleiterRequests()
const pendingChefRequests = getPendingChefRequests()
const allTeamRequests = getAllTeamRequests(currentUser.value)
const allRequests = getAllRequests()

const visibleTabs = computed(() => {
  const tabs = [{ id: 'antrag', label: 'Mein Antrag', count: 0 }]

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

  // Office sieht alle Tabs, aber ohne Badge-Counts
  if (userRole.value === 'office') {
    return [
      { id: 'overview', label: 'Übersicht', count: 0 },
      { id: 'teamleiter', label: 'Teamleiter-Ansicht', count: 0 },
      { id: 'chef', label: 'Chef-Ansicht', count: 0 }
    ]
  }

  return tabs
})

// Event Handlers
const handleSubmitRequest = (startDate: string, endDate: string, reason: string) => {
  submitRequest(currentUser.value, startDate, endDate, reason)
  toast.success('Antrag erfolgreich eingereicht!')
}

const handleApprove = (id: number, level: 'teamleiter' | 'chef') => {
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
  exportMyApprovedVacations(approvedUserRequests.value, currentUser.value)
}

const handleExportTeamVacations = () => {
  exportTeamVacations(allTeamRequests.value, currentUser.value)
}

const handleExportAllVacations = () => {
  exportAllVacations(allRequests.value, currentUser.value)
}

const logout = () => {
  navigateTo('/login')
}
</script>