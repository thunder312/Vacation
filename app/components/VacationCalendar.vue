<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <button @click="previousMonth" class="btn-icon">◀</button>
      
      <div class="month-year-selector">
        <select v-model.number="selectedMonth" @change="loadCalendar" class="month-select">
          <option v-for="m in 12" :key="m" :value="m">
            {{ getMonthName(m) }}
          </option>
        </select>
        
        <select v-model.number="selectedYear" @change="loadCalendar" class="year-select">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      
      <button @click="nextMonth" class="btn-icon">▶</button>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>

    <div v-else class="calendar-grid">
      <!-- Header: Employee names -->
      <div class="employee-column header-column">
        <div class="employee-name header-cell">{{ t('calendar.employee') }}</div>
      </div>

      <!-- Day columns -->
      <div 
        v-for="day in daysInMonth" 
        :key="day.date"
        class="day-column"
        :class="getDayClass(day)"
      >
        <div class="day-header" :title="getDayTitle(day)">
          <div class="day-number">{{ day.day }}</div>
          <div class="day-name">{{ day.weekday }}</div>
        </div>
      </div>

      <!-- Employee rows -->
      <template v-for="employee in employeesWithVacation" :key="employee.userId">
        <div class="employee-column">
          <div class="employee-name">{{ getCompactName(employee.displayName) }}</div>
        </div>

        <div 
          v-for="day in daysInMonth" 
          :key="`${employee.userId}-${day.date}`"
          class="day-cell"
          :class="[getDayClass(day), getVacationClass(employee, day.date)]"
          :title="getVacationTooltip(employee, day.date)"
        >
          <!-- Visueller Indikator für Urlaub -->
          <span v-if="getVacationClass(employee, day.date)" class="vacation-indicator">
            {{ icons.calendar.vacation }}
          </span>
        </div>
      </template>
    </div>

    <!-- Legend -->
    <div class="calendar-legend">
      <div class="legend-item">
        <div class="legend-color weekend"></div>
        <span>{{ t('calendar.weekend') }}</span>
      </div>
      <div class="legend-item">
        <div class="legend-color half-day"></div>
        <span>{{ t('calendar.halfDay') }}</span>
      </div>
      <div class="legend-item">
        <div class="legend-color has-vacation"></div>
        <span>{{ t('calendar.vacation') }}</span>
      </div>
      <div class="legend-item">
        <div class="legend-color half-vacation"></div>
        <span>{{ t('calendar.halfVacation') }}</span>
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
const halfDayRules = ref<any[]>([])

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
    
    // Prüfe ob dieser Tag ein Half-day ist (z.B. 24.12., 31.12.)
    const isHalfDay = halfDayRules.value.some(rule => {
      // Vergleiche nur Monat und Tag (Jahr-unabhängig)
      const ruleDate = new Date(rule.date)
      return ruleDate.getMonth() === month - 1 && ruleDate.getDate() === d
    })
    
    days.push({
      date: dateStr,
      day: d,
      weekday: date.toLocaleDateString(locale.value, { weekday: 'short' }),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isHalfDay: isHalfDay,
      halfDayDescription: isHalfDay 
        ? halfDayRules.value.find(r => {
            const rd = new Date(r.date)
            return rd.getMonth() === month - 1 && rd.getDate() === d
          })?.description 
        : ''
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
  if (day.isHalfDay) classes.push('half-day')
  return classes.join(' ')
}

const getDayTitle = (day: any) => {
  if (day.isHalfDay) return day.halfDayDescription || t('calendar.halfDay')
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
    // Lade Half-day rules (einmalig)
    try {
      const halfDays = await $fetch('/api/half-day-rules')
      halfDayRules.value = halfDays || []
    } catch (err) {
      console.warn('Keine Half-day rules gefunden:', err)
      halfDayRules.value = []
    }
    
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
