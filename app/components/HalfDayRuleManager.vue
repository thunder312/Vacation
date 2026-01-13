<template>
  <div class="half-day-manager">
    <h2>{{ t('vacation.halfDayRules') }}</h2>
    <p class="description">
      Definieren Sie besondere Tage, die nur als halbe Urlaubstage zählen (z.B. Heiligabend, Silvester).
    </p>

    <!-- Formular zum Hinzufügen (nur für Manager) -->
    <div v-if="isEditable" class="add-rule-form">
      <h3>{{ t('vacation.addHalfDay') }}</h3>
      <form @submit.prevent="handleAddRule">
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('vacation.halfDayDate') }}</label>
            <input v-model="newDate" type="date" required />
          </div>
          <div class="form-group">
            <label>{{ t('vacation.halfDayDescription') }}</label>
            <input 
              v-model="newDescription" 
              type="text" 
              :placeholder="t('vacation.halfDayDescriptionPlaceholder')"
              required 
            />
          </div>
        </div>
        <button type="submit" class="btn-primary">{{ t('vacation.addHalfDay') }}</button>
      </form>
    </div>

    <!-- Liste der Regelungen -->
    <div class="rules-list">
      <h3>Definierte Halbtage ({{ allRules?.length || 0 }})</h3>
      
      <div v-if="!allRules || allRules.length === 0" class="empty-state">
        {{ t('vacation.noHalfDayRules') }}
      </div>

      <div v-for="rule in allRules || []" :key="rule.id" class="rule-card">
        <div class="rule-header">
          <div>
            <strong>{{ formatDate(rule.date) }}</strong>
            <span class="rule-description">{{ rule.description }}</span>
          </div>
          <button
            v-if="isEditable"
            @click="handleRemoveRule(rule.id)"
            class="delete-btn"
            :title="t('common.delete')"
          >
            {{ icons.actions?.delete || '🗑️' }}
          </button>
        </div>
        <div class="rule-footer">
          <small>
            Erstellt am {{ formatDate(rule.createdAt) }}
          </small>
        </div>
      </div>
    </div>

    <!-- Info-Box -->
    <div class="info-box">
      <h4>{{ icons.ui?.info || 'ℹ️' }} Hinweis</h4>
      <p>
        Halbtage werden automatisch bei der Berechnung der Urlaubstage berücksichtigt. 
        Ein definierter Halbtag zählt als 0,5 Urlaubstage statt 1 voller Tag.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/dateHelpers'
import { icons } from '~/config/icons'

const { t } = useI18n()
const { confirm } = useConfirm()
const { addHalfDayRule, removeHalfDayRule, halfDayRules } = useHalfDayRules()
const { currentUser } = useAuth()

const newDate = ref('')
const newDescription = ref('')

const allRules = halfDayRules

const isEditable = computed(() => {
  return currentUser.value?.role === 'manager'
})

const handleAddRule = async () => {
  if (!currentUser.value || !isEditable.value) return
  
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
  if (!isEditable.value) return

  const confirmed = await confirm({
    title: t('common.delete'),
    message: t('confirm.deleteMessage'),
    confirmText: t('common.delete'),
    type: 'danger'
  })
  if (confirmed) {
    await removeHalfDayRule(id)
  }
}
</script>
