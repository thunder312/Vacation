<template>
  <div class="request-card approval">
    <div class="request-header">
      <div>
        <strong>{{ request.user }}</strong>
        <span class="request-date">
          {{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}
        </span>
      </div>
      <span :class="['status', request.status]">
        {{ getStatusTextWithIcon(request.status) }}
      </span>
    </div>
    <p v-if="request.reason" class="request-reason">{{ request.reason }}</p>

    <div v-if="showTeamleadApproval && request.teamleadApprovalDate" class="approval-info">
      <small>✓ Genehmigt von Teamlead am {{ formatDate(request.teamleadApprovalDate) }}</small>
    </div>

    <div class="request-footer">
      <small>
        Urlaubstage: {{ vacationDays }}
        ({{ calculateDays(request.startDate, request.endDate) }} Tage gesamt)
      </small>
    </div>

    <div class="approval-actions">
      <button @click="emit('approve', request.id, approvalLevel || 'teamlead')" class="approve-btn">
        ✓ Genehmigen
      </button>
      <button @click="emit('reject', request.id)" class="reject-btn">
        ✗ Ablehnen
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VacationRequest } from '~/types/vacation'
import { formatDate, calculateDays, calculateWorkdays, getStatusTextWithIcon } from '~/utils/dateHelpers'

const props = defineProps<{
  request: VacationRequest
  approvalLevel?: 'teamlead' | 'manager'
}>()

const { halfDayRules } = useHalfDayRules()

const vacationDays = computed(() => {
  const halfDayDates = (halfDayRules.value || []).map(rule => rule.date)
  return calculateWorkdays(props.request.startDate, props.request.endDate, halfDayDates)
})

const emit = defineEmits<{
  approve: [id: number, level: 'teamlead' | 'manager']
  reject: [id: number]
}>()
</script>
