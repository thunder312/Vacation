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