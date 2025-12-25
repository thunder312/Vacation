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
        <span>Genehmigter Urlaub</span>
      </div>
      <div class="legend-item">
        <span class="legend-color weekend"></span>
        <span>Wochenende</span>
      </div>
      <div class="legend-item">
        <span class="legend-color holiday"></span>
        <span>Feiertag</span>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      ⏳ {{ t('common.loading') }}
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
          Keine Urlaubsanträge in diesem Monat
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
const { t } = useI18n()
const toast = useToast()

const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const loading = ref(false)
const employeesWithVacation = ref<any[]>([])

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
      weekday: date.toLocaleDateString('de-DE', { weekday: 'short' }),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isHoliday: false
    })
  }
  
  return days
})

const getMonthName = (month: number) => {
  const date = new Date(2000, month - 1, 1)
  return date.toLocaleDateString('de-DE', { month: 'long' })
}

const getDayClass = (day: any) => {
  const classes = []
  if (day.isWeekend) classes.push('weekend')
  if (day.isHoliday) classes.push('holiday')
  return classes.join(' ')
}

const getDayTitle = (day: any) => {
  if (day.isHoliday) return 'Feiertag'
  if (day.isWeekend) return 'Wochenende'
  return ''
}

const getVacationClass = (employee: any, date: string) => {
  const vacation = employee.vacations.find((v: any) => 
    date >= v.startDate && date <= v.endDate
  )
  return vacation ? 'has-vacation' : ''
}

const getVacationTooltip = (employee: any, date: string) => {
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
    const data = await $fetch('/api/vacation/calendar', {
      params: {
        year: selectedYear.value,
        month: selectedMonth.value
      }
    })
    
    employeesWithVacation.value = data || []
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
