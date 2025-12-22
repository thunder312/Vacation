<template>
  <div class="vacation-cancellation">
    <div class="section-header" @click="toggleSection">
      <h3>
        <span class="toggle-icon">{{ showSection ? '▼' : '▶' }}</span>
        Urlaubs-Rückbuchung
      </h3>
      <p v-if="!showSection" class="description-collapsed">
        Urlaub unterbrechen wegen Firmenveranstaltung.
      </p>
    </div>

    <div v-show="showSection" class="section-content">

      <!-- Schritt 1: Datum wählen -->
      <div class="step-section">
        <h4>1. Datum auswählen</h4>
        <div class="date-picker-group">
          <input 
            v-model="selectedDate" 
            type="date" 
            :min="minDate"
            @change="loadEmployeesOnVacation"
            class="date-input"
          />
          <button 
            @click="loadEmployeesOnVacation" 
            class="btn-secondary"
            :disabled="!selectedDate"
          >
            🔍 Mitarbeiter suchen
          </button>
        </div>
      </div>

      <!-- Schritt 2: Mitarbeiter anzeigen (nur wenn Datum gewählt) -->
      <div v-if="selectedDate && !loading" class="step-section">
        <h4>2. Betroffene Mitarbeiter auswählen</h4>
        
        <div v-if="employeesOnVacation.length === 0" class="empty-state">
          ℹ️ Keine Mitarbeiter im Urlaub am {{ formatDate(selectedDate) }}
        </div>

        <div v-else class="employees-list">
          <div class="select-all">
            <label>
              <input 
                type="checkbox" 
                :checked="allSelected"
                @change="toggleSelectAll"
              />
              <strong>Alle auswählen ({{ employeesOnVacation.length }})</strong>
            </label>
          </div>

          <div 
            v-for="emp in employeesOnVacation" 
            :key="emp.userId"
            class="employee-item"
          >
            <label>
              <input 
                type="checkbox" 
                :value="emp.userId"
                v-model="selectedEmployees"
              />
              <div class="employee-info">
                <strong>{{ emp.displayName }}</strong>
                <span class="vacation-period">
                  {{ formatDate(emp.startDate) }} - {{ formatDate(emp.endDate) }}
                  ({{ emp.totalDays }} Tage)
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Schritt 3: Tage und Beschreibung -->
      <div v-if="selectedEmployees.length > 0" class="step-section">
        <h4>3. Rückbuchung konfigurieren</h4>
        
        <div class="form-row">
          <div class="form-group">
            <label>Anzahl Tage zurückbuchen *</label>
            <select v-model.number="daysToCancel" required>
              <option value="">Bitte wählen...</option>
              <option value="0.5">0.5 Tage (halber Tag)</option>
              <option value="1">1 Tag</option>
              <option value="1.5">1.5 Tage</option>
              <option value="2">2 Tage</option>
              <option value="2.5">2.5 Tage</option>
              <option value="3">3 Tage</option>
            </select>
            <small>In 0.5-Tage-Schritten</small>
          </div>
        </div>

        <div class="form-group">
          <label>Beschreibung / Grund *</label>
          <textarea 
            v-model="description"
            placeholder="z.B. Firmenveranstaltung, Kundentermin, Notfall..."
            rows="3"
            required
            maxlength="500"
          ></textarea>
          <small>{{ description.length }}/500 Zeichen</small>
        </div>

        <!-- Vorschau -->
        <div class="cancellation-preview">
          <h5>📋 Vorschau:</h5>
          <ul>
            <li><strong>Datum:</strong> {{ formatDate(selectedDate) }}</li>
            <li><strong>Betroffene:</strong> {{ selectedEmployees.length }} Mitarbeiter</li>
            <li><strong>Rückbuchung:</strong> {{ daysToCancel }} Tage pro Person</li>
            <li><strong>Gesamt:</strong> {{ selectedEmployees.length * daysToCancel }} Urlaubstage</li>
          </ul>
        </div>

        <!-- Submit -->
        <div class="action-buttons">
          <button 
            @click="askConfirmation"
            class="btn-primary"
            :disabled="!canSubmit || submitting"
          >
            {{ submitting ? '⏳ Wird verarbeitet...' : '✅ Rückbuchung durchführen' }}
          </button>
          <button 
            @click="resetForm"
            class="btn-secondary"
            :disabled="submitting"
          >
            ❌ Zurücksetzen
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        ⏳ Lade Daten...
      </div>
    </div>

    <!-- Bestätigungs-Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h3>⚠️ Rückbuchung bestätigen</h3>
          <button @click="showConfirmModal = false" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <p><strong>Möchten Sie wirklich fortfahren?</strong></p>
          <ul class="confirm-details">
            <li>📅 Datum: <strong>{{ formatDate(selectedDate) }}</strong></li>
            <li>👥 Mitarbeiter: <strong>{{ selectedEmployees.length }}</strong></li>
            <li>⏱️ Tage pro Person: <strong>{{ daysToCancel }}</strong></li>
            <li>📊 Gesamt: <strong>{{ selectedEmployees.length * (daysToCancel || 0) }} Urlaubstage</strong></li>
          </ul>
          <p class="warning-text">
            ⚠️ Diese Aktion kann bestehende Urlaubsanträge aufteilen oder kürzen.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="showConfirmModal = false" class="btn-secondary">
            ❌ Abbrechen
          </button>
          <button @click="confirmCancellation" class="btn-danger">
            ✅ Ja, zurückbuchen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
import { formatDate } from '~/utils/dateHelpers'

// State
const showSection = ref(false)
const selectedDate = ref('')
const employeesOnVacation = ref<any[]>([])
const selectedEmployees = ref<string[]>([])
const daysToCancel = ref<number | ''>('')
const description = ref('')
const loading = ref(false)
const submitting = ref(false)
const showConfirmModal = ref(false)

// Min date = heute
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const allSelected = computed(() => {
  return employeesOnVacation.value.length > 0 && 
         selectedEmployees.value.length === employeesOnVacation.value.length
})

const canSubmit = computed(() => {
  return selectedEmployees.value.length > 0 && 
         daysToCancel.value !== '' && 
         description.value.trim().length > 0
})

const toggleSection = () => {
  showSection.value = !showSection.value
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedEmployees.value = []
  } else {
    selectedEmployees.value = employeesOnVacation.value.map(e => e.userId)
  }
}

// Lade Mitarbeiter die am gewählten Datum Urlaub haben
const loadEmployeesOnVacation = async () => {
  if (!selectedDate.value) return

  loading.value = true
  try {
    const response = await $fetch('/api/vacation/on-date', {
      params: { date: selectedDate.value }
    })
    
    employeesOnVacation.value = response || []
    selectedEmployees.value = []
    
    if (employeesOnVacation.value.length === 0) {
      toast.info('Keine Mitarbeiter im Urlaub an diesem Tag')
    } else {
      toast.success(`${employeesOnVacation.value.length} Mitarbeiter gefunden`)
    }
  } catch (error: any) {
    console.error('Fehler beim Laden:', error)
    toast.error('Fehler beim Laden der Mitarbeiter')
    employeesOnVacation.value = []
  } finally {
    loading.value = false
  }
}

// Zeige Bestätigungs-Modal
const askConfirmation = () => {
  if (!canSubmit.value) return
  showConfirmModal.value = true
}

// Bestätige Rückbuchung
const confirmCancellation = async () => {
  showConfirmModal.value = false
  submitting.value = true
  
  try {
    const response = await $fetch('/api/vacation/cancel-days', {
      method: 'POST',
      body: {
        date: selectedDate.value,
        userIds: selectedEmployees.value,
        daysToCancel: daysToCancel.value,
        description: description.value.trim()
      }
    })

    toast.success(`Erfolgreich ${response.affectedRequests} Urlaubsanträge angepasst`)
    resetForm()
  } catch (error: any) {
    console.error('Fehler bei Rückbuchung:', error)
    toast.error(error.data?.message || 'Fehler bei der Rückbuchung')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  selectedDate.value = ''
  employeesOnVacation.value = []
  selectedEmployees.value = []
  daysToCancel.value = ''
  description.value = ''
}
</script>
