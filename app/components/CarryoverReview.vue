<template>
    <div class="section-header" @click="toggleSection">
      <h3>
        <span class="toggle-icon">{{ showSection ? '▼' : '▶' }}</span>
        Urlaubstage-Übertrag prüfen ({{ currentYear }})
      </h3>
      <p v-if="!showSection" class="description-collapsed">
        Überträge aus {{ currentYear - 1 }} prüfen und genehmigen
      </p>
    </div>

    <!-- Content -->
    <div v-show="showSection" class="section-content">
      <p class="description">
        Prüfen Sie die automatisch berechneten Urlaubstage-Überträge und passen Sie diese bei Bedarf an.
      </p>

      <!-- Statistik -->
      <div v-if="carryovers.length > 0" class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ carryovers.length }}</div>
          <div class="stat-label">Mitarbeiter gesamt</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">{{ approvedCount }}</div>
          <div class="stat-label">Bestätigt</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">Ausstehend</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-value">{{ adjustedCount }}</div>
          <div class="stat-label">Angepasst</div>
        </div>
      </div>

      <!-- Filter -->
      <div class="filter-row">
        <button 
          @click="currentFilter = 'all'" 
          :class="['filter-btn', { active: currentFilter === 'all' }]"
        >
          Alle ({{ carryovers.length }})
        </button>
        <button 
          @click="currentFilter = 'pending'" 
          :class="['filter-btn', { active: currentFilter === 'pending' }]"
        >
          Ausstehend ({{ pendingCount }})
        </button>
        <button 
          @click="currentFilter = 'approved'" 
          :class="['filter-btn', { active: currentFilter === 'approved' }]"
        >
          Bestätigt ({{ approvedCount }})
        </button>
        <button 
          @click="currentFilter = 'adjusted'" 
          :class="['filter-btn', { active: currentFilter === 'adjusted' }]"
        >
          Angepasst ({{ adjustedCount }})
        </button>
      </div>

      <!-- Keine Daten -->
      <div v-if="filteredCarryovers.length === 0" class="empty-state">
        <p v-if="currentFilter === 'all'">Keine Überträge für {{ currentYear }} vorhanden.</p>
        <p v-else>Keine {{ getFilterLabel() }} Überträge.</p>
      </div>

      <!-- Carryover Liste -->
      <div v-else class="carryover-list">
        <div 
          v-for="carryover in filteredCarryovers" 
          :key="carryover.userId"
          class="carryover-card"
          :class="carryover.status"
        >
          <!-- Header -->
          <div class="card-header">
            <div class="user-info">
              <strong>{{ carryover.displayName }}</strong>
              <span class="user-id">{{ carryover.userId }}</span>
            </div>
            <div class="status-badge" :class="carryover.status">
              {{ getStatusText(carryover.status) }}
            </div>
          </div>

          <!-- Übertrag Info -->
          <div class="carryover-info">
            <div class="info-row">
              <span class="label">Verbleibend {{ currentYear - 1 }}:</span>
              <span class="value original">{{ carryover.originalDays }} Tage</span>
            </div>
            
            <div v-if="carryover.status === 'adjusted'" class="info-row adjusted">
              <span class="label">Genehmigter Übertrag:</span>
              <span class="value highlight">{{ carryover.approvedDays }} Tage</span>
            </div>

            <div v-if="carryover.adjustmentReason" class="adjustment-reason">
              <strong>💬 Begründung:</strong>
              <p>{{ carryover.adjustmentReason }}</p>
              <small>Angepasst von {{ carryover.adjustedBy }} am {{ formatDate(carryover.adjustedAt) }}</small>
            </div>
          </div>

          <!-- Aktionen -->
          <div v-if="carryover.status === 'pending'" class="card-actions">
            <button @click="approveCarryover(carryover)" class="btn btn-success">
              ✅ Bestätigen ({{ carryover.originalDays }} Tage)
            </button>
            <button @click="openAdjustModal(carryover)" class="btn btn-warning">
              ✏️ Anpassen
            </button>
          </div>

          <!-- Info für bereits bearbeitete -->
          <div v-else class="card-footer">
            <small v-if="carryover.status === 'approved'">
              ✅ Bestätigt von {{ carryover.approvedBy }} am {{ formatDate(carryover.approvedAt) }}
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Anpassungs-Modal -->
    <div v-if="showAdjustModal" class="modal-overlay" @click.self="closeAdjustModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Übertrag anpassen</h2>
          <button @click="closeAdjustModal" class="modal-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="adjust-info">
            <p><strong>Mitarbeiter:</strong> {{ selectedCarryover?.displayName }}</p>
            <p><strong>Berechneter Übertrag:</strong> {{ selectedCarryover?.originalDays }} Tage</p>
          </div>

          <form @submit.prevent="submitAdjustment">
            <div class="form-group">
              <label>Neuer Übertrag (Tage) *</label>
              <input 
                v-model.number="adjustmentForm.newDays"
                type="number"
                step="0.5"
                min="0"
                :max="selectedCarryover?.originalDays"
                required
              />
              <small class="help-text">
                Max: {{ selectedCarryover?.originalDays }} Tage
              </small>
            </div>

            <div class="form-group">
              <label>Begründung * (sichtbar für Mitarbeiter)</label>
              <textarea 
                v-model="adjustmentForm.reason"
                rows="4"
                placeholder="Bitte begründen Sie die Anpassung des Übertrags..."
                required
              ></textarea>
              <small class="help-text">
                Diese Begründung wird dem Mitarbeiter angezeigt.
              </small>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeAdjustModal" class="btn btn-secondary">
                Abbrechen
              </button>
              <button type="submit" class="btn btn-warning" :disabled="saving">
                {{ saving ? 'Speichert...' : '💾 Anpassung speichern' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
const toast = useToast()
const { currentUser } = useAuth()

const showSection = ref(false)
const currentYear = new Date().getFullYear()
const currentFilter = ref<'all' | 'pending' | 'approved' | 'adjusted'>('all')

// Daten
const carryovers = ref<any[]>([])
const loading = ref(false)

// Modal
const showAdjustModal = ref(false)
const selectedCarryover = ref<any>(null)
const adjustmentForm = ref({
  newDays: 0,
  reason: ''
})
const saving = ref(false)

// Computed
const pendingCount = computed(() => 
  carryovers.value.filter(c => c.status === 'pending').length
)

const approvedCount = computed(() => 
  carryovers.value.filter(c => c.status === 'approved').length
)

const adjustedCount = computed(() => 
  carryovers.value.filter(c => c.status === 'adjusted').length
)

const filteredCarryovers = computed(() => {
  if (currentFilter.value === 'all') return carryovers.value
  return carryovers.value.filter(c => c.status === currentFilter.value)
})

// Methods
const toggleSection = () => {
  showSection.value = !showSection.value
  if (showSection.value && carryovers.value.length === 0) {
    loadCarryovers()
  }
}

const loadCarryovers = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/carryover/review', {
      params: { year: currentYear }
    })
    carryovers.value = data
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    toast.error('Fehler beim Laden der Überträge')
  } finally {
    loading.value = false
  }
}

const approveCarryover = async (carryover: any) => {
  const confirmed = confirm(
    `Übertrag von ${carryover.originalDays} Tagen für ${carryover.displayName} bestätigen?`
  )
  if (!confirmed) return

  try {
    await $fetch('/api/carryover/approve', {
      method: 'POST',
      body: {
        userId: carryover.userId,
        year: currentYear,
        approvedBy: currentUser.value?.username
      }
    })

    toast.success(`✅ Übertrag für ${carryover.displayName} bestätigt`)
    await loadCarryovers()
  } catch (error) {
    console.error('Fehler:', error)
    toast.error('Fehler beim Bestätigen')
  }
}

const openAdjustModal = (carryover: any) => {
  selectedCarryover.value = carryover
  adjustmentForm.value = {
    newDays: carryover.originalDays,
    reason: ''
  }
  showAdjustModal.value = true
}

const closeAdjustModal = () => {
  showAdjustModal.value = false
  selectedCarryover.value = null
  adjustmentForm.value = { newDays: 0, reason: '' }
}

const submitAdjustment = async () => {
  if (!selectedCarryover.value) return

  saving.value = true
  try {
    await $fetch('/api/carryover/adjust', {
      method: 'POST',
      body: {
        userId: selectedCarryover.value.userId,
        year: currentYear,
        originalDays: selectedCarryover.value.originalDays,
        approvedDays: adjustmentForm.value.newDays,
        reason: adjustmentForm.value.reason,
        adjustedBy: currentUser.value?.username
      }
    })

    toast.success(`✅ Übertrag für ${selectedCarryover.value.displayName} angepasst`)
    closeAdjustModal()
    await loadCarryovers()
  } catch (error) {
    console.error('Fehler:', error)
    toast.error('Fehler beim Anpassen')
  } finally {
    saving.value = false
  }
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '⏳ Ausstehend',
    approved: '✅ Bestätigt',
    adjusted: '✏️ Angepasst'
  }
  return map[status] || status
}

const getFilterLabel = () => {
  const map: Record<string, string> = {
    pending: 'ausstehenden',
    approved: 'bestätigten',
    adjusted: 'angepassten'
  }
  return map[currentFilter.value] || ''
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('de-DE')
}
</script>

<style scoped>
.carryover-review {
  background: white;
  border-radius: 12px;
  padding: 0;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header:hover {
  background-color: var(--color-gray-50);
}

.section-header h3 {
  margin: 0 0 4px;
  font-size: 20px;
  color: var(--color-gray-900);
  display: flex;
  align-items: center;
  gap: 8px;
}

.description-collapsed {
  margin-left: 20px;
  color: var(--color-gray-500);
  font-size: 13px;
}

.section-content {
  padding: 0 24px 24px;
}

.description {
  margin: 0 0 20px;
  color: var(--color-gray-600);
  font-size: 14px;
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--color-gray-50);
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid var(--color-gray-300);
}

.stat-card.success {
  border-color: #28a745;
  background: #d4edda;
}

.stat-card.warning {
  border-color: #ffc107;
  background: #fff3cd;
}

.stat-card.danger {
  border-color: #dc3545;
  background: #f8d7da;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-gray-900);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--color-gray-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filter */
.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid var(--color-gray-300);
  background: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: var(--color-gray-50);
}

.filter-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Carryover Cards */
.carryover-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.carryover-card {
  border: 2px solid var(--color-gray-200);
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s;
}

.carryover-card.pending {
  border-color: #ffc107;
  background: #fffbf0;
}

.carryover-card.approved {
  border-color: #28a745;
  background: #f0f9f4;
}

.carryover-card.adjusted {
  border-color: #dc3545;
  background: #fff5f5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info strong {
  font-size: 16px;
  color: var(--color-gray-900);
}

.user-id {
  font-size: 13px;
  color: var(--color-gray-500);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.pending {
  background: #ffc107;
  color: #856404;
}

.status-badge.approved {
  background: #28a745;
  color: white;
}

.status-badge.adjusted {
  background: #dc3545;
  color: white;
}

/* Info */
.carryover-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: white;
  border-radius: 6px;
}

.info-row.adjusted {
  background: #ffe6e6;
}

.info-row .label {
  color: var(--color-gray-600);
  font-size: 14px;
}

.info-row .value {
  font-weight: 600;
  font-size: 15px;
}

.info-row .value.highlight {
  color: #dc3545;
  font-size: 16px;
}

.adjustment-reason {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 12px;
  border-radius: 4px;
  margin-top: 8px;
}

.adjustment-reason strong {
  display: block;
  margin-bottom: 4px;
  color: #856404;
}

.adjustment-reason p {
  margin: 4px 0;
  color: #856404;
}

.adjustment-reason small {
  color: #856404;
  opacity: 0.8;
}

/* Actions */
.card-actions {
  display: flex;
  gap: 8px;
}

.card-footer small {
  color: var(--color-gray-600);
  font-size: 13px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-warning {
  background: #ffc107;
  color: #856404;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-secondary {
  background: var(--color-gray-200);
  color: var(--color-gray-700);
}

.btn-secondary:hover {
  background: var(--color-gray-300);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-gray-500);
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--color-gray-100);
}

.modal-body {
  padding: 24px;
}

.adjust-info {
  background: var(--color-gray-50);
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.adjust-info p {
  margin: 4px 0;
  font-size: 14px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-gray-700);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-gray-300);
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-gray-500);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-gray-500);
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>
