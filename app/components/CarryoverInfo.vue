<!-- CarryoverInfo.vue - Zeigt Mitarbeiter ihre Übertrag-Info -->
<template>
  <div v-if="carryoverInfo" class="carryover-info-banner" :class="carryoverInfo.status">
    <!-- Bestätigt / Nicht angepasst -->
    <div v-if="carryoverInfo.status === 'approved'" class="info-content success">
      <div class="info-icon">✅</div>
      <div class="info-text">
        <strong>Urlaubstage-Übertrag {{ currentYear }}</strong>
        <p>
          {{ carryoverInfo.approvedDays }} Tage aus {{ currentYear - 1 }} wurden übertragen.
        </p>
      </div>
    </div>

    <!-- Angepasst -->
    <div v-else-if="carryoverInfo.status === 'adjusted'" class="info-content warning">
      <div class="info-icon">⚠️</div>
      <div class="info-text">
        <strong>Urlaubstage-Übertrag angepasst</strong>
        <p class="adjustment-summary">
          Berechnet: {{ carryoverInfo.originalDays }} Tage → 
          Genehmigt: <strong>{{ carryoverInfo.approvedDays }} Tage</strong>
        </p>
        
        <div class="reason-box">
          <strong>💬 Begründung des Managers:</strong>
          <p>{{ carryoverInfo.adjustmentReason }}</p>
          <small>
            Angepasst von {{ carryoverInfo.adjustedBy }} am {{ formatDate(carryoverInfo.adjustedAt) }}
          </small>
        </div>
      </div>
    </div>

    <!-- Ausstehend -->
    <div v-else-if="carryoverInfo.status === 'pending'" class="info-content pending">
      <div class="info-icon">⏳</div>
      <div class="info-text">
        <strong>Urlaubstage-Übertrag wird geprüft</strong>
        <p>
          Ihr Manager prüft derzeit Ihren berechneten Übertrag von {{ carryoverInfo.originalDays }} Tagen aus {{ currentYear - 1 }}.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
const carryoverInfo = ref<any>(null)

onMounted(async () => {
  await loadCarryoverInfo()
})

const loadCarryoverInfo = async () => {
  try {
    const data = await $fetch('/api/carryover/my-info', {
      params: { year: currentYear }
    })
    if (data) {
      carryoverInfo.value = data
    }
  } catch (error) {
    console.error('Fehler beim Laden der Carryover-Info:', error)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('de-DE')
}
</script>