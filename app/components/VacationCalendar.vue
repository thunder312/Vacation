<template>
  <div class="vacation-calendar">
    <div class="calendar-header">
      <h2>{{ t('vacation.calendar') }}</h2>
      
      <div class="month-selector">
        <button @click="previousMonth" class="btn-nav">◀</button>
        <div class="month-display">
          <select v-model="selectedMonth" @change="loadCalendar">
            <option v-for="m in 12" :key="m" :value="m">
              {{ getMonthName(m) }}
            </option>
          </select>
          <select v-model="selectedYear" @change="loadCalendar">
            <option v-for="y in years" :key="y" :value="y">
              {{ y }}
            </option>
          </select>
        </div>
        <button @click="nextMonth" class="btn-nav">▶</button>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <span class="legend-color approved"></span>
        <span>{{ t('calendar.approvedVacation') }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-color half-vacation"></span>
        <span>Halber Urlaubstag (Firmenveranstaltung)</span>
      </div>
      <div class="legend-item">
        <span class="legend-color weekend"></span>
        <span>{{ t('calendar.weekend') }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-color holiday"></span>
        <span>{{ t('calendar.holiday') }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      {{icons.ui.loading}} {{ t('common.loading') }}
    </div>

    <div v-else class="calendar-container">
      <div class="calendar-grid">
        <div class="calendar-days-header">
          <div class="employee-header">{{ t('organization.employees') }}</div>
          <div class="days-row">
            <div 
              v-for="day in daysInMonth" 
              :key="day.date"
              :class="['day-header', getDayClass(day)]"
              :title="getDayTitle(day)"
            >
              <div class="day-number">{{ day.day }}</div>
              <div class="day-name">{{ day.weekday }}</div>
            </div>
          </div>
        </div>

        <div v-if="employeesWithVacation.length === 0" class="empty-state">
          {{t('calendar.noVacationMonth')}}
        </div>
        
        <div v-else class="calendar-body">
          <div 
            v-for="employee in employeesWithVacation" 
            :key="employee.userId"
            class="employee-row"
          >
            <div class="employee-name">
              {{ getCompactName(employee.displayName) }}
              <span class="vacation-count">({{ employee.vacations.length }})</span>
            </div>
            
            <div class="days-row">
              <div 
                v-for="day in daysInMonth" 
                :key="day.date"
                :class="['day-cell', getDayClass(day), getVacationClass(employee, day.date)]"
                :title="getVacationTooltip(employee, day.date)"
              >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons } from '~/config/icons'

const { t } = useI18n()
const toast = useToast()
const { locale } = useLocale()

const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const loading = ref(false)
const employeesWithVacation = ref<any[]>([])
const exceptions = ref<any[]>([])

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
})

const daysInMonth = computed(() => {
  const year = selectedYear.value
  const month = selectedMonth.value
  const lastDay = new Date(year, month, 0).getDate()
  const days = []
  
  for (let d = 1; d <= lastDay; d++) {
    // String-basierte Datumserstellung (kein toISOString() wegen Timezone)
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const date = new Date(year, month - 1, d)
    
    days.push({
      date: dateStr,
      day: d,
      weekday: date.toLocaleDateString(locale.value, { weekday: 'short' }),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isHoliday: false
    })
  }
  
  return days
})

const getMonthName = (month: number) => {
  const date = new Date(2000, month - 1, 1)
  return date.toLocaleDateString(locale.value, { month: 'long' })
}

const getDayClass = (day: any) => {
  const classes = []
  if (day.isWeekend) classes.push('weekend')
  if (day.isHoliday) classes.push('holiday')
  return classes.join(' ')
}

const getDayTitle = (day: any) => {
  if (day.isHoliday) return t('calendar.holiday')
  if (day.isWeekend) return t('calendar.weekend')
  return ''
}

const getVacationClass = (employee: any, date: string) => {
  // Prüfe ob Exception an diesem Tag existiert
  const exception = exceptions.value.find((e: any) => 
    e.userId === employee.userId && e.date === date
  )
  
  if (exception) {
    // Exception vorhanden: Reduziere oder entferne Urlaub
    if (exception.deduction >= 1) {
      // 1+ Tage: Kein Urlaub an diesem Tag
      return ''
    } else if (exception.deduction === 0.5) {
      // 0.5 Tage: Halber Urlaubstag
      return 'half-vacation'
    }
  }
  
  // Normaler Urlaub
  const vacation = employee.vacations.find((v: any) => 
    date >= v.startDate && date <= v.endDate
  )
  
  return vacation ? 'has-vacation' : ''
}

const getVacationTooltip = (employee: any, date: string) => {
  // Prüfe Exception zuerst
  const exception = exceptions.value.find((e: any) => 
    e.userId === employee.userId && e.date === date
  )
  
  if (exception) {
    return `${exception.reason} (-${exception.deduction} Tage)`
  }
  
  // Normaler Urlaub
  const vacation = employee.vacations.find((v: any) => 
    date >= v.startDate && date <= v.endDate
  )
  
  if (vacation) {
    return `Urlaub: ${vacation.startDate} - ${vacation.endDate}`
  }
  
  return ''
}

const getCompactName = (name: string) => {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
  }
  return name
}

const previousMonth = () => {
  if (selectedMonth.value === 1) {
    selectedMonth.value = 12
    selectedYear.value--
  } else {
    selectedMonth.value--
  }
  loadCalendar()
}

const nextMonth = () => {
  if (selectedMonth.value === 12) {
    selectedMonth.value = 1
    selectedYear.value++
  } else {
    selectedMonth.value++
  }
  loadCalendar()
}

const loadCalendar = async () => {
  loading.value = true
  try {
    // Lade Urlaubsdaten
    const data = await $fetch('/api/vacation/calendar', {
      params: {
        year: selectedYear.value,
        month: selectedMonth.value
      }
    })
    
    employeesWithVacation.value = data || []
    
    // Lade Exceptions für den Monat
    try {
      const exceptionsData = await $fetch('/api/vacation-exceptions', {
        params: {
          year: selectedYear.value,
          month: selectedMonth.value
        }
      })
      
      exceptions.value = exceptionsData || []
    } catch (err) {
      console.warn('Keine Exceptions gefunden oder Fehler beim Laden:', err)
      exceptions.value = []
    }
    
  } catch (error) {
    console.error('Fehler beim Laden des Kalenders:', error)
    toast.error('Fehler beim Laden des Kalenders')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCalendar()
})
</script>

<style scoped>
.vacation-calendar {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.calendar-header h2 {
  margin: 0;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.month-display {
  display: flex;
  gap: 0.5rem;
}

.month-display select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: white;
}

.btn-nav {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-nav:hover {
  background: var(--surface-secondary);
}

.legend {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--surface-secondary);
  border-radius: 4px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.legend-color.approved,
.day-cell.has-vacation {
  background: #4caf50;
}

.legend-color.half-vacation,
.day-cell.half-vacation {
  background: repeating-linear-gradient(
    45deg,
    #4caf50,
    #4caf50 10px,
    #e0e0e0 10px,
    #e0e0e0 20px
  );
}

.legend-color.weekend,
.day-header.weekend,
.day-cell.weekend {
  background: #f5f5f5;
}

.legend-color.holiday,
.day-header.holiday,
.day-cell.holiday {
  background: #ffebee;
}

.calendar-grid {
  overflow-x: auto;
}

.calendar-days-header {
  display: flex;
  border-bottom: 2px solid var(--border-color);
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.employee-header {
  min-width: 150px;
  padding: 0.75rem;
  font-weight: bold;
  border-right: 1px solid var(--border-color);
  display: flex;
  align-items: center;
}

.days-row {
  display: flex;
  flex: 1;
}

.day-header {
  min-width: 40px;
  padding: 0.5rem 0.25rem;
  text-align: center;
  border-right: 1px solid var(--border-color);
  font-size: 0.75rem;
}

.day-number {
  font-weight: bold;
}

.day-name {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.calendar-body {
  display: flex;
  flex-direction: column;
}

.employee-row {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.employee-row:hover {
  background: var(--surface-secondary);
}

.employee-name {
  min-width: 150px;
  padding: 0.75rem;
  border-right: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vacation-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.day-cell {
  min-width: 40px;
  height: 40px;
  border-right: 1px solid var(--border-color);
  cursor: default;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}
</style>
