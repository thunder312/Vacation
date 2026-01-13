<template>
  <div v-if="request" class="request-card">
    <div class="request-header">
      <span class="request-date">
        {{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}
      </span>
      <span :class="['status', request.status]">
        {{ getStatusTextWithIcon(request.status) }}
      </span>
    </div>
    <p v-if="request.reason" class="request-reason">{{ request.reason }}</p>

    <!-- Rückbuchungs-Hinweis -->
    <div v-if="hasExceptions" class="exceptions-info">
      <div class="exceptions-header">
        {{ icons.vacation?.exception || '⚠️' }} <strong>Rückbuchung(en):</strong>
      </div>
      <ul class="exceptions-list">
        <li v-for="exc in exceptions" :key="exc.id">
          {{ formatDate(exc.date) }}: {{ exc.reason }}
          <span class="exception-deduction">(-{{ exc.deduction }} {{ exc.deduction === 1 ? 'Tag' : 'Tage' }})</span>
        </li>
      </ul>
    </div>

    <div class="request-footer">
      <small>
        {{ t('vacation.vacationDays') }}:
        <template v-if="hasExceptions">
          <span class="original-days" :title="'Ursprünglich: ' + originalDays + ' Tage'">
            {{ vacationDays }}
          </span>
          <span class="days-note">({{ originalDays }} - {{ totalDeduction }} = {{ vacationDays }})</span>
        </template>
        <template v-else>
          {{ vacationDays }}
        </template>
        ({{ calculateDays(request.startDate, request.endDate) }} {{ t('common.days') }}  {{ t('common.total')}})
      </small>

      <!-- Zurückziehen-Button nur bei pending Status -->
      <button
        v-if="request.status === 'pending'"
        @click="handleWithdraw"
        class="btn-withdraw"
        :title="t('vacation.withdrawRequest')"
      >
        {{ icons.vacation?.withdraw || '↩️' }} {{ t('vacation.withdrawRequest') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VacationRequest } from '~/types/vacation'
import { formatDate, calculateDays, calculateWorkdays, getStatusTextWithIcon } from '~/utils/dateHelpers'
import { useEventBus } from '~/composables/useEventBus'
import { icons } from '~/config/icons'

const props = defineProps<{
  request: VacationRequest | null
}>()

const { t } = useI18n()
const { halfDayRules } = useHalfDayRules()
const { on, off } = useEventBus()
const { withdrawRequest } = useVacationRequests()
const { confirm } = useConfirm()

// Zurückziehen-Handler
const handleWithdraw = async () => {
  if (!props.request) return

  const confirmed = await confirm(t('vacation.withdrawConfirm'))
  if (!confirmed) return

  await withdrawRequest(props.request.id)
}

// Lade Exceptions für diese Vacation Request
const exceptions = ref<any[]>([])
const loadingExceptions = ref(false)

const loadExceptions = async () => {
  if (!props.request?.id) {
    exceptions.value = []
    return
  }

  loadingExceptions.value = true
  try {
    const allExceptions = await $fetch<any[]>('/api/vacation-exceptions', {
      params: { userId: props.request.userId }
    })

    // Filtere nur Exceptions für diese spezifische Vacation Request
    exceptions.value = allExceptions.filter(e => e.vacationRequestId === props.request!.id)
  } catch (error) {
    console.error('Failed to load exceptions:', error)
    exceptions.value = []
  } finally {
    loadingExceptions.value = false
  }
}

// Computed Properties
const hasExceptions = computed(() => exceptions.value.length > 0)

const totalDeduction = computed(() => {
  return exceptions.value.reduce((sum, exc) => sum + exc.deduction, 0)
})

const originalDays = computed(() => {
  if (!props.request) return 0
  const halfDayDates = (halfDayRules.value || []).map(rule => rule.date)
  return calculateWorkdays(props.request.startDate, props.request.endDate, halfDayDates)
})

const vacationDays = computed(() => {
  if (!props.request) return 0
  const halfDayDates = (halfDayRules.value || []).map(rule => rule.date)

  // Erstelle Exceptions-Array im richtigen Format für calculateWorkdays
  const exceptionsList = exceptions.value.map(e => ({
    date: e.date,
    deduction: e.deduction
  }))

  return calculateWorkdays(
    props.request.startDate,
    props.request.endDate,
    halfDayDates,
    exceptionsList
  )
})

// Lade Exceptions wenn Request sich ändert
watch(() => props.request?.id, () => {
  loadExceptions()
}, { immediate: true })

// Event-Handler für neue Exceptions
const handleExceptionCreated = (data?: any) => {
  // Reload exceptions wenn eine neue Exception für irgendeinen Request erstellt wird
  loadExceptions()
}

// Lifecycle Hooks
onMounted(() => {
  on('vacation-exception-created', handleExceptionCreated)
})

onUnmounted(() => {
  off('vacation-exception-created', handleExceptionCreated)
})
</script>

<style scoped>
.exceptions-info {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 0.75rem;
  margin: 0.75rem 0;
  border-radius: 4px;
}

.exceptions-header {
  margin-bottom: 0.5rem;
  color: #856404;
  font-size: 0.9rem;
}

.exceptions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exceptions-list li {
  padding: 0.25rem 0;
  color: #856404;
  font-size: 0.875rem;
}

.exception-deduction {
  font-weight: 600;
  color: #d63384;
  margin-left: 0.5rem;
}

.original-days {
  font-weight: 600;
  color: var(--color-primary);
}

.days-note {
  font-size: 0.85rem;
  color: var(--color-gray-600);
  margin-left: 0.25rem;
  font-style: italic;
}

.request-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-withdraw {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  background: var(--color-gray-100);
  border: 1px solid var(--color-gray-300);
  color: var(--color-gray-700);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-withdraw:hover {
  background: var(--color-warning-light, #fff3cd);
  border-color: var(--color-warning, #ffc107);
  color: var(--color-warning-dark, #856404);
}
</style>
