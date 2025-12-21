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

<style scoped>
.carryover-info-banner {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-content {
  display: flex;
  gap: 16px;
  padding: 20px;
}

.info-content.success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-left: 4px solid #28a745;
}

.info-content.warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-left: 4px solid #ffc107;
}

.info-content.pending {
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
  border-left: 4px solid #17a2b8;
}

.info-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.info-text {
  flex: 1;
}

.info-text strong {
  display: block;
  font-size: 16px;
  margin-bottom: 8px;
  color: var(--color-gray-900);
}

.info-text p {
  margin: 4px 0;
  color: var(--color-gray-700);
  font-size: 14px;
}

.adjustment-summary {
  font-size: 15px;
  margin: 8px 0 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
}

.reason-box {
  background: rgba(255, 255, 255, 0.7);
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.reason-box strong {
  font-size: 14px;
  color: #856404;
  margin-bottom: 6px;
}

.reason-box p {
  color: #856404;
  font-size: 14px;
  margin: 6px 0;
  line-height: 1.5;
}

.reason-box small {
  color: #856404;
  opacity: 0.8;
  font-size: 12px;
}

@media (max-width: 640px) {
  .info-content {
    flex-direction: column;
    gap: 12px;
  }

  .info-icon {
    font-size: 24px;
  }
}
</style>
