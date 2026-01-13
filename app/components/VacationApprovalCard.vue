<template>
  <div v-if="request" class="request-card approval">
    <div class="request-header">
      <div>
        <strong v-if="request.displayName !== null">{{ request.displayName }}</strong>
        <strong v-if="request.displayName === null">{{ request.userId }}</strong>
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
      <small>{{ icons.vacation?.approve || '✓' }} Genehmigt von {{ t('roles.teamlead') }} am {{ formatDate(request.teamleadApprovalDate) }}</small>
    </div>

    <div class="request-footer">
      <small>
        {{ t('vacation.vacationDays') }}: {{ vacationDays }}
        ({{ calculateDays(request.startDate, request.endDate) }} {{ t('common.days') }} {{ t('common.total')}})
      </small>
    </div>

    <div v-if="canApprove" class="approval-actions">
      <button @click="emit('approve', request.id, approvalLevel || 'teamlead')" class="approve-btn">
        {{ icons.vacation?.approve || '✓' }} {{ t('vacation.approve') }}
      </button>
      <button @click="emit('reject', request.id)" class="reject-btn">
        {{ icons.vacation?.reject || '✗' }} {{ t('vacation.reject') }}
      </button>
    </div>

    <div v-if="canCancel" class="approval-actions">
      <button @click="emit('cancel', request.id)" class="cancel-btn">
        {{ icons.vacation?.cancel || '🚫' }} {{ t('vacation.cancel') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VacationRequest } from '~/types/vacation'
import { formatDate, calculateDays, calculateWorkdays, getStatusTextWithIcon } from '~/utils/dateHelpers'
import { icons } from '~/config/icons'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  request: VacationRequest | null
  approvalLevel?: 'teamlead' | 'manager'
  showActions?: boolean
  showTeamleadApproval?: boolean
}>(), {
  showActions: true,
  showTeamleadApproval: false
})

const { currentUser } = useAuth()
const { halfDayRules } = useHalfDayRules()

const canApprove = computed(() => {
  if (!props.request || props.showActions === false) return false
  if (props.request.status === 'approved') return false
  return currentUser.value?.role === 'teamlead' || currentUser.value?.role === 'manager'
})

const canCancel = computed(() => {
  if (!props.request || props.showActions === false) return false
  return currentUser.value?.role === 'manager' && props.request.status === 'approved'
})

const vacationDays = computed(() => {
  if (!props.request) return 0
  const halfDayDates = (halfDayRules.value || []).map(rule => rule.date)
  return calculateWorkdays(props.request.startDate, props.request.endDate, halfDayDates)
})

const emit = defineEmits<{
  approve: [id: number, level: 'teamlead' | 'manager']
  reject: [id: number]
  cancel: [id: number]
}>()
</script>
