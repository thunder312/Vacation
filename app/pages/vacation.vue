<template>
  <div class="vacation-container">
    <ToastContainer />

    <div class="header">
      <h1>{{ t('appName') }}</h1>
      <div class="header-actions">
        <span class="user-greeting">{{ t('login.loggedInAs') }} <strong>{{ currentUser?.displayName || 'Benutzer' }}</strong></span>
        
        <!-- Language Switcher -->
        <LanguageSwitcher />
        
        <!-- User Dropdown Menu -->
        <div class="user-dropdown">
          <button @click="toggleUserMenu" class="user-menu-btn">
            {{icons.roles.employee}} {{ currentUser?.username }} ▼
          </button>
          
          <div v-if="showUserMenu" class="dropdown-menu">
            <button @click="openPasswordModal" class="dropdown-item">
              🔑 {{ t('login.changePassword') }}
            </button>
            <button @click="openAboutModal" class="dropdown-item">
              {{icons.ui.info}} {{ t('footer.about') }}
            </button>
            <button @click="handleLogout" class="dropdown-item logout">
              🚪 {{ t('login.logout') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Passwort ändern Modal -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ t('login.changePassword') }}</h2>
          <button @click="closePasswordModal" class="modal-close">✕</button>
        </div>
        
        <form @submit.prevent="handleChangePassword" class="password-form">
          <div class="form-group">
            <label>{{ t('login.oldPassword') }} *</label>
            <input 
              v-model="passwordForm.oldPassword" 
              type="password" 
              required 
              autocomplete="current-password"
            />
          </div>
          
          <div class="form-group">
            <label>{{ t('login.newPassword') }} * ({{ t('login.min8characters') }})</label>
            <input 
              v-model="passwordForm.newPassword" 
              type="password" 
              required 
              minlength="8"
              autocomplete="new-password"
            />
          </div>
          
          <div class="form-group">
            <label>{{ t('login.confirmPassword')}} *</label>
            <input 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              required 
              minlength="8"
              autocomplete="new-password"
            />
          </div>
          
          <div v-if="passwordError" class="error-message">
            {{ passwordError }}
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closePasswordModal" class="btn-secondary">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="btn-primary">
              Passwort ändern
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- About Modal -->
    <AboutModal v-if="showAboutModal" @close="closeAboutModal" />

    <!-- Urlaub absagen Modal -->
    <div v-if="showCancelModal" class="modal-overlay" @click.self="closeCancelModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ t('vacation.cancel') }}</h2>
          <button @click="closeCancelModal" class="modal-close">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="warning-box">
            <strong>{{ t('modal.warning') }}:</strong>
            <p>{{ t('modal.cancelVacation') }}</p>
          </div>
          
          <div class="form-group">
            <label>{{ t('vacation.cancelReason') }} *</label>
            <textarea
              v-model="cancelForm.reason"
              required
              rows="4"
              :placeholder="t('vacation.cancellationReason')"
            ></textarea>
            <small class="help-text">{{ t('vacation.cancellationReasonRemark') }}</small>
          </div>
        </div>
        
        <div class="modal-actions">
          <button type="button" @click="closeCancelModal" class="btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button @click="confirmCancelRequest" class="btn-danger">
            ❌ {{ t('vacation.cancel') }}
          </button>
        </div>
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
          <h3>{{ t('vacation.exportApprovedVacations')}}</h3>
          <button
              @click="handleExportMyVacations"
              class="btn-pdf"
              :disabled="!approvedUserRequests || approvedUserRequests.length === 0"
          >
            {{icons.actions.pdf}} {{ t('vacation.exportPdf') }}
          </button>
        </div>

        <div class="requests-list">
          <h2>{{t('vacation.myRequests')}}</h2>
          <div v-if="!userRequests || userRequests.length === 0" class="empty-state">
            {{t('vacation.noRequests')}}
          </div>
          <VacationRequestCard
              v-for="request in userRequests || []"
              :key="request.id"
              :request="request"
              :vacation-days="calculateVacationDays(request.startDate, request.endDate)"
          />
        </div>
      </div>

      <!-- Tab 2: Teamleiter (nur für teamlead/manager) -->
      <div v-show="activeTab === 'teamlead'" class="tab-content">
        <h2>{{t('vacation.requestsForApproval')}} ({{t('roles.teamlead')}})</h2>

        <div class="pdf-export-section">
          <h3>{{ t('vacation.exportTeamVacations') }}</h3>
          <button @click="handleExportTeamVacations" class="btn-pdf">
            {{icons.actions.pdf}} {{ t('vacation.exportTeamPdf') }}
          </button>
        </div>

        <template v-if="pendingTeamleadRequests && pendingTeamleadRequests.length > 0">
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
        <h2>{{ t('vacation.requestsForFinalApproval')}} ({{t('roles.manager')}})</h2>

        <div class="pdf-export-section">
          <h3>{{ t('vacation.exportAllVacations') }}</h3>
          <button @click="handleExportAllVacations" class="btn-pdf">
            {{icons.actions.pdf}}  {{ t('vacation.exportAllPdf') }}
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
              @cancel="handleCancelRequest"
          />
        </template>
        <div v-else class="empty-state">
         {{t('vacation.noVacationsFinalApproval')}}
        </div>

        <!-- Genehmigte Urlaube (können abgesagt werden) -->
        <ApprovedVacationList
            :requests="approvedRequests || []"
            @cancel="handleCancelRequest"
        />
      </div>

      <!-- Tab 4: Urlaubsregelung (nur für manager) -->
      <div v-show="activeTab === 'halftimes'" class="tab-content">
        <HalfDayRuleManager />
      </div>

      <!-- Tab 6: Organigramm (nur für manager/admin) -->
      <div v-show="activeTab === 'organization'" class="tab-content">
        <OrganizationChart />
      </div>

      <!-- Tab 7: Mitarbeiterverwaltung (nur für Manager) -->
      <div v-show="activeTab === 'users'" class="tab-content">
        <UserManagement />
      </div>

      <!-- Tab: Übersicht (nur für office) -->
      <div v-show="activeTab === 'overview'" class="tab-content">
        <h2>{{t('vacation.allVacationsOverview')}}</h2>
        <div v-if="!allRequests.value || allRequests.value.length === 0" class="empty-state">
          {{t('vacation.noRequests')}}
        </div>
        <VacationRequestCard
            v-for="request in allRequests.value || []"
            :key="request.id"
            :request="request"
            :vacation-days="calculateVacationDays(request.startDate, request.endDate)"
        />
      </div>

      <!-- Tab: Urlaubskalender (für alle) -->
      <div v-show="activeTab === 'calendar'" class="tab-content">
        <VacationCalendar />
      </div>

      <!-- Tab: Berichte (für Manager und Office) -->
      <div v-show="activeTab === 'reports'" class="tab-content">
        <AnnualVacationReport />
      </div>

      <!-- Tab: Admin Datenbank (nur für admin) -->
      <div v-show="activeTab === 'admin'" class="tab-content">
        <DatabaseAdmin />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { icons } from '~/config/icons'
import { calculateWorkdays } from '~/utils/dateHelpers'
import { exportApprovedVacations, exportTeamVacations, exportManagerVacations } from '~/utils/pdf'

const { currentUser, isAuthenticated, logout, initAuth } = useAuth()
const toast = useToast()
const { t } = useI18n()

// Theme
const { currentTheme, initTheme, toggleTheme } = useTheme()

// Vacation Requests
const {
  submitRequest,
  approveRequest,
  rejectRequest,
  cancelRequest,
  getUserRequests,
  getApprovedUserRequests,
  getTeamRequests,
  getManagerRequests,
  getAllRequests,
  getApprovedRequests,
  fetchRequests
} = useVacationRequests()

// Organization
const { orgNodes, teamleads, fetchOrganization } = useOrganization()

// Half Day Rules
const { halfDayDates, fetchHalfDayRules } = useHalfDayRules()

// State
const activeTab = ref('antrag')
const showUserMenu = ref(false)
const showPasswordModal = ref(false)
const showAboutModal = ref(false)
const showCancelModal = ref(false)
const cancelRequestId = ref<number | null>(null)

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const cancelForm = ref({
  reason: ''
})

const passwordError = ref('')

// User Menu
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// Password Modal
const openPasswordModal = () => {
  showUserMenu.value = false
  showPasswordModal.value = true
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  passwordError.value = ''
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  passwordError.value = ''
}

// About Modal
const openAboutModal = () => {
  showUserMenu.value = false
  showAboutModal.value = true
}

const closeAboutModal = () => {
  showAboutModal.value = false
}

// Cancel Modal
const handleCancelRequest = (requestId: number) => {
  cancelRequestId.value = requestId
  cancelForm.value.reason = ''
  showCancelModal.value = true
}

const closeCancelModal = () => {
  showCancelModal.value = false
  cancelRequestId.value = null
  cancelForm.value.reason = ''
}

const confirmCancelRequest = async () => {
  if (!cancelRequestId.value || !cancelForm.value.reason.trim()) {
    toast.error('Bitte geben Sie einen Grund an')
    return
  }

  await cancelRequest(cancelRequestId.value, cancelForm.value.reason)
  closeCancelModal()
}

// Logout
const handleLogout = () => {
  logout()
  navigateTo('/login')
}

// Passwort ändern
const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = t('login.passwordMismatch')
    return
  }
  
  try {
    await $fetch('/api/auth/change-password', {
      method: 'POST',
      body: {
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword
      }
    })
    
    toast.success('Passwort erfolgreich geändert')
    closePasswordModal()
  } catch (error: any) {
    console.error('Passwort-Änderung fehlgeschlagen:', error)
    passwordError.value = error.data?.message || 'Fehler beim Ändern des Passworts'
  }
}

// Click outside to close menu
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.user-dropdown')) {
      showUserMenu.value = false
    }
  })
})

// Timestamp für letzte Änderung in User-Management
const usersLastUpdated = useState<number>('usersLastUpdated', () => 0)

// Timestamp für letzte Änderung im Organigramm
const orgLastUpdated = useState<number>('orgLastUpdated', () => 0)

// Organigramm neu laden wenn Tab gewechselt wird ODER User-Management geändert wurde
watch([activeTab, usersLastUpdated], ([newTab, lastUpdate]) => {
  if (newTab === 'organization') {
    fetchOrganization()
  }
})

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
      const requester = orgNodes.value.find(n => n.userId === r.userId)
      return requester && requester.role !== 'office' && requester.role !== 'teamlead'
    })
  }
  
  // Teamlead sieht nur pending requests seines Teams
  const myTeamMembers = orgNodes.value
    .filter(n => n.teamleadId === currentUser.value.username)
    .map(n => n.userId)
  
  return pending.filter(r => myTeamMembers.includes(r.userId))
})

const pendingManagerRequests = computed(() => {
  if (!currentUser.value?.username || currentUser.value.role !== 'manager') return []
  return getManagerRequests().value
})

const allRequests = getAllRequests()

const approvedRequests = computed(() => {
  if (!currentUser.value || currentUser.value.role !== 'manager') return []
  return getApprovedRequests().value
})

const isAdmin = computed(() => currentUser.value?.username === 'admin')

const visibleTabs = computed(() => {
  const tabs = [{ id: 'antrag', label: t('tabs.myRequest'), count: 0 }]

  if (currentUser.value?.role === 'teamlead' || currentUser.value?.role === 'manager') {
    tabs.push({
      id: 'teamlead',
      label: t('roles.teamlead'),
      count: pendingTeamleadRequests.value.length
    })
  }

  if (currentUser.value?.role === 'manager') {
    tabs.push({
      id: 'manager',
      label: t('roles.manager'),
      count: pendingManagerRequests.value.length
    })
    tabs.push({
      id: 'halftimes',
      label: t('tabs.vacationRules'),
      count: 0
    })
    tabs.push({
      id: 'users',
      label: t('tabs.employeeManagement'),
      count: 0
    })
  }
  
  // Organigramm für alle (readonly für nicht-Manager)
  tabs.push({
    id: 'organization',
    label: t('nav.organization'),
    count: 0
  })
  
  // Berichte Tab für Manager und Office
  if (currentUser.value?.role === 'manager' || currentUser.value?.role === 'office') {
    tabs.push({
      id: 'reports',
      label: t('tabs.reports'),
      count: 0
    })
  }
  
  // Urlaubskalender für alle
  tabs.push({
    id: 'calendar',
    label: t('tabs.calendar'),
    count: 0
  })

  // Admin Tab nur für admin
  if (isAdmin.value) {
    tabs.push({
      id: 'admin',
      label: t('admin.database'),
      count: 0
    })
  }

  // Office sieht: Alle Tabs (readonly außer eigene Anträge)
  if (currentUser.value?.role === 'office') {
    const officeTabs = [
      { id: 'antrag', label: t('tabs.myRequest'), count: 0 },
      { id: 'overview', label: t('tabs.overview'), count: 0 },
      { id: 'teamlead', label: t('tabs.teamleadView'), count: 0 },
      { id: 'manager', label: t('tabs.managerView'), count: 0 },
      { id: 'halftimes', label: t('tabs.vacationRules'), count: 0 },
      { id: 'organization', label: t('nav.organization'), count: 0 },
      { id: 'reports', label: t('tabs.reports'), count: 0 },
      { id: 'calendar', label: t('tabs.calendar'), count: 0 }
    ]
    if (isAdmin.value) {
      officeTabs.push({ id: 'admin', label: t('admin.database'), count: 0 })
    }
    return officeTabs
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

// PDF Export Handlers
const handleExportMyVacations = () => {
  if (!currentUser.value || !approvedUserRequests.value.length || !userBalance.value) return
  
  toast.info(t('vacation.pdfGenerating'))
  
  try {
    exportApprovedVacations(
      currentUser.value.displayName,
      approvedUserRequests.value,
      userBalance.value,
      halfDayDates.value,
      t
    )
    toast.success(t('vacation.pdfCreated'))
  } catch (error) {
    console.error('PDF Export Error:', error)
    toast.error(t('errors.creatingPdf'))
  }
}

const handleExportTeamVacations = () => {
  if (!currentUser.value) return
  
  const teamRequests = getTeamRequests(currentUser.value.username).value
  if (!teamRequests.length) return
  
  toast.info(t('vacation.pdfGenerating'))
  
  try {
    exportTeamVacations(
      currentUser.value.displayName,
      teamRequests,
      halfDayDates.value,
      t
    )
    toast.success(t('vacation.pdfCreated'))
  } catch (error) {
    console.error('PDF Export Error:', error)
    toast.error(t('errors.creatingPdf'))
  }
}

const handleExportAllVacations = () => {
  if (!currentUser.value || currentUser.value.role !== 'manager') return
  
  const managerRequests = getAllRequests().value
  if (!managerRequests.length) return
  
  toast.info(t('vacation.pdfGenerating'))
  
  try {
    exportManagerVacations(
      currentUser.value.displayName,
      managerRequests,
      halfDayDates.value,
      t
    )
    toast.success(t('vacation.pdfCreated'))
  } catch (error) {
    console.error('PDF Export Error:', error)
    toast.error(t('errors.creatingPdf'))
  }
}
</script>
