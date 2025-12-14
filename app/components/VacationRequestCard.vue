<template>
  <div class="request-card">
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
        Urlaubstage: {{ vacationDays }}
        ({{ calculateDays(request.startDate, request.endDate) }} Tage gesamt)
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VacationRequest } from '~/types/vacation'
import { formatDate, calculateDays, calculateWorkdays, getStatusTextWithIcon } from '~/utils/dateHelpers'

const props = defineProps<{
  request: VacationRequest
}>()

const { getAllRules } = useHalfDayRules()

const vacationDays = computed(() => {
  const halfDayDates = getAllRules.value.map(rule => rule.date)
  return calculateWorkdays(props.request.startDate, props.request.endDate, halfDayDates)
})
</script>
