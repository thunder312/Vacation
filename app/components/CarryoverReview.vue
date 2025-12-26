<template>
    <div class="section-header" @click="toggleSection">
      <h3>
        <span class="toggle-icon">{{ showSection ? '▼' : '▶' }}</span>
        {{ t('vacation.carryoverReview', { year: currentYear }) }}
      </h3>
      <p v-if="!showSection" class="description-collapsed">
        Überträge aus {{ currentYear - 1 }} prüfen und genehmigen
      </p>
    </div>

    <div v-show="showSection" class="section-content">
      <p class="description">
        Prüfen Sie die automatisch berechneten Urlaubstage-Überträge und passen Sie diese bei Bedarf an.
      </p>

      <div v-if="carryovers.length > 0" class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ carryovers.length }}</div>
          <div class="stat-label">{{ t('organization.totalEmployees') }}</div>
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

      <div class="filter-row">
        <button @click="currentFilter = 'all'" :class="['filter-btn', { active: currentFilter === 'all' }]">
          Alle ({{ carryovers.length }})
        </button>
        <button @click="currentFilter = 'pending'" :class="['filter-btn', { active: currentFilter === 'pending' }]">
          Ausstehend ({{ pendingCount }})
        </button>
        <button @click="currentFilter = 'approved'" :class="['filter-btn', { active: currentFilter === 'approved' }]">
          Bestätigt ({{ approvedCount }})
        </button>
        <button @click="currentFilter = 'adjusted'" :class="['filter-btn', { active: currentFilter === 'adjusted' }]">
          Angepasst ({{ adjustedCount }})
        </button>
      </div>

      <div v-if="filteredCarryovers.length === 0" class="empty-state">
        <p v-if="currentFilter === 'all'">Keine Überträge für {{ currentYear }} vorhanden.</p>
        <p v-else>Keine {{ getFilterLabel() }} Überträge.</p>
      </div>

      <div v-else class="carryover-list">
        <div v-for="carryover in filteredCarryovers" :key="carryover.userId" class="carryover-card" :class="carryover.status">
          <div class="card-header">
            <div class="user-info">
              <strong>{{ carryover.displayName }}</strong>
              <span class="user-id">{{ carryover.userId }}</span>
            </div>
            <div class="status-badge" :class="carryover.status">{{ getStatusText(carryover.status) }}</div>
          </div>

          <div class="carryover-info">
            <div class="info-row">
              <span class="label">Verbleibend {{ currentYear - 1 }}:</span>
              <span class="value original">{{ carryover.originalDays }} {{ t('common.days') }}</span>
            </div>
            
            <div v-if="carryover.status === 'adjusted'" class="info-row adjusted">
              <span class="label">{{ t('vacation.carryoverApprovedAmount') }}</span>
              <span class="value highlight">{{ carryover.approvedDays }} {{ t('common.days') }}</span>
            </div>

            <div v-if="carryover.adjustmentReason" class="adjustment-reason">
              <strong>💬 Begründung:</strong>
              <p>{{ carryover.adjustmentReason }}</p>
              <small>Angepasst von {{ carryover.adjustedBy }} am {{ formatDate(carryover.adjustedAt) }}</small>
            </div>
          </div>

          <div v-if="carryover.status === 'pending'" class="card-actions">
            <button @click="approveCarryover(carryover)" class="btn btn-success">
              {{icons.actions.approve}} Bestätigen ({{ carryover.originalDays }} {{ t('common.days') }})
            </button>
            <button @click="openAdjustModal(carryover)" class="btn btn-warning">{{icons.actions.edit}} Anpassen</button>
          </div>

          <div v-else class="card-footer">
            <small v-if="carryover.status === 'approved'">
              {{icons.actions.approve}} Bestätigt von {{ carryover.approvedBy }} am {{ formatDate(carryover.approvedAt) }}
            </small>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAdjustModal" class="modal-overlay" @click.self="closeAdjustModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ t('vacation.carryoverAdjust') }}</h2>
          <button @click="closeAdjustModal" class="modal-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="adjust-info">
            <p><strong>{{ t('organization.employee') }}:</strong> {{ selectedCarryover?.displayName }}</p>
            <p><strong>{{ t('vacation.carryoverCalculated') }}</strong> {{ selectedCarryover?.originalDays }} {{ t('common.days') }}</p>
          </div>

          <form @submit.prevent="submitAdjustment">
            <div class="form-group">
              <label>{{ t('vacation.carryoverNewAmount') }}</label>
              <input v-model.number="adjustmentForm.newDays" type="number" step="0.5" min="0" :max="selectedCarryover?.originalDays" required />
              <small class="help-text">Max: {{ selectedCarryover?.originalDays }} {{ t('common.days') }}</small>
            </div>

            <div class="form-group">
              <label>{{ t('vacation.carryoverReasonLabel') }}</label>
              <textarea v-model="adjustmentForm.reason" rows="4" :placeholder="t('vacation.carryoverReasonPlaceholder')" required></textarea>
              <small class="help-text">Diese Begründung wird dem Mitarbeiter angezeigt.</small>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeAdjustModal" class="btn btn-secondary">{{ t('common.cancel') }}</button>
              <button type="submit" class="btn btn-warning" :disabled="saving">{{ saving ? 'Speichert...' : icons.actions.save  + ' ' + t('vacation.carryoverSave') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">

import { icons } from '~/config/icons'
const toast = useToast()
const { currentUser } = useAuth()
const { t } = useI18n()

const showSection = ref(false)
const currentYear = new Date().getFullYear()
const currentFilter = ref<'all' | 'pending' | 'approved' | 'adjusted'>('all')
const carryovers = ref<any[]>([])
const loading = ref(false)
const showAdjustModal = ref(false)
const selectedCarryover = ref<any>(null)
const adjustmentForm = ref({ newDays: 0, reason: '' })
const saving = ref(false)

const pendingCount = computed(() => carryovers.value.filter(c => c.status === 'pending').length)
const approvedCount = computed(() => carryovers.value.filter(c => c.status === 'approved').length)
const adjustedCount = computed(() => carryovers.value.filter(c => c.status === 'adjusted').length)
const filteredCarryovers = computed(() => currentFilter.value === 'all' ? carryovers.value : carryovers.value.filter(c => c.status === currentFilter.value))

const toggleSection = () => {
  showSection.value = !showSection.value
  if (showSection.value && carryovers.value.length === 0) loadCarryovers()
}

const loadCarryovers = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/carryover/review', { params: { year: currentYear } })
    carryovers.value = data || []
  } catch (error) {
    console.error('Fehler:', error)
    toast.error('Fehler beim Laden')
  } finally {
    loading.value = false
  }
}

const approveCarryover = async (carryover: any) => {
  try {
    await $fetch(`/api/carryover/approve/${carryover.userId}`, {
      method: 'POST',
      body: { year: currentYear, approvedDays: carryover.originalDays }
    })
    carryover.status = 'approved'
    carryover.approvedBy = currentUser.value?.username
    carryover.approvedAt = new Date().toISOString()
    toast.success(`Übertrag für ${carryover.displayName} bestätigt`)
  } catch (error) {
    toast.error('Fehler beim Bestätigen')
  }
}

const openAdjustModal = (carryover: any) => {
  selectedCarryover.value = carryover
  adjustmentForm.value = { newDays: carryover.originalDays, reason: '' }
  showAdjustModal.value = true
}

const closeAdjustModal = () => {
  showAdjustModal.value = false
  selectedCarryover.value = null
}

const submitAdjustment = async () => {
  if (!selectedCarryover.value) return
  saving.value = true
  try {
    await $fetch(`/api/carryover/adjust/${selectedCarryover.value.userId}`, {
      method: 'POST',
      body: { year: currentYear, approvedDays: adjustmentForm.value.newDays, adjustmentReason: adjustmentForm.value.reason }
    })
    selectedCarryover.value.status = 'adjusted'
    selectedCarryover.value.approvedDays = adjustmentForm.value.newDays
    selectedCarryover.value.adjustmentReason = adjustmentForm.value.reason
    selectedCarryover.value.adjustedBy = currentUser.value?.username
    selectedCarryover.value.adjustedAt = new Date().toISOString()
    toast.success(`Übertrag angepasst`)
    closeAdjustModal()
  } catch (error) {
    toast.error('Fehler beim Anpassen')
  } finally {
    saving.value = false
  }
}

const getStatusText = (status: string) => ({ pending: 'Ausstehend', approved: 'Bestätigt', adjusted: 'Angepasst' }[status] || status)
const getFilterLabel = () => ({ pending: 'ausstehenden', approved: 'bestätigten', adjusted: 'angepassten' }[currentFilter.value] || '')
const formatDate = (date: string) => new Date(date).toLocaleDateString('de-DE')

onMounted(() => {
  if (currentUser.value?.role === 'manager') loadCarryovers()
})
</script>
