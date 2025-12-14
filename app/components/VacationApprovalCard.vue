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

<style scoped>
.request-card {
  background: var(--color-gray-50);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  border-left: 4px solid var(--color-gray-300);
}

.request-card.approval {
  border-left-color: var(--color-primary);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.request-header strong {
  display: block;
  color: var(--color-gray-800);
  font-size: 1.125rem;
}

.request-date {
  display: block;
  color: var(--color-gray-600);
  font-size: 0.875rem;
  margin-top: var(--spacing-xs);
}

.status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status.pending {
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.status.teamlead_approved {
  background: var(--color-info-light);
  color: var(--color-info-dark);
}

.status.approved {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.status.rejected {
  background: var(--color-error-light);
  color: var(--color-error-dark);
}

.request-reason {
  margin: var(--spacing-sm) 0;
  color: var(--color-gray-700);
  font-style: italic;
}

.approval-info {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-success-light);
  border-radius: var(--radius-sm);
  color: var(--color-success-dark);
}

.request-footer {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-gray-200);
  color: var(--color-gray-600);
}

.approval-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.approve-btn,
.reject-btn {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.approve-btn {
  background: var(--color-success);
  color: white;
}

.approve-btn:hover {
  background: var(--color-success-dark);
}

.reject-btn {
  background: var(--color-error);
  color: white;
}

.reject-btn:hover {
  background: var(--color-error-dark);
}
</style>
