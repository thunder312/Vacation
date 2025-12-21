<template>
  <div class="user-management">
    <h2>Mitarbeiterverwaltung</h2>

    <!-- Neuen Mitarbeiter hinzufügen -->
    <div class="add-user-section">
      <h3>Neuen Mitarbeiter hinzufügen</h3>
      <form @submit.prevent="handleAddUser" class="user-form">
        <div class="form-row">
          <div class="form-group">
            <label>Nachname *</label>
            <input v-model="newUser.lastName" type="text" required />
          </div>
          <div class="form-group">
            <label>Vorname *</label>
            <input v-model="newUser.firstName" type="text" required />
          </div>
        </div>

        <!-- Username Preview -->
        <div v-if="previewUsername" class="username-preview">
          <strong>Generierter Benutzername:</strong> {{ previewUsername }}
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Rolle *</label>
            <select v-model="newUser.role" required>
              <option value="">Bitte wählen...</option>
              <option value="employee">Mitarbeiter</option>
              <option value="teamlead">Teamleiter</option>
              <option value="office">Office</option>
              <option value="sysadmin">System-Admin</option>
            </select>
          </div>

          <div v-if="newUser.role === 'employee'" class="form-group">
            <label>Teamleiter</label>
            <select v-model="newUser.teamleadId">
              <option value="">Keiner</option>
              <option v-for="tl in teamleads" :key="tl.username" :value="tl.username">
                {{ tl.displayName }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Urlaubstage pro Jahr *</label>
            <input v-model.number="newUser.vacationDays" type="number" min="0" max="50" required />
            <small>Standard: 30 Tage. Reduzieren bei Eintritt mitten im Jahr.</small>
          </div>

          <div class="form-group">
            <label>Passwort *</label>
            <div class="password-field">
              <input v-model="newUser.password" type="text" required />
              <button type="button" @click="newUser.password = generatePassword()" class="btn-regenerate" title="Neues Passwort generieren">
                🔄
              </button>
            </div>
            <small>Sicheres Passwort - kann bearbeitet werden</small>
          </div>
        </div>

        <button type="submit" class="btn-primary">Mitarbeiter hinzufügen</button>
      </form>
    </div>

    <!-- Bestehende Mitarbeiter -->
    <div class="users-list">
      <div class="section-header" @click="toggleUsersSection">
        <h3>
          <span class="toggle-icon">{{ showUsersSection ? '▼' : '▶' }}</span>
          Bestehende Mitarbeiter bearbeiten ({{ activeUsers.length }})
        </h3>
      </div>
      
      <div v-show="showUsersSection" class="users-section-content">
        <div class="filters-row">
          <div class="search-filter">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="🔍 Nach Vor- oder Nachname suchen..."
              class="search-input"
            />
          </div>
          <div class="checkbox-filter">
            <label>
              <input type="checkbox" v-model="showInactive" />
              Deaktivierte anzeigen ({{ inactiveUsersCount }})
            </label>
          </div>
        </div>

        <div v-if="filteredAndSearchedUsers.length === 0" class="empty-state">
          Keine Mitarbeiter gefunden
        </div>

        <!-- Kompakte Tabellenansicht -->
        <table v-else class="users-table">
          <thead>
            <tr>
              <th @click="sortBy('displayName')" class="sortable">
                Name 
                <span class="sort-indicator" :class="{ active: sortColumn === 'displayName' }">
                  {{ sortColumn === 'displayName' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲' }}
                </span>
              </th>
              <th @click="sortBy('username')" class="sortable">
                Username
                <span class="sort-indicator" :class="{ active: sortColumn === 'username' }">
                  {{ sortColumn === 'username' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲' }}
                </span>
              </th>
              <th @click="sortBy('role')" class="sortable">
                Rolle
                <span class="sort-indicator" :class="{ active: sortColumn === 'role' }">
                  {{ sortColumn === 'role' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲' }}
                </span>
              </th>
              <th @click="sortBy('vacationDays')" class="sortable">
                Urlaubstage
                <span class="sort-indicator" :class="{ active: sortColumn === 'vacationDays' }">
                  {{ sortColumn === 'vacationDays' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲' }}
                </span>
              </th>
              <th @click="sortBy('teamleadId')" class="sortable">
                Teamleiter
                <span class="sort-indicator" :class="{ active: sortColumn === 'teamleadId' }">
                  {{ sortColumn === 'teamleadId' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲' }}
                </span>
              </th>
              <th @click="sortBy('isActive')" class="sortable">
                Status
                <span class="sort-indicator" :class="{ active: sortColumn === 'isActive' }">
                  {{ sortColumn === 'isActive' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲' }}
                </span>
              </th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredAndSearchedUsers" :key="user.username" :class="{ 'inactive-row': !user.isActive }">
            <!-- Bearbeiten-Modus -->
            <template v-if="editingUser?.username === user.username">
              <td colspan="7" class="edit-cell">
                <div class="inline-edit-form">
                  <div class="edit-group">
                    <strong>{{ user.displayName }}</strong>
                  </div>
                  <div class="edit-group">
                    <label>Rolle:</label>
                    <select v-model="editingUser.role">
                      <option value="employee">Mitarbeiter</option>
                      <option value="teamlead">Teamleiter</option>
                      <option value="office">Office</option>
                      <option value="sysadmin">System-Admin</option>
                    </select>
                  </div>
                  <div class="edit-group">
                    <label>Urlaubstage:</label>
                    <input v-model.number="editingUser.vacationDays" type="number" min="0" max="50" />
                  </div>
                  <div v-if="editingUser.role === 'employee'" class="edit-group">
                    <label>Teamleiter:</label>
                    <select v-model="editingUser.teamleadId">
                      <option value="">Keiner</option>
                      <option v-for="tl in teamleads" :key="tl.username" :value="tl.username">
                        {{ tl.displayName }}
                      </option>
                    </select>
                  </div>
                  <div class="edit-actions">
                    <button @click="saveEdit" class="btn-save">💾 Speichern</button>
                    <button @click="cancelEdit" class="btn-cancel">❌ Abbrechen</button>
                  </div>
                </div>
              </td>
            </template>

            <!-- Normal-Ansicht -->
            <template v-else>
              <td>
                <strong>{{ user.displayName }}</strong>
                <span v-if="!user.isActive" class="inactive-badge-small">🚫</span>
              </td>
              <td class="username-cell">{{ user.username }}</td>
              <td>
                <span class="role-badge" :class="'role-' + user.role">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="center">{{ user.vacationDays }} Tage</td>
              <td>{{ user.teamleadId ? getTeamleadName(user.teamleadId) : '—' }}</td>
              <td class="center">
                <span v-if="user.isActive" class="status-active">✓ Aktiv</span>
                <span v-else class="status-inactive">○ Inaktiv</span>
              </td>
              <td class="actions-cell">
                <button 
                  v-if="user.isActive && user.role !== 'manager'" 
                  @click="startEdit(user)" 
                  class="btn-icon"
                  title="Bearbeiten"
                >
                  ✏️
                </button>
                <button
                  v-if="user.role !== 'manager'"
                  @click="resetPassword(user)"
                  class="btn-icon btn-warning"
                  title="Passwort zurücksetzen"
                >
                  🔑
                </button>
                <button 
                  v-if="user.isActive && user.role !== 'manager'"
                  @click="toggleUserStatus(user.username, false)" 
                  class="btn-icon btn-danger"
                  title="Deaktivieren"
                >
                  🚫
                </button>
                <button 
                  v-if="!user.isActive"
                  @click="toggleUserStatus(user.username, true)"
                  class="btn-icon btn-success"
                  title="Aktivieren"
                >
                  ✅
                </button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- Jahreswechsel Panel -->
    <YearTransitionPanel />
    
    <!-- Carryover Review Panel -->
    <CarryoverReview />
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const { t } = useI18n()

// State
const newUser = ref({
  lastName: '',
  firstName: '',
  role: '',
  teamleadId: '',
  vacationDays: 30,
  password: ''  // Generiertes Passwort
})

const editingUser = ref<any>(null)
const showInactive = ref(false)
const showUsersSection = ref(false)  // Standardmäßig eingeklappt
const searchQuery = ref('')
const sortColumn = ref<string>('displayName')
const sortDirection = ref<'asc' | 'desc'>('asc')

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

// Generiere Username-Preview (ohne DB-Check)
const previewUsername = computed(() => {
  if (!newUser.value.firstName || !newUser.value.lastName) {
    return ''
  }
  // Einfache Preview - echter Username wird im Backend mit Konfliktprüfung generiert
  const firstLower = newUser.value.firstName.toLowerCase()
  const lastLower = newUser.value.lastName.toLowerCase()
  return lastLower + ' (oder ' + firstLower.charAt(0) + lastLower + ' falls vergeben)'
})

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
  doc.text('Passwort:', 30, y)
  doc.setFont('courier', 'normal')
  doc.setFontSize(14)
  doc.text(userInfo.password, 80, y)
  doc.setFontSize(12)
  
  y += 15
  
  // Rolle
  const roleLabels: Record<string, string> = {
    employee: 'Mitarbeiter',
    teamlead: 'Teamleiter',
    office: 'Office',
    manager: 'Manager'
  }
  
  doc.setFont('helvetica', 'bold')
  doc.text('Ihre Rolle:', 30, y)
  doc.setFont('helvetica', 'normal')
  doc.text(roleLabels[userInfo.role] || userInfo.role, 80, y)
  
  y += 10
  
  // Urlaubstage
  doc.setFont('helvetica', 'bold')
  doc.text('Urlaubstage pro Jahr:', 30, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${userInfo.vacationDays} Tage`, 80, y)
  
  // Teamleiter (falls vorhanden)
  if (userInfo.teamleadId) {
    y += 10
    const teamlead = teamleads.value.find((tl: any) => tl.username === userInfo.teamleadId)
    doc.setFont('helvetica', 'bold')
    doc.text('Ihr Teamleiter:', 30, y)
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
  return (users.value || []).filter((u: any) => u.isActive && u.username !== 'admin')
})

const filteredUsers = computed(() => {
  const filtered = showInactive.value ? (users.value || []) : activeUsers.value
  // admin immer ausblenden
  return filtered.filter((u: any) => u.username !== 'admin')
})

const inactiveUsersCount = computed(() => {
  return (users.value || []).filter((u: any) => !u.isActive && u.username !== 'admin').length
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
    employee: 'Mitarbeiter',
    teamlead: 'Teamleiter',
    office: 'Office',
    manager: 'Manager',
    sysadmin: 'System-Admin'
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
  
  if (!confirm(`Möchten Sie diesen Mitarbeiter wirklich ${action}?`)) {
    return
  }

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
  if (!confirm(`Möchten Sie das Passwort für ${user.displayName} wirklich zurücksetzen?`)) {
    return
  }

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
</script>
