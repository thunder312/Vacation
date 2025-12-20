<template>
  <div class="carryover-manager">
    <h2>Urlaubstage-Übertrag {{ isEditable ? 'verwalten' : 'Übersicht' }}</h2>
    <p class="description">
      {{ isEditable ? 'Verwalten Sie Urlaubstage-Überträge aus dem Vorjahr für Ihre Mitarbeiter.' : 'Übersicht über die Urlaubstage-Überträge der Mitarbeiter.' }}
    </p>

    <!-- Formular zum Hinzufügen/Bearbeiten (nur für Manager) -->
    <div v-if="isEditable" class="add-carryover-form">
      <h3>Übertrag hinzufügen/bearbeiten</h3>
      <form @submit.prevent="handleSetCarryover">
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('roles.employee')}} ({{ t('users. {{ t('users.lastName') }}') }})</label>
            <input 
              v-model="newUserId" 
              type="text" 
              placeholder="z.B. Mustermann" 
              required 
            />
          </div>
          <div class="form-group">
            <label>{{ t('vacation.carryover') }} ({{ t('common.days') }})</label>
            <input 
              v-model.number="newDays" 
              type="number" 
              step="0.5"
              min="0"
              max="30"
              placeholder="z.B. 5" 
              required 
            />
          </div>
          <div class="form-group">
            <label>Verfallsdatum (Optional)</label>
            <input 
              v-model="newExpiryDate" 
              type="date" 
            />
          </div>
        </div>
        <button type="submit" class="btn-primary">Übertrag speichern</button>
      </form>
    </div>

    <!-- Liste der Überträge -->
    <div class="carryovers-list">
      <h3>Aktuelle Überträge ({{ allCarryovers?.length || 0 }})</h3>
      
      <div v-if="!allCarryovers || allCarryovers.length === 0" class="empty-state">
        Noch keine Überträge definiert
      </div>

      <div v-for="carryover in allCarryovers || []" :key="carryover.userId + '-' + carryover.year" class="carryover-card">
        <div class="carryover-header">
          <div>
            <strong>{{ getDisplayName(carryover.userId) }}</strong>
            <span class="carryover-days">{{ carryover.carryoverDays }} {{ t('common.days') }}</span>
          </div>
          <button 
            v-if="isEditable"
            @click="handleRemoveCarryover(carryover.userId, carryover.year)" 
            class="delete-btn" 
            title="{{ t('common.delete') }}"
          >
            🗑️
          </button>
        </div>
        <div class="carryover-footer">
          <small>
            Jahr: {{ carryover.year }}
            <span v-if="carryover.expiryDate">
              | Verfällt am: {{ formatDate(carryover.expiryDate) }}
              <span v-if="isExpiringSoon(carryover.userId, carryover.year)" class="expiry-warning">
                ⚠️ Läuft bald ab!
              </span>
            </span>
          </small>
        </div>
      </div>
    </div>

    <!-- Info-Box -->
    <div class="info-box">
      <h4>ℹ️ Hinweis</h4>
      <p>
        Urlaubstage-Überträge werden automatisch zum Urlaubskonto der Mitarbeiter hinzugefügt.
        Wenn ein Verfallsdatum gesetzt ist, verfallen die Tage automatisch nach diesem Datum.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/dateHelpers'

const { t } = useI18n()
const { currentUser } = useAuth()
const { setCarryover, removeCarryover, carryovers, isCarryoverExpiringSoon } = useCarryover()
const { orgNodes } = useOrganization()

const newUserId = ref('')
const newDays = ref(0)
const newExpiryDate = ref('')

const allCarryovers = carryovers

// Nur Manager können bearbeiten, Office hat nur Leserechte
const isEditable = computed(() => {
  return currentUser.value?.role === 'manager'
})

// Hole vollen Namen statt nur userId
const getDisplayName = (userId: string): string => {
  const user = orgNodes.value?.find(u => u.userId === userId)
  return user?.displayName || userId
}

const handleSetCarryover = async () => {
  const year = new Date().getFullYear()
  const expiryDate = newExpiryDate.value || undefined
  
  await setCarryover(
    newUserId.value,
    newDays.value,
    year,
    expiryDate
  )

  // Formular zurücksetzen
  newUserId.value = ''
  newDays.value = 0
  newExpiryDate.value = ''
}

const handleRemoveCarryover = async (userId: string, year: number) => {
  if (confirm(`Möchten Sie den Übertrag für ${userId} wirklich löschen?`)) {
    await removeCarryover(userId, year)
  }
}

const isExpiringSoon = (userId: string, year: number) => {
  return isCarryoverExpiringSoon(userId, year)
}
</script>
