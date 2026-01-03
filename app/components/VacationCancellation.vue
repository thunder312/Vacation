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

      <div class="step-section">
        <h4>1. {{ t('common.date') }} auswählen</h4>
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
            {{icons.actions.search}} {{ t('organization.employees') }} suchen
          </button>
        </div>
      </div>

      <div v-if="selectedDate && !loading" class="step-section">
        <h4>2. Betroffene {{ t('organization.employees') }} auswählen</h4>
        
        <div v-if="employeesOnVacation.length === 0" class="empty-state">
          {{icons.ui.info}} Keine {{ t('organization.employees') }} im Urlaub am {{ formatDate(selectedDate) }}
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
                  ({{ emp.totalDays }} {{ t('common.days') }})
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div v-if="selectedEmployees.length > 0" class="step-section">
        <h4>3. Rückbuchung konfigurieren</h4>
        
        <div class="form-row">
          <div class="form-group">
            <label>Anzahl {{ t('common.days') }} zurückbuchen *</label>
            <select v-model.number="daysToCancel" required>
              <option value="">{{ t('users.roleSelect') }}</option>
              <option value="0.5">0.5 {{ t('common.days') }} (halber Tag)</option>
              <option value="1">1 {{ t('common.day') }}</option>
              <option value="1.5">1.5 {{ t('common.days') }}</option>
              <option value="2">2 {{ t('common.days') }}</option>
              <option value="2.5">2.5 {{ t('common.days') }}</option>
              <option value="3">3 {{ t('common.days') }}</option>
            </select>
            <small>In 0.5-Tage-Schritten</small>
          </div>
        </div>

        <div class="form-group">
          <label>Beschreibung / {{ t('common.reason') }} *</label>
          <textarea 
            v-model="description"
            placeholder="z.B. Firmenveranstaltung, Kundentermin, Notfall..."
            rows="3"
            required
            maxlength="500"
          ></textarea>
          <small>{{ description.length }}/500 Zeichen</small>
        </div>

        <div class="cancellation-preview">
          <h5>{{icons.roles.office}} Vorschau:</h5>
          <ul>
            <li><strong>{{ t('common.date') }}:</strong> {{ formatDate(selectedDate) }}</li>
            <li><strong>Betroffene:</strong> {{ selectedEmployees.length }} {{ t('organization.employees') }}</li>
            <li><strong>Rückbuchung:</strong> {{ daysToCancel }} {{ t('common.days') }} pro Person</li>
            <li><strong>Gesamt:</strong> {{ selectedEmployees.length * daysToCancel }} {{ t('vacation.vacationDays') }} werden abgezogen</li>
            <li><strong>Urlaub:</strong> Bleibt bestehen, wird aber um {{ daysToCancel }} Tag(e) reduziert</li>
          </ul>
        </div>

        <div class="action-buttons">
          <button 
            @click="askConfirmation"
            class="btn-primary"
            :disabled="!canSubmit || submitting"
          >
            {{ submitting ? '⏳ Wird verarbeitet...' : `${icons.actions.reject} Rückbuchung durchführen` }}
          </button>
          <button 
            @click="resetForm"
            class="btn-secondary"
            :disabled="submitting"
          >
            {{icons.ui.error}} Zurücksetzen
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        {{icons.ui.loading}} {{ t('common.loading') }}
      </div>
    </div>

    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h3>⚠️ Rückbuchung bestätigen</h3>
          <button @click="showConfirmModal = false" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <p><strong>Möchten Sie wirklich fortfahren?</strong></p>
          <ul class="confirm-details">
            <li>{{ icons.ui.calendar }} {{ t('common.date') }}: <strong>{{ formatDate(selectedDate) }}</strong></li>
            <li>{{ icons.roles.teamlead}} {{ t('organization.employees') }}: <strong>{{ selectedEmployees.length }}</strong></li>
            <li>⏱️ {{ t('common.days') }} pro Person: <strong>{{ daysToCancel }}</strong></li>
            <li>{{icons.ui.report}} Gesamt: <strong>{{ selectedEmployees.length * (daysToCancel || 0) }} {{ t('vacation.vacationDays') }}</strong> werden abgezogen</li>
          </ul>
          <div class="info-box">
            <p class="info-text">
              ℹ️ <strong>Wichtig:</strong> Der Urlaubsantrag bleibt bestehen, wird aber um die angegebenen Tage reduziert.
            </p>
            <p class="info-text">
              • <strong>0.5 Tage:</strong> Tag wird als halber Urlaubstag gewertet<br>
              • <strong>1+ Tage:</strong> Tag(e) werden komplett abgezogen
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showConfirmModal = false" class="btn-secondary">
            {{icons.ui.error}} {{ t('common.cancel') }}
          </button>
          <button @click="confirmCancellation" class="btn-danger">
            {{icons.actions.reject}} Ja, zurückbuchen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/dateHelpers'
import { icons } from '~/config/icons'
import { useEventBus } from '~/composables/useEventBus'

const { t } = useI18n()
const toast = useToast()
const { currentUser } = useAuth()
const { emit } = useEventBus()

const showSection = ref(false)
const selectedDate = ref('')
const employeesOnVacation = ref<any[]>([])
const selectedEmployees = ref<string[]>([])
const daysToCancel = ref<number | ''>('')
const description = ref('')
const loading = ref(false)
const submitting = ref(false)
const showConfirmModal = ref(false)

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

const askConfirmation = () => {
  if (!canSubmit.value) return
  showConfirmModal.value = true
}

const confirmCancellation = async () => {
  showConfirmModal.value = false
  submitting.value = true

  try {
    let successCount = 0
    let errorCount = 0
    const errors: Array<{employee: string, error: string}> = []

    // Erstelle Exception für jeden ausgewählten Mitarbeiter
    for (const userId of selectedEmployees.value) {
      const employee = employeesOnVacation.value.find(e => e.userId === userId)

      if (!employee) {
        errorCount++
        errors.push({
          employee: userId,
          error: 'Mitarbeiter nicht gefunden'
        })
        continue
      }

      try {
        const result = await $fetch('/api/vacation-exceptions', {
          method: 'POST',
          body: {
            vacationRequestId: employee.id,
            userId: userId,
            date: selectedDate.value,
            deduction: daysToCancel.value,
            reason: description.value.trim(),
            createdBy: currentUser.value?.username || 'admin'
          }
        })

        console.log(`✅ Exception created for ${employee.displayName}:`, result)
        successCount++

      } catch (err: any) {
        console.error(`❌ Error for ${employee.displayName}:`, err)
        errorCount++

        // Extract detailed error message
        const errorMsg = err.data?.statusMessage
          || err.statusMessage
          || err.message
          || 'Unbekannter Fehler'

        errors.push({
          employee: employee.displayName,
          error: errorMsg
        })
      }
    }

    // Show results with priority on errors
    if (errorCount > 0) {
      // Show detailed error list
      const errorList = errors.map(e => `• ${e.employee}: ${e.error}`).join('\n')
      toast.error(
        `${errorCount} Rückbuchung(en) fehlgeschlagen:\n${errorList}`,
        { duration: 10000 }  // Longer duration for reading
      )
    }

    if (successCount > 0) {
      const dayText = daysToCancel.value === 1 ? 'Tag' : 'Tage'
      toast.success(
        `✅ Erfolgreich: ${daysToCancel.value} ${dayText} für ${successCount} Mitarbeiter zurückgebucht`
      )

      // Notify calendar to refresh
      emit('vacation-exception-created', {
        date: selectedDate.value,
        count: successCount,
        deduction: daysToCancel.value
      })

      // Only reset form if all succeeded
      if (errorCount === 0) {
        resetForm()
      }
    }

    if (successCount === 0 && errorCount === 0) {
      toast.warning('Keine Rückbuchungen durchgeführt')
    }

  } catch (error: any) {
    console.error('❌ Kritischer Fehler bei Rückbuchung:', error)
    toast.error('Kritischer Fehler: ' + (error.message || 'Unbekannter Fehler'))
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

<style scoped>
.vacation-cancellation {
  margin: 1rem 0;
}

.section-header {
  background: var(--surface-secondary);
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s;
}

.section-header:hover {
  background: var(--surface-hover);
}

.section-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-icon {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.description-collapsed {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.875rem;
}

.section-content {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  margin-top: 1rem;
}

.step-section {
  margin-bottom: 2rem;
}

.step-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.date-picker-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.date-input {
  flex: 1;
  max-width: 200px;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.select-all {
  padding: 0.75rem;
  background: var(--surface-secondary);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.employee-item {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  transition: background 0.2s;
}

.employee-item:hover {
  background: var(--surface-secondary);
}

.employee-item label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.vacation-period {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
}

.form-group select,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.form-group small {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.cancellation-preview {
  background: var(--surface-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.cancellation-preview h5 {
  margin: 0 0 0.75rem 0;
}

.cancellation-preview ul {
  margin: 0;
  padding-left: 1.5rem;
}

.cancellation-preview li {
  margin: 0.5rem 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: 1.5rem;
}

.confirm-details {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.confirm-details li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.info-box {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.info-text {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #1565c0;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-secondary {
  background: var(--surface-secondary);
  color: var(--text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--surface-hover);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
