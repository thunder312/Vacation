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
        {{ getStatusText(request.status) }}
      </span>
    </div>
    <p v-if="request.reason" class="request-reason">{{ request.reason }}</p>

    <div v-if="showTeamleiterApproval && request.teamleiterApprovalDate" class="approval-info">
      <small>✓ Genehmigt von Teamleiter am {{ formatDate(request.teamleiterApprovalDate) }}</small>
    </div>

    <div class="request-footer">
      <small>Tage: {{ calculateDays(request.startDate, request.endDate) }}</small>
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
import { formatDate, calculateDays, getStatusText } from '~/utils/dateHelpers'

defineProps<{
  request: VacationRequest
  showTeamleiterApproval?: boolean
}>()

const emit = defineEmits<{
  approve: [id: number]
  reject: [id: number]
}>()
</script>