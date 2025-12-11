<template>
  <div class="request-card">
    <div class="request-header">
      <span class="request-date">
        {{ formatDate(request.startDate) }} - {{ formatDate(request.endDate) }}
      </span>
      <span :class="['status', request.status]">
        {{ getStatusText(request.status) }}
      </span>
    </div>
    <p v-if="request.reason" class="request-reason">{{ request.reason }}</p>
    <div class="request-footer">
      <small>Tage: {{ calculateDays(request.startDate, request.endDate) }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VacationRequest } from '~/types/vacation'
import { formatDate, calculateDays, getStatusText } from '~/utils/dateHelpers'

defineProps<{
  request: VacationRequest
}>()
</script>