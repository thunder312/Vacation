<template>
  <div class="user-management">
    <h2>{{ t('users.title') }}</h2>

    <div class="add-user-section">
      <div class="section-header" @click="toggleAddUserSection">
        <h3>
          <span class="toggle-icon">{{ showAddUserSection ? (icons.ui?.expand || '▼') : (icons.ui?.collapse || '▶') }}</span>
          {{ t('users.addUser') }}
        </h3>
      </div>
      
      <div v-show="showAddUserSection" class="section-content">
        <form @submit.prevent="handleAddUser" class="user-form">
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('users.lastName') }} *</label>
            <input v-model="newUser.lastName" type="text" required />
          </div>
          <div class="form-group">
            <label>{{ t('users.firstName') }} *</label>
            <input v-model="newUser.firstName" type="text" required />
          </div>
        </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ t('users.username') }} *</label>
              <input v-model="newUser.username" type="text" required />
            </div>
          </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('users.role') }} *</label>
            <select v-model="newUser.role" required>
              <option value="">{{ t('users.roleSelect') }}</option>
              <option value="employee">{{ t('roles.employee') }}</option>
              <option value="teamlead">{{ t('roles.teamlead') }}</option>
              <option value="office">{{ t('roles.office') }}</option>
              <option value="sysadmin">{{ t('roles.sysadmin') }}</option>
              <option value="manager" v-if="currentUser?.role === 'administrator'">{{ t('roles.manager') }}</option>
            </select>
          </div>

          <div v-if="newUser.role === 'employee'" class="form-group">
            <label>{{ t('users.teamlead') }}</label>
            <select v-model="newUser.teamleadId">
              <option value="">-</option>
              <option v-for="tl in teamleads" :key="tl.username" :value="tl.username">
                {{ tl.displayName }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>{{ t('users.vacationDaysPerYear') }} *</label>
            <input v-model.number="newUser.vacationDays" type="number" min="0" max="50" required />
            <small>Standard: 30 {{ t('common.days') }}.</small>
          </div>

          <div class="form-group">
            <label>{{ t('users.password') }} *</label>
            <div class="password-field">
              <input v-model="newUser.password" type="text" required />
              <button type="button" @click="newUser.password = generatePassword()" class="btn-regenerate" :title="t('users.regeneratePassword')">
                {{ icons.users?.regenerate || '🔄' }}
              </button>
            </div>
            <small>{{ t('users.passwordNote') }}</small>
          </div>
        </div>

        <button type="submit" class="btn-primary">{{ t('users.addUser') }}</button>
      </form>
      </div>
    </div>

    <!-- Urlaubs-Rückbuchung Section (nur für Manager) -->
    <VacationCancellation v-if="currentUser?.role === 'manager'" />

    <div class="users-list">
      <div class="section-header" @click="toggleUsersSection">
        <h3>
          <span class="toggle-icon">{{ showUsersSection ? (icons.ui?.expand || '▼') : (icons.ui?.collapse || '▶') }}</span>
          {{ t('users.existingUsers') }} ({{ activeUsers.length }})
        </h3>
      </div>
      
      <div v-show="showUsersSection" class="users-section-content">
        <div class="filters-row">
          <div class="search-filter">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="(icons.common?.search || '🔍') + ' ' + t('users.searchPlaceholder')"
              class="search-input"
            />
          </div>
          <div class="checkbox-filter">
            <label>
              <input type="checkbox" v-model="showInactive" />
              {{ t('users.showInactive') }} ({{ inactiveUsersCount }})
            </label>
          </div>
        </div>

        <div v-if="filteredAndSearchedUsers.length === 0" class="empty-state">
          Keine {{ t('organization.employees') }} gefunden
        </div>

        <table v-else class="users-table">
          <thead>
            <tr>
              <th @click="sortBy('displayName')" class="sortable">
                {{ t('users.name') }}
                <span class="sort-indicator" :class="{ active: sortColumn === 'displayName' }">
                  {{ sortColumn === 'displayName' ? (sortDirection === 'asc' ? (icons.users?.sortAsc || '▲') : (icons.users?.sortDesc || '▼')) : (icons.users?.sortAsc || '▲') }}
                </span>
              </th>
              <th @click="sortBy('username')" class="sortable">
                {{ t('users.username') }}
                <span class="sort-indicator" :class="{ active: sortColumn === 'username' }">
                  {{ sortColumn === 'username' ? (sortDirection === 'asc' ? (icons.users?.sortAsc || '▲') : (icons.users?.sortDesc || '▼')) : (icons.users?.sortAsc || '▲') }}
                </span>
              </th>
              <th @click="sortBy('role')" class="sortable">
                {{ t('users.role') }}
                <span class="sort-indicator" :class="{ active: sortColumn === 'role' }">
                  {{ sortColumn === 'role' ? (sortDirection === 'asc' ? (icons.users?.sortAsc || '▲') : (icons.users?.sortDesc || '▼')) : (icons.users?.sortAsc || '▲') }}
                </span>
              </th>
              <th @click="sortBy('vacationDays')" class="sortable">
                {{ t('users.vacationDays') }}
                <span class="sort-indicator" :class="{ active: sortColumn === 'vacationDays' }">
                  {{ sortColumn === 'vacationDays' ? (sortDirection === 'asc' ? (icons.users?.sortAsc || '▲') : (icons.users?.sortDesc || '▼')) : (icons.users?.sortAsc || '▲') }}
                </span>
              </th>
              <th @click="sortBy('teamleadId')" class="sortable">
                {{ t('users.teamlead') }}
                <span class="sort-indicator" :class="{ active: sortColumn === 'teamleadId' }">
                  {{ sortColumn === 'teamleadId' ? (sortDirection === 'asc' ? (icons.users?.sortAsc || '▲') : (icons.users?.sortDesc || '▼')) : (icons.users?.sortAsc || '▲') }}
                </span>
              </th>
              <th @click="sortBy('isActive')" class="sortable">
                {{ t('common.status') }}
                <span class="sort-indicator" :class="{ active: sortColumn === 'isActive' }">
                  {{ sortColumn === 'isActive' ? (sortDirection === 'asc' ? (icons.users?.sortAsc || '▲') : (icons.users?.sortDesc || '▼')) : (icons.users?.sortAsc || '▲') }}
                </span>
              </th>
              <th>{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredAndSearchedUsers" :key="user.username" :class="{ 'inactive-row': !user.isActive }">
            <template v-if="editingUser?.username === user.username">
              <td colspan="7" class="edit-cell">
                <div class="inline-edit-form">
                  <div class="edit-group">
                    <strong>{{ user.displayName }}</strong>
                  </div>
                  <div class="edit-group">
                    <label>{{ t('users.role') }}:</label>
                    <select v-model="editingUser.role">
                      <option value="employee">{{ t('roles.employee') }}</option>
                      <option value="teamlead">{{ t('roles.teamlead') }}</option>
                      <option value="office">{{ t('roles.office') }}</option>
                      <option value="sysadmin">{{ t('roles.sysadmin') }}</option>
                    </select>
                  </div>
                  <div class="edit-group">
                    <label>{{ t('users.vacationDays') }}:</label>
                    <input v-model.number="editingUser.vacationDays" type="number" min="0" max="50" />
                  </div>
                  <div v-if="editingUser.role === 'employee'" class="edit-group">
                    <label>{{ t('users.teamlead') }}:</label>
                    <select v-model="editingUser.teamleadId">
                      <option value="">-</option>
                      <option v-for="tl in teamleads" :key="tl.username" :value="tl.username">
                        {{ tl.displayName }}
                      </option>
                    </select>
                  </div>
                  <div class="edit-actions">
                    <button @click="saveEdit" class="btn-save">{{ icons.actions?.save || '💾' }} {{ t('common.save') }}</button>
                    <button @click="cancelEdit" class="btn-cancel">{{ icons.actions?.cancel || '❌' }} {{ t('common.cancel') }}</button>
                  </div>
                </div>
              </td>
            </template>

            <template v-else>
              <td>
                <strong>{{ user.displayName }}</strong>
                <span v-if="!user.isActive" class="inactive-badge-small">{{ icons.users?.inactive || '🚫' }}</span>
              </td>
              <td class="username-cell">{{ user.username }}</td>
              <td>
                <span class="role-badge" :class="'role-' + user.role">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="center">{{ user.vacationDays }} {{ t('common.days') }}</td>
              <td>{{ user.teamleadId ? getTeamleadName(user.teamleadId) : '—' }}</td>
              <td class="center">
                <span v-if="user.isActive" class="status-active">{{ icons.status?.active || '✓' }} {{ t('status.active') }}</span>
                <span v-else class="status-inactive">{{ icons.status?.inactive || '○' }} {{ t('status.inactive') }}</span>
              </td>
              <td class="actions-cell">
                <button
                  v-if="user.isActive && (user.role !== 'manager' || currentUser?.role === 'administrator' || currentUser?.username === user.username)"
                  @click="startEdit(user)"
                  class="btn-icon"
                  :title="t('users.editUser')"
                >
                  {{ icons.users?.edit || '✏️' }}
                </button>
                <button
                    v-if="currentUser?.role === 'administrator' || user.role !== 'manager' || currentUser?.username === user.username"
                  @click="resetPassword(user)"
                  class="btn-icon"
                  :title="t('users.resetPassword')"
                >
                  {{ icons.users?.password || '🔑' }}
                </button>
                <button
                    v-if="(currentUser?.role === 'administrator' || user.role !== 'manager') && currentUser?.username !== user.username && user.role !== 'administrator'"
                  @click="toggleUserActive(user)"
                  class="btn-icon"
                  :title="user.isActive ? t('users.deactivateUser') : t('users.activateUser')"
                >
                  {{ user.isActive ? (icons.users?.deactivate || '🚫') : (icons.users?.activate || '✅') }}
                </button>
              </td>
            </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import VacationCancellation from './VacationCancellation.vue'
import { icons } from '~/config/icons'

const toast = useToast()
const { confirm } = useConfirm()
const { currentUser } = useAuth()
const { t } = useI18n()

// State
const newUser = ref({
  lastName: '',
  firstName: '',
  username: '',
  role: '',
  teamleadId: '',
  vacationDays: 30,
  password: ''  // Generiertes Passwort
})

const editingUser = ref<any>(null)
const showInactive = ref(false)
const showUsersSection = ref(false)  // Standardmäßig eingeklappt
const showAddUserSection = ref(false)  // Standardmäßig eingeklappt
const searchQuery = ref('')
const sortColumn = ref<string>('displayName')
const sortDirection = ref<'asc' | 'desc'>('asc')

const toggleAddUserSection = () => {
  showAddUserSection.value = !showAddUserSection.value
}

const toggleUsersSection = () => {
  showUsersSection.value = !showUsersSection.value
}

const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}



// Generiere sicheres Passwort
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Initialisiere Passwort beim Laden
onMounted(() => {
  newUser.value.password = generatePassword()
})

// Generiere PDF-Login-Anleitung
const generateLoginPDF = async (userInfo: any) => {
  const { jsPDF } = await import('jspdf')
  
  // PDF mit UTF-8 Support erstellen
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    compress: true
  })
  
  // Firmen-Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  
  if (userInfo.isReset) {
    doc.text('Passwort zurückgesetzt', 105, 20, { align: 'center' })
  } else {
    doc.text('Willkommen im Urlaubsverwaltungssystem', 105, 20, { align: 'center' })
  }
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  if (userInfo.isReset) {
    doc.text('Neue Login-Informationen', 105, 30, { align: 'center' })
  } else {
    doc.text('Login-Informationen für neuen Mitarbeiter', 105, 30, { align: 'center' })
  }
  
  // Trennlinie
  doc.setLineWidth(0.5)
  doc.line(20, 35, 190, 35)
  
  // Benutzerinformationen
  let y = 50
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  
  if (userInfo.isReset) {
    doc.text('Ihre neuen Zugangsdaten:', 20, y)
  } else {
    doc.text('Ihre Zugangsdaten:', 20, y)
  }
  
  y += 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  // Name
  doc.setFont('helvetica', 'bold')
  doc.text('Name:', 30, y)
  doc.setFont('helvetica', 'normal')
  doc.text(userInfo.displayName, 80, y)
  
  y += 10
  
  // Username
  doc.setFont('helvetica', 'bold')
  doc.text('Benutzername:', 30, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.text(userInfo.username, 80, y)
  doc.setFontSize(12)
  
  y += 10
  
  // Passwort
  doc.setFont('helvetica', 'bold')
  doc.text(t('users.password') + ':', 30, y)
  doc.setFont('courier', 'normal')
  doc.setFontSize(14)
  doc.text(userInfo.password, 80, y)
  doc.setFontSize(12)
  
  y += 15
  
  // Rolle
  const roleLabels: Record<string, string> = {
    employee: t('roles.employee'),
    teamlead: t('roles.teamlead'),
    office: t('roles.office'),
    manager: t('roles.manager')
  }
  
  doc.setFont('helvetica', 'bold')
  doc.text(t('users.yourRole') + ':', 30, y)
  doc.setFont('helvetica', 'normal')
  doc.text(roleLabels[userInfo.role] || userInfo.role, 80, y)
  
  y += 10
  
  // Urlaubstage
  doc.setFont('helvetica', 'bold')
  doc.text(t('users.vacationDaysPerYear') + ':', 30, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${userInfo.vacationDays} Tage`, 80, y)
  
  // Teamleiter (falls vorhanden)
  if (userInfo.teamleadId) {
    y += 10
    const teamlead = teamleads.value.find((tl: any) => tl.username === userInfo.teamleadId)
    doc.setFont('helvetica', 'bold')
    doc.text(t('users.yourTeamlead') + ':', 30, y)
    doc.setFont('helvetica', 'normal')
    doc.text(teamlead?.displayName || userInfo.teamleadId, 80, y)
  }
  
  // Anleitung
  y += 25
  doc.setLineWidth(0.5)
  doc.line(20, y, 190, y)
  y += 10
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('So melden Sie sich an:', 20, y)
  
  y += 15
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  
  const instructions = [
    '1. Öffnen Sie die Urlaubsverwaltung im Browser',
    '2. Geben Sie Ihren Benutzernamen ein',
    '3. Geben Sie Ihr Passwort ein (bitte ändern Sie es nach der ersten Anmeldung)',
    '4. Klicken Sie auf "Anmelden"'
  ]
  
  instructions.forEach(instruction => {
    doc.text(instruction, 30, y)
    y += 8
  })
  
  // Wichtiger Hinweis
  y += 10
  doc.setFillColor(255, 243, 205)
  doc.rect(20, y - 5, 170, 25, 'F')  // Höhe von 20 auf 25 erhöht
  doc.setFont('helvetica', 'bold')
  doc.text('WICHTIG:', 25, y + 2)
  doc.setFont('helvetica', 'normal')
  
  if (userInfo.isReset) {
    doc.text('Ihr Passwort wurde zurückgesetzt.', 25, y + 9)
    doc.text('Bitte ändern Sie es nach der ersten Anmeldung!', 25, y + 16)
  } else {
    doc.text('Bitte bewahren Sie diese Zugangsdaten sicher auf', 25, y + 9)
    doc.text('und ändern Sie Ihr Passwort nach der ersten Anmeldung!', 25, y + 16)
  }
  
  // Footer
  doc.setFontSize(9)
  doc.setTextColor(128, 128, 128)
  const footerText = userInfo.isReset 
    ? 'Passwort zurückgesetzt am: ' + new Date().toLocaleDateString('de-DE')
    : 'Erstellt am: ' + new Date().toLocaleDateString('de-DE')
  doc.text(footerText, 105, 280, { align: 'center' })
  
  // PDF in neuem Tab öffnen
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  window.open(pdfUrl, '_blank')
  
  // Optional: Cleanup nach 1 Minute
  setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000)
}

// API Calls
const fetchUsers = async () => {
  try {
    const response = await $fetch('/api/users')
    return response
  } catch (error) {
    console.error('Fehler beim Laden der Benutzer:', error)
    toast.error('Fehler beim Laden der Benutzer')
    return []
  }
}

const { data: users, refresh: refreshUsers } = await useAsyncData('users', fetchUsers)

// Timestamps für Cross-Tab-Aktualisierung
const usersLastUpdated = useState<number>('usersLastUpdated', () => 0)
const orgLastUpdated = useState<number>('orgLastUpdated', () => 0)

// User-Liste neu laden wenn Organigramm geändert wurde
watch(orgLastUpdated, () => {
  refreshUsers()
})

// Computed
const activeUsers = computed(() => {
  // Administrator aus der Liste ausblenden
  return (users.value || []).filter((u: any) => u.isActive && u.role !== 'administrator')
})

const filteredUsers = computed(() => {
  const filtered = showInactive.value ? (users.value || []) : activeUsers.value
  // Administrator immer ausblenden
  return filtered.filter((u: any) => u.role !== 'administrator')
})

const inactiveUsersCount = computed(() => {
  return (users.value || []).filter((u: any) => !u.isActive && u.role !== 'administrator').length
})

const filteredAndSearchedUsers = computed(() => {
  let result = [...filteredUsers.value]
  
  // Suche nach Vor- oder Nachname
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((u: any) => {
      const firstName = (u.firstName || '').toLowerCase()
      const lastName = (u.lastName || '').toLowerCase()
      const displayName = (u.displayName || '').toLowerCase()
      return firstName.includes(query) || lastName.includes(query) || displayName.includes(query)
    })
  }
  
  // Sortierung
  result.sort((a: any, b: any) => {
    let aVal: any
    let bVal: any
    
    switch (sortColumn.value) {
      case 'displayName':
        aVal = (a.displayName || '').toLowerCase()
        bVal = (b.displayName || '').toLowerCase()
        break
      case 'username':
        aVal = (a.username || '').toLowerCase()
        bVal = (b.username || '').toLowerCase()
        break
      case 'role':
        aVal = a.role || ''
        bVal = b.role || ''
        break
      case 'vacationDays':
        aVal = a.vacationDays || 0
        bVal = b.vacationDays || 0
        break
      case 'teamleadId':
        // Sortiere nach Teamleiter-Name
        aVal = a.teamleadId ? getTeamleadName(a.teamleadId).toLowerCase() : 'zzz'
        bVal = b.teamleadId ? getTeamleadName(b.teamleadId).toLowerCase() : 'zzz'
        break
      case 'isActive':
        aVal = a.isActive ? 1 : 0
        bVal = b.isActive ? 1 : 0
        break
      default:
        return 0
    }
    
    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
  
  return result
})

const teamleads = computed(() => {
  return activeUsers.value.filter((u: any) => u.role === 'teamlead')
})

// Methods
const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    employee: t('roles.employee'),
    teamlead: t('roles.teamlead'),
    office: t('roles.office'),
    manager: t('roles.manager'),
    sysadmin: t('roles.sysadmin')
  }
  return labels[role] || role
}

const getTeamleadName = (teamleadId: string) => {
  const tl = users.value?.find((u: any) => u.username === teamleadId)
  return tl?.displayName || teamleadId
}

const handleAddUser = async () => {
  try {
    const response = await $fetch('/api/users', {
      method: 'POST',
      body: {
        firstName: newUser.value.firstName,
        lastName: newUser.value.lastName,
        username: newUser.value.username,
        role: newUser.value.role,
        vacationDays: newUser.value.vacationDays,
        password: newUser.value.password,
        teamleadId: newUser.value.role === 'employee' ? newUser.value.teamleadId || null : null
      }
    })

    // Zeige generierten Username in Toast
    toast.success(response.message || 'Mitarbeiter erfolgreich hinzugefügt')
    
    // Generiere PDF-Login-Anleitung in neuem Tab
    await generateLoginPDF({
      username: response.username,
      password: newUser.value.password,
      displayName: `${newUser.value.firstName} ${newUser.value.lastName}`,
      role: newUser.value.role,
      vacationDays: newUser.value.vacationDays,
      teamleadId: newUser.value.teamleadId
    })
    
    // Form zurücksetzen + neues Passwort generieren
    newUser.value = {
      lastName: '',
      firstName: '',
      username: '',
      role: '',
      teamleadId: '',
      vacationDays: 30,
      password: generatePassword()
    }

    await refreshUsers()
    
    // Trigger Organigramm Update
    usersLastUpdated.value = Date.now()
  } catch (error: any) {
    console.error('Fehler beim Hinzufügen:', error)
    toast.error(error.data?.message || 'Fehler beim Hinzufügen des Mitarbeiters')
  }
}

const startEdit = (user: any) => {
  editingUser.value = { 
    ...user,
    teamleadId: user.teamleadId || ''
  }
}

const cancelEdit = () => {
  editingUser.value = null
}

const saveEdit = async () => {
  if (!editingUser.value) return

  try {
    await $fetch(`/api/users/${editingUser.value.username}`, {
      method: 'PATCH',
      body: {
        role: editingUser.value.role,
        vacationDays: editingUser.value.vacationDays,
        teamleadId: editingUser.value.role === 'employee' ? editingUser.value.teamleadId || null : null
      }
    })

    toast.success('Mitarbeiter aktualisiert')
    editingUser.value = null
    await refreshUsers()
    
    // Trigger Organigramm Update
    usersLastUpdated.value = Date.now()
  } catch (error: any) {
    console.error('Fehler beim Aktualisieren:', error)
    toast.error(error.data?.message || 'Fehler beim Aktualisieren')
  }
}

const toggleUserStatus = async (username: string, isActive: boolean) => {
  const action = isActive ? 'aktivieren' : 'deaktivieren'

  const confirmed = await confirm({
    title: `Mitarbeiter ${action}`,
    message: `Möchten Sie diesen Mitarbeiter wirklich ${action}?`,
    confirmText: action.charAt(0).toUpperCase() + action.slice(1),
    type: 'warning'
  })
  if (!confirmed) return

  try {
    await $fetch(`/api/users/${username}`, {
      method: 'PATCH',
      body: { isActive }
    })

    toast.success(`Mitarbeiter ${isActive ? 'aktiviert' : 'deaktiviert'}`)
    await refreshUsers()
    
    // Trigger Organigramm Update
    usersLastUpdated.value = Date.now()
  } catch (error: any) {
    console.error('Fehler:', error)
    toast.error(error.data?.message || `Fehler beim ${action}`)
  }
}

const resetPassword = async (user: any) => {
  const confirmed = await confirm({
    title: 'Passwort zurücksetzen',
    message: `Möchten Sie das Passwort für ${user.displayName} wirklich zurücksetzen?`,
    confirmText: 'Zurücksetzen',
    type: 'warning'
  })
  if (!confirmed) return

  try {
    // Neues sicheres Passwort generieren
    const newPassword = generatePassword()

    // Passwort zurücksetzen
    await $fetch(`/api/users/${user.username}/reset-password`, {
      method: 'POST',
      body: { password: newPassword }
    })

    toast.success(`Passwort für ${user.displayName} zurückgesetzt`)

    // PDF mit neuen Login-Daten generieren
    await generateLoginPDF({
      username: user.username,
      password: newPassword,
      displayName: user.displayName,
      role: user.role,
      vacationDays: user.vacationDays,
      teamleadId: user.teamleadId,
      isReset: true  // Kennzeichnung dass es ein Reset ist
    })

  } catch (error: any) {
    console.error('Fehler beim Passwort-Reset:', error)
    toast.error(error.data?.message || 'Fehler beim Zurücksetzen des Passworts')
  }
}

const toggleUserActive = async (user: any) => {
  const newStatus = !user.isActive
  const action = newStatus ? 'aktivieren' : 'deaktivieren'

  const confirmed = await confirm({
    title: `Mitarbeiter ${action}`,
    message: `Möchten Sie ${user.displayName} wirklich ${action}?`,
    confirmText: action.charAt(0).toUpperCase() + action.slice(1),
    type: 'warning'
  })
  if (!confirmed) return

  try {
    // URL-encode den Username für Umlaute
    const encodedUsername = encodeURIComponent(user.username)

    await $fetch(`/api/users/${encodedUsername}/status`, {
      method: 'PATCH',
      body: { isActive: newStatus }
    })

    // Lokale Liste aktualisieren
    if (users.value) {
      const userIndex = users.value.findIndex((u: any) => u.username === user.username)
      if (userIndex !== -1) {
        users.value[userIndex].isActive = newStatus
      }
    }

    // Trigger refresh - Liste neu laden
    await refreshUsers()

    toast.success(`${user.displayName} wurde ${newStatus ? 'aktiviert' : 'deaktiviert'}`)
  } catch (error: any) {
    console.error('Toggle active error:', error)
    toast.error(`Fehler beim ${action} des Benutzers`)
  }
}
</script>
