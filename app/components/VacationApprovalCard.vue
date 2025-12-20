<template>
  <div class="request-card approval">
    <div class="request-header">
      <div>
        <strong>{{ request.displayName || request.userId }}</strong>
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

    <div v-if="canApprove" class="approval-actions">
      <button @click="emit('approve', request.id, approvalLevel || 'teamlead')" class="approve-btn">
        ✓ {{ t('vacation.approve') }}
      </button>
      <button @click="emit('reject', request.id)" class="reject-btn">
        ✗  {{ t('vacation.reject') }}
      </button>
    </div>

    <!-- Absagen Button für genehmigte Urlaube (nur Manager) -->
    <div v-if="canCancel" class="approval-actions">
      <button @click="emit('cancel', request.id)" class="cancel-btn">
        🚫  {{ t('vacation.cancel') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VacationRequest } from '~/types/vacation'
import { formatDate, calculateDays, calculateWorkdays, getStatusTextWithIcon } from '~/utils/dateHelpers'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  request: VacationRequest
  approvalLevel?: 'teamlead' | 'manager'
  showActions?: boolean  // Buttons zeigen oder verstecken (für readonly)
  showTeamleadApproval?: boolean  // Teamleiter-Genehmigung anzeigen
}>(), {
  showActions: true,  // Default: Buttons sind sichtbar
  showTeamleadApproval: false  // Default: Nicht anzeigen
})

const { currentUser } = useAuth()
const { halfDayRules } = useHalfDayRules()

// Buttons nur zeigen wenn:
// 1. showActions nicht explizit false ist UND
// 2. User ist Teamleiter oder Manager (nicht Office!)
const canApprove = computed(() => {
  if (props.showActions === false) return false
  return currentUser.value?.role === 'teamlead' || currentUser.value?.role === 'manager'
})

// Absagen-Button nur für Manager bei genehmigten Urlauben
const canCancel = computed(() => {
  if (props.showActions === false) return false
  return currentUser.value?.role === 'manager' && props.request.status === 'approved'
})

const vacationDays = computed(() => {
  const halfDayDates = (halfDayRules.value || []).map(rule => rule.date)
  return calculateWorkdays(props.request.startDate, props.request.endDate, halfDayDates)
})

const emit = defineEmits<{
  approve: [id: number, level: 'teamlead' | 'manager']
  reject: [id: number]
  cancel: [id: number]
}>()
</script>
