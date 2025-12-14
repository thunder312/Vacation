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
        Urlaubstage: {{ calculateWorkdays(request.startDate, request.endDate) }}
        ({{ calculateDays(request.startDate, request.endDate) }} Tage gesamt)
      </small>
    </div>

    <div class="approval-actions">
      <button @click="emit('approve', request.id)" class="approve-btn">
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

defineProps<{
  request: VacationRequest
  showTeamleadApproval?: boolean
}>()

const emit = defineEmits<{
  approve: [id: number]
  reject: [id: number]
}>()
</script>
