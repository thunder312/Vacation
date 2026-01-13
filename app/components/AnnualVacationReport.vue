<template>
  <div class="annual-vacation-report">
    <div class="report-card">
      <h3>{{ icons.ui?.report || '📊' }} {{ t('reports.annualReport') }}</h3>
      <p class="description">
        {{ t('reports.annualReportDescription') }}
      </p>

      <!-- Jahr-Auswahl -->
      <div class="year-selector">
        <label>{{ t('reports.selectYear') }}</label>
        <select v-model="selectedYear" @change="loadStatistics">
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <!-- Vorschau Statistik -->
      <div v-if="statistics" class="statistics-preview">
        <h4>{{ t('reports.preview', { year: selectedYear }) }}</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.totalEmployees }}</div>
            <div class="stat-label">{{ t('reports.employees') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ statistics.totalVacationDays }}</div>
            <div class="stat-label">{{ t('reports.totalVacationDays') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ statistics.averagePerEmployee }}</div>
            <div class="stat-label">{{ t('reports.averagePerEmployee') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ statistics.takenDays }}</div>
            <div class="stat-label">{{ t('reports.taken') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ statistics.remainingDays }}</div>
            <div class="stat-label">{{ t('reports.remaining') }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ statistics.takenPercentage }}%</div>
            <div class="stat-label">{{ t('reports.quota') }}</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        {{ icons.ui?.loading || '⏳' }} {{ t('reports.loadingStatistics') }}
      </div>

      <!-- Fehler -->
      <div v-if="error" class="error-state">
        {{ icons.ui?.error || '❌' }} {{ error }}
      </div>

      <!-- Export Button -->
      <div class="report-actions">
        <button
          @click="generateReport"
          class="btn-pdf"
          :disabled="loading || !statistics || generating"
        >
          {{ generating ? (icons.ui?.loading || '⏳') + ' ' + t('reports.creating') : (icons.ui?.document || '📄') + ' ' + t('reports.createPdf') }}
        </button>
      </div>

      <!-- Info -->
      <div class="report-info">
        <strong>{{ icons.ui?.info || 'ℹ️' }} {{ t('reports.pdfContains') }}</strong>
        <ul>
          <li>{{ t('reports.pdfPage1') }}</li>
          <li>{{ t('reports.pdfPage2Plus') }}</li>
          <li>{{ t('reports.pdfSignatures') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { exportAnnualReport } from '~/utils/pdf'
import { icons } from '~/config/icons'

const toast = useToast()
const { t } = useI18n()

// State
const selectedYear = ref(new Date().getFullYear())
const statistics = ref<any>(null)
const loading = ref(false)
const generating = ref(false)
const error = ref('')

// Verfügbare Jahre (5 Jahre zurück, aktuelles Jahr)
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 6 }, (_, i) => currentYear - i)
})

// Statistiken laden
const loadStatistics = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await $fetch('/api/reports/annual-statistics', {
      params: { year: selectedYear.value }
    })
    
    statistics.value = data
  } catch (err: any) {
    console.error('Fehler beim Laden der Statistiken:', err)
    error.value = t('errors.loadingStatistics')
    statistics.value = null
  } finally {
    loading.value = false
  }
}

// PDF generieren
const generateReport = async () => {
  if (!statistics.value) {
    toast.error(t('reports.noData'))
    return
  }
  
  generating.value = true
  toast.info(t('vacation.pdfGenerating'))
  
  try {
    // Hole Mitarbeiter-Details
    const employees = await $fetch('/api/reports/annual-employee-details', {
      params: { year: selectedYear.value }
    })
    
    // Generiere PDF
    await exportAnnualReport(statistics.value, selectedYear.value, employees)
    
    toast.success(t('vacation.pdfCreated'))
  } catch (err: any) {
    console.error('Fehler beim Erstellen des PDFs:', err)
    toast.error(t('errors.creatingPdf'))
  } finally {
    generating.value = false
  }
}

onMounted(() => {
  loadStatistics()
})
</script>
