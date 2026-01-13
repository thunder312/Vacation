<template>
  <div v-if="balance" class="vacation-balance-card">
    <h3>{{ t('vacation.myVacation') }} {{ balance.year }}</h3>

    <div class="balance-overview">
      <div class="balance-item total">
        <div class="balance-label">{{ t('vacation.totalDays') }}</div>
        <div class="balance-value">{{ effectiveTotalDays }}</div>
        <div class="balance-unit">{{ t('common.days') }}</div>
        <div v-if="effectiveCarryoverDays > 0" class="balance-breakdown">
          {{ balance.standardDays }} + {{ effectiveCarryoverDays }}
          <span class="carryover-hint">({{ t('vacation.carryover') }} {{ balance.year - 1 }})</span>
        </div>
        <div v-if="carryoverInfo?.adjustmentReason" class="adjustment-note">
          <small>{{ icons.vacation?.note || '📝' }} {{ carryoverInfo.adjustmentReason }}</small>
        </div>
      </div>

      <div class="balance-separator">−</div>

      <div class="balance-item used">
        <div class="balance-label">{{ t('vacation.usedDays') }}</div>
        <div class="balance-value">{{ balance.usedDays }}</div>
        <div class="balance-unit">{{ t('common.days') }}</div>
      </div>

      <div class="balance-separator">=</div>

      <div class="balance-item remaining" :class="{ warning: effectiveRemainingDays < 5, critical: effectiveRemainingDays < 0 }">
        <div class="balance-label">{{ t('vacation.remainingDays') }}</div>
        <div class="balance-value">{{ effectiveRemainingDays }}</div>
        <div class="balance-unit">{{ t('common.days') }}</div>
      </div>
    </div>

    <div v-if="effectiveRemainingDays < 5 && effectiveRemainingDays >= 0" class="balance-warning">
      {{ icons.vacation?.warning || '⚠️' }} Nur noch {{ effectiveRemainingDays }} {{ t('vacation.remainingDays') }} verfügbar
    </div>

    <div v-if="effectiveRemainingDays < 0" class="balance-error">
      {{ icons.ui?.warning || '⚠️' }} Sie haben {{ Math.abs(effectiveRemainingDays) }} {{ t('common.days') }} zu viel beantragt!
    </div>

    <div class="balance-progress">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"
          :class="{ warning: effectiveRemainingDays < 5, critical: effectiveRemainingDays < 0 }"
        ></div>
      </div>
      <div class="progress-label">
        {{ Math.round(progressPercentage) }}% {{t('vacation.usedDays')}}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VacationBalance } from '~/types/vacation'
import { icons } from '~/config/icons'

const { t } = useI18n()

const props = defineProps<{
  balance: VacationBalance | null
}>()

const carryoverInfo = ref<any>(null)

// Lade Carryover-Info um den Anpassungsgrund und die korrekten Tage zu sehen
const loadCarryoverInfo = async () => {
  if (!props.balance?.year || !props.balance?.userId) return

  try {
    carryoverInfo.value = await $fetch(`/api/carryover/my-info?year=${props.balance.year}&userId=${props.balance.userId}`)
    console.log('Carryover Info geladen:', carryoverInfo.value)
  } catch (error) {
    console.warn('Could not load carryover info:', error)
    carryoverInfo.value = null
  }
}

// Immer laden wenn balance sich ändert
watch(() => props.balance, (newBalance) => {
  if (newBalance) {
    loadCarryoverInfo()
  }
}, { immediate: true })

// Effektive Carryover-Tage: aus carryoverInfo (DB) oder aus balance (falls bereits gesetzt)
const effectiveCarryoverDays = computed(() => {
  if (carryoverInfo.value?.approvedDays !== undefined && carryoverInfo.value?.approvedDays !== null) {
    return carryoverInfo.value.approvedDays
  }
  return props.balance?.carryoverDays || 0
})

// Korrigierte Gesamttage und verbleibende Tage
const effectiveTotalDays = computed(() => {
  if (!props.balance) return 0
  return props.balance.standardDays + effectiveCarryoverDays.value
})

const effectiveRemainingDays = computed(() => {
  if (!props.balance) return 0
  return effectiveTotalDays.value - props.balance.usedDays
})

const progressPercentage = computed(() => {
  if (!props.balance || effectiveTotalDays.value === 0) return 0
  const percentage = (props.balance.usedDays / effectiveTotalDays.value) * 100
  return Math.min(Math.max(percentage, 0), 100)
})
</script>
