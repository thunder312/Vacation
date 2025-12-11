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
      <!-- Tab 1: Antrag -->
      <div v-show="activeTab === 'antrag'" class="tab-content">
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

      <!-- Tab 2: Teamleiter -->
      <div v-show="activeTab === 'teamleiter'" class="tab-content">
        <h2>Anträge zur 1. Genehmigung</h2>

        <div class="pdf-export-section">
          <h3>Team-Urlaube exportieren</h3>
          <button @click="handleExportTeamVacations" class="btn-pdf">
            📄 Als PDF exportieren
          </button>
        </div>

        <div v-if="pendingTeamleiterRequests.length === 0" class="empty-state">
          Keine Anträge zur Genehmigung
        </div>
        <VacationApprovalCard
            v-for="req in pendingTeamleiterRequests"
            :key="req.id"
            :request="req"
            @approve="handleApprove($event, 'teamleiter')"
            @reject="handleReject"
        />
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
        <VacationApprovalCard
            v-for="req in pendingChefRequests"
            :key="req.id"
            :request="req"
            :show-teamleiter-approval="true"
            @approve="handleApprove($event, 'chef')"
            @reject="handleReject"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/types/vacation'

const route = useRoute()

// Prüfe ob Benutzer eingeloggt ist
if (!route.query.user || !route.query.role) {
  navigateTo('/login')
}

const currentUser = ref((route.query.user as string) || 'Benutzer')
const userRole = ref<UserRole>((route.query.role as UserRole) || 'employee')
const activeTab = ref('antrag')

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