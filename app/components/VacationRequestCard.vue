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
    <div class="request-footer">
      <small>
        {{ t('vacation.vacationDays') }}: {{ vacationDays }}
        ({{ calculateDays(request.startDate, request.endDate) }} {{ t('common.days') }}  {{ t('common.total')}})
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VacationRequest } from '~/types/vacation'
import { formatDate, calculateDays, calculateWorkdays, getStatusTextWithIcon } from '~/utils/dateHelpers'

const props = defineProps<{
  request: VacationRequest | null
}>()

const { t } = useI18n()
const { halfDayRules } = useHalfDayRules()

const vacationDays = computed(() => {
  if (!props.request) return 0
  const halfDayDates = (halfDayRules.value || []).map(rule => rule.date)
  return calculateWorkdays(props.request.startDate, props.request.endDate, halfDayDates)
})
</script>
