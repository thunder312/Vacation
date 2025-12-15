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

        <div class="form-row">
          <div class="form-group">
            <label>Rolle *</label>
            <select v-model="newUser.role" required>
              <option value="">Bitte wählen...</option>
              <option value="employee">Mitarbeiter</option>
              <option value="teamlead">Teamleiter</option>
              <option value="office">Office</option>
            </select>
          </div>

          <div v-if="newUser.role === 'employee'" class="form-group">
            <label>Teamleiter</label>
            <select v-model="newUser.teamleadId">
              <option value="">Keiner</option>
              <option v-for="tl in teamleads" :key="tl.userId" :value="tl.userId">
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
        </div>

        <button type="submit" class="btn-primary">Mitarbeiter hinzufügen</button>
      </form>
    </div>

    <!-- Bestehende Mitarbeiter -->
    <div class="users-list">
      <h3>Bestehende Mitarbeiter ({{ activeUsers.length }})</h3>
      
      <div class="filters">
        <label>
          <input type="checkbox" v-model="showInactive" />
          Deaktivierte anzeigen
        </label>
      </div>

      <div v-if="filteredUsers.length === 0" class="empty-state">
        Keine Mitarbeiter gefunden
      </div>

      <div v-for="user in filteredUsers" :key="user.username" class="user-card">
        <div class="user-header">
          <div class="user-info">
            <strong>{{ user.displayName }}</strong>
            <span class="user-role">{{ getRoleLabel(user.role) }}</span>
            <span v-if="!user.isActive" class="inactive-badge">Deaktiviert</span>
          </div>
          <div class="user-actions">
            <button 
              v-if="user.isActive && user.role !== 'manager'" 
              @click="startEdit(user)" 
              class="btn-edit"
              title="Bearbeiten"
            >
              ✏️
            </button>
            <button 
              v-if="user.isActive && user.role !== 'manager'"
              @click="toggleUserStatus(user.username, false)" 
              class="btn-deactivate"
              title="Deaktivieren"
            >
              🚫 Deaktivieren
            </button>
            <button 
              v-if="!user.isActive"
              @click="toggleUserStatus(user.username, true)" 
              class="btn-activate"
              title="Aktivieren"
            >
              ✅ Aktivieren
            </button>
          </div>
        </div>

        <div v-if="editingUser?.username === user.username" class="edit-form">
          <div class="form-row">
            <div class="form-group">
              <label>Rolle</label>
              <select v-model="editingUser.role">
                <option value="employee">Mitarbeiter</option>
                <option value="teamlead">Teamleiter</option>
                <option value="office">Office</option>
              </select>
            </div>

            <div v-if="editingUser.role === 'employee'" class="form-group">
              <label>Teamleiter</label>
              <select v-model="editingUser.teamleadId">
                <option value="">Keiner</option>
                <option v-for="tl in teamleads" :key="tl.userId" :value="tl.userId">
                  {{ tl.displayName }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Urlaubstage pro Jahr</label>
              <input v-model.number="editingUser.vacationDays" type="number" min="0" max="50" />
            </div>
          </div>

          <div class="edit-actions">
            <button @click="saveEdit" class="btn-primary">Speichern</button>
            <button @click="cancelEdit" class="btn-secondary">Abbrechen</button>
          </div>
        </div>

        <div v-else class="user-details">
          <small>Username: {{ user.username }}</small>
          <small>Urlaubstage: {{ user.vacationDays }} Tage/Jahr</small>
          <small v-if="user.teamleadId">Teamleiter: {{ getTeamleadName(user.teamleadId) }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()

// State
const newUser = ref({
  lastName: '',
  firstName: '',
  role: '',
  teamleadId: '',
  vacationDays: 30
})

const editingUser = ref<any>(null)
const showInactive = ref(false)

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

// Computed
const activeUsers = computed(() => {
  return (users.value || []).filter((u: any) => u.isActive)
})

const filteredUsers = computed(() => {
  if (showInactive.value) {
    return users.value || []
  }
  return activeUsers.value
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
    manager: 'Manager'
  }
  return labels[role] || role
}

const getTeamleadName = (teamleadId: string) => {
  const tl = users.value?.find((u: any) => u.username === teamleadId)
  return tl?.displayName || teamleadId
}

const handleAddUser = async () => {
  try {
    // Username aus Nachname generieren
    const username = newUser.value.lastName.toLowerCase()

    await $fetch('/api/users', {
      method: 'POST',
      body: {
        username,
        firstName: newUser.value.firstName,
        lastName: newUser.value.lastName,
        role: newUser.value.role,
        vacationDays: newUser.value.vacationDays,
        teamleadId: newUser.value.role === 'employee' ? newUser.value.teamleadId || null : null
      }
    })

    toast.success('Mitarbeiter erfolgreich hinzugefügt')
    
    // Form zurücksetzen
    newUser.value = {
      lastName: '',
      firstName: '',
      role: '',
      teamleadId: '',
      vacationDays: 30
    }

    await refreshUsers()
  } catch (error: any) {
    console.error('Fehler beim Hinzufügen:', error)
    toast.error(error.data?.message || 'Fehler beim Hinzufügen des Mitarbeiters')
  }
}

const startEdit = (user: any) => {
  editingUser.value = { ...user }
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
  } catch (error: any) {
    console.error('Fehler:', error)
    toast.error(error.data?.message || `Fehler beim ${action}`)
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.add-user-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.user-form {
  margin-top: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group small {
  color: #666;
  font-size: 12px;
  margin-top: 3px;
}

.btn-primary {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}

.btn-secondary:hover {
  background: #545b62;
}

.users-list {
  margin-top: 30px;
}

.filters {
  margin: 15px 0;
}

.filters label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info strong {
  font-size: 16px;
}

.user-role {
  background: #e9ecef;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.inactive-badge {
  background: #dc3545;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.btn-edit {
  background: #ffc107;
  border: none;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit:hover {
  background: #e0a800;
}

.btn-deactivate {
  background: #dc3545;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-deactivate:hover {
  background: #c82333;
}

.btn-activate {
  background: #28a745;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-activate:hover {
  background: #218838;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.user-details small {
  color: #666;
  font-size: 13px;
}

.edit-form {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
}

.edit-actions {
  margin-top: 15px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}
</style>
