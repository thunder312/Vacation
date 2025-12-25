<template>
  <div class="vacation-balance-card">
    <h3>{{ t('vacation.myVacation') }} {{ balance.year }}</h3>
    
    <div v-if="balance.carryoverDays > 0" class="carryover-info">
      ℹ️ {{ t('vacation.carryoverIncluding', { days: balance.carryoverDays, year: balance.year - 1 }) }}
    </div>

    <div class="balance-overview">
      <div class="balance-item total">
        <div class="balance-label">{{ t('vacation.totalDays') }}</div>
        <div class="balance-value">{{ balance.totalDays }}</div>
        <div class="balance-unit">{{ t('common.days') }}</div>
        <div v-if="balance.carryoverDays > 0" class="balance-breakdown">
          {{ balance.standardDays }} + {{ balance.carryoverDays }}
        </div>
      </div>

      <div class="balance-separator">−</div>

      <div class="balance-item used">
        <div class="balance-label">{{ t('vacation.usedDays') }}</div>
        <div class="balance-value">{{ balance.usedDays }}</div>
        <div class="balance-unit">{{ t('common.days') }}</div>
      </div>

      <div class="balance-separator">=</div>

      <div class="balance-item remaining" :class="{ warning: balance.remainingDays < 5, critical: balance.remainingDays < 0 }">
        <div class="balance-label">{{ t('vacation.remainingDays') }}</div>
        <div class="balance-value">{{ balance.remainingDays }}</div>
        <div class="balance-unit">{{ t('common.days') }}</div>
      </div>
    </div>

    <div v-if="balance.remainingDays < 5 && balance.remainingDays >= 0" class="balance-warning">
      ⚠️ Nur noch {{ balance.remainingDays }} {{ t('vacation.remainingDays') }} verfügbar
    </div>

    <div v-if="balance.remainingDays < 0" class="balance-error">
      ❌ Sie haben {{ Math.abs(balance.remainingDays) }} {{ t('common.days') }} zu viel beantragt!
    </div>

    <div class="balance-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progressPercentage + '%' }"
          :class="{ warning: balance.remainingDays < 5, critical: balance.remainingDays < 0 }"
        ></div>
      </div>
      <div class="progress-label">
        {{ Math.round(progressPercentage) }}% genutzt
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VacationBalance } from '~/types/vacation'

const { t } = useI18n()

const props = defineProps<{
  balance: VacationBalance
}>()

const progressPercentage = computed(() => {
  const percentage = (props.balance.usedDays / props.balance.totalDays) * 100
  return Math.min(Math.max(percentage, 0), 100)
})
</script>
