<template>
  <div class="approved-vacation-list">
    <!-- Header mit Toggle und Filter -->
    <div class="section-header" @click="toggleSection">
      <div class="header-left">
        <span class="toggle-icon">{{ showSection ? (icons.ui?.expand || '▼') : (icons.ui?.collapse || '▶') }}</span>
        <h2>Genehmigte Urlaube</h2>
        <span class="count-badge">{{ filteredRequests.length }}</span>
      </div>
      <span class="description-collapsed" v-if="!showSection">
        {{ filteredRequests.length }} genehmigte Urlaubsanträge
      </span>
    </div>

    <!-- Content (einklappbar) -->
    <div v-show="showSection" class="section-content">
      <!-- Filter -->
      <div class="filter-bar">
        <div class="filter-group">
          <label>{{ icons.common?.search || '🔍' }} Mitarbeiter filtern:</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Name eingeben..."
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label>{{ icons.ui?.calendar || '📅' }} Jahr:</label>
          <select v-model="selectedYear" class="filter-select">
            <option value="">Alle Jahre</option>
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <div class="filter-stats">
          {{ filteredRequests.length }} von {{ requests.length }} Anträgen
        </div>
      </div>

      <!-- Liste der genehmigten Urlaube -->
      <template v-if="filteredRequests.length > 0">
        <VacationApprovalCard
          v-for="request in filteredRequests"
          :key="request.id"
          :request="request"
          :vacation-days="calculateVacationDays(request.startDate, request.endDate)"
          :show-actions="true"
          @cancel="$emit('cancel', $event)"
        />
      </template>
      <div v-else class="empty-state">
        {{ searchQuery ? 'Keine Urlaube für diesen Filter gefunden' : 'Keine genehmigten Urlaube' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { calculateWorkdays } from '~/utils/dateHelpers'
import { icons } from '~/config/icons'

const props = defineProps<{
  requests: any[]
}>()

defineEmits(['cancel'])

// State - STANDARD EINGEKLAPPT
const showSection = ref(false)
const searchQuery = ref('')
const selectedYear = ref('')
const halfDayDates = useState<string[]>('halfDayDates', () => [])

// Toggle Section
const toggleSection = () => {
  showSection.value = !showSection.value
}

// Verfügbare Jahre aus den Anträgen
const availableYears = computed(() => {
  const years = new Set<number>()
  props.requests.forEach(req => {
    const year = new Date(req.startDate).getFullYear()
    years.add(year)
  })
  return Array.from(years).sort((a, b) => b - a)
})

// Gefilterte Anträge
const filteredRequests = computed(() => {
  let filtered = props.requests

  // Filter nach Name
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(req => 
      req.displayName.toLowerCase().includes(query)
    )
  }

  // Filter nach Jahr
  if (selectedYear.value) {
    filtered = filtered.filter(req => {
      const year = new Date(req.startDate).getFullYear()
      return year === parseInt(selectedYear.value)
    })
  }

  return filtered
})

// Urlaubstage berechnen
const calculateVacationDays = (startDate: string, endDate: string) => {
  return calculateWorkdays(startDate, endDate, halfDayDates.value)
}
</script>
