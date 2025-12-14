<template>
  <div class="half-day-manager">
    <h2>Firmeninterne Urlaubsregelung</h2>
    <p class="description">
      Definieren Sie besondere Tage, die nur als halbe Urlaubstage zählen (z.B. Heiligabend, Silvester).
    </p>

    <!-- Formular zum Hinzufügen -->
    <div class="add-rule-form">
      <h3>Neuen Halbtag hinzufügen</h3>
      <form @submit.prevent="handleAddRule">
        <div class="form-row">
          <div class="form-group">
            <label>Datum</label>
            <input v-model="newDate" type="date" required />
          </div>
          <div class="form-group">
            <label>Beschreibung</label>
            <input 
              v-model="newDescription" 
              type="text" 
              placeholder="z.B. Heiligabend" 
              required 
            />
          </div>
        </div>
        <button type="submit" class="btn-primary">Regelung hinzufügen</button>
      </form>
    </div>

    <!-- Liste der Regelungen -->
    <div class="rules-list">
      <h3>Definierte Halbtage ({{ allRules?.length || 0 }})</h3>
      
      <div v-if="!allRules || allRules.length === 0" class="empty-state">
        Noch keine Halbtags-Regelungen definiert
      </div>

      <div v-for="rule in allRules || []" :key="rule.id" class="rule-card">
        <div class="rule-header">
          <div>
            <strong>{{ formatDate(rule.date) }}</strong>
            <span class="rule-description">{{ rule.description }}</span>
          </div>
          <button @click="handleRemoveRule(rule.id)" class="delete-btn" title="Löschen">
            🗑️
          </button>
        </div>
        <div class="rule-footer">
          <small>
            Erstellt von {{ rule.createdBy }} am {{ formatDate(rule.createdAt) }}
          </small>
        </div>
      </div>
    </div>

    <!-- Info-Box -->
    <div class="info-box">
      <h4>ℹ️ Hinweis</h4>
      <p>
        Halbtage werden automatisch bei der Berechnung der Urlaubstage berücksichtigt. 
        Ein definierter Halbtag zählt als 0,5 Urlaubstage statt 1 voller Tag.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/dateHelpers'

const { addHalfDayRule, removeHalfDayRule, halfDayRules } = useHalfDayRules()
const { currentUser } = useAuth()

const newDate = ref('')
const newDescription = ref('')

const allRules = halfDayRules

const handleAddRule = async () => {
  if (!currentUser.value) return
  
  const success = await addHalfDayRule(
    newDate.value,
    newDescription.value
  )

  if (success) {
    newDate.value = ''
    newDescription.value = ''
  }
}

const handleRemoveRule = async (id: number) => {
  if (confirm('Möchten Sie diese Regelung wirklich löschen?')) {
    await removeHalfDayRule(id)
  }
}
</script>
