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
        </div>
      </template>
    </div>

    <!-- Legend -->
    <div v-if="!loading" class="calendar-legend">
      <div class="legend-item">
        <div class="legend-color weekend"></div>
        <span>{{ t('calendar.weekend') }}</span>
      </div>
      <div class="legend-item">
        <div class="legend-color holiday"></div>
        <span>{{ t('calendar.holiday') }}</span>
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
import { getBavarianHolidays, getBavarianHolidaysWithNames } from '~/utils/holidays'
import { useEventBus } from '~/composables/useEventBus'
import { formatDate } from '~/utils/dateHelpers'

const { t } = useI18n()
const toast = useToast()
const { locale } = useLocale()
const { on, off } = useEventBus()

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

  // Lade bayerische Feiertage für das Jahr (mit Namen)
  const holidays = getBavarianHolidaysWithNames(year)

  for (let d = 1; d <= lastDay; d++) {
    // String-basierte Datumserstellung (kein toISOString() wegen Timezone)
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const date = new Date(year, month - 1, d)

    // Prüfe ob dieser Tag ein Feiertag ist und hole den Namen
    const holiday = holidays.find(h =>
      h.date.getDate() === date.getDate() &&
      h.date.getMonth() === date.getMonth()
    )

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
      isHoliday: !!holiday,
      holidayName: holiday?.name || '',
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
  if (day.isHoliday) classes.push('holiday')
  if (day.isHalfDay) classes.push('half-day')
  return classes.join(' ')
}

const getDayTitle = (day: any) => {
  if (day.isHoliday) return day.holidayName || t('calendar.holiday')
  if (day.isHalfDay) return day.halfDayDescription || t('calendar.halfDay')
  if (day.isWeekend) return t('calendar.weekend')
  return ''
}

const getVacationClass = (employee: any, date: string) => {
  // WICHTIG: Wochenenden und Feiertage bleiben IMMER in ihrer Farbe (kein vacation class)
  const [year, month, day] = date.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)
  
  // Prüfe ob Wochenende
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
  if (isWeekend) {
    return '' // Wochenenden bekommen keine vacation class!
  }
  
  // Prüfe ob Feiertag
  const holidays = getBavarianHolidays(year)
  const isHoliday = holidays.some(holiday =>
    holiday.getDate() === dateObj.getDate() &&
    holiday.getMonth() === dateObj.getMonth()
  )
  if (isHoliday) {
    return '' // Feiertage bekommen keine vacation class!
  }
  
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
  // Safety Check: vacations kann undefined sein
  if (!employee.vacations || !Array.isArray(employee.vacations)) {
    return ''
  }
  
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
    return `${exception.reason} (-${exception.deduction} ${exception.deduction === 1 ? 'Tag' : 'Tage'})`
  }

  // Normaler Urlaub
  // Safety Check: vacations kann undefined sein
  if (!employee.vacations || !Array.isArray(employee.vacations)) {
    return ''
  }

  const vacation = employee.vacations.find((v: any) =>
    date >= v.startDate && date <= v.endDate
  )

  if (vacation) {
    const tooltipParts = [
      `Urlaub: ${formatDate(vacation.startDate)} - ${formatDate(vacation.endDate)}`
    ]

    // Füge Begründung hinzu, falls vorhanden
    if (vacation.reason && vacation.reason.trim()) {
      tooltipParts.push(`Grund: ${vacation.reason}`)
    }

    return tooltipParts.join('\n')
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
    console.log('✅ Loaded employees with vacation:', employeesWithVacation.value.length)
    
    // Lade Exceptions für den Monat
    try {
      const exceptionsData = await $fetch('/api/vacation-exceptions', {
        params: {
          year: selectedYear.value,
          month: selectedMonth.value
        }
      })
      
      exceptions.value = exceptionsData || []
      console.log('✅ Loaded exceptions:', exceptions.value.length)
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

// Event handlers for vacation changes
const handleExceptionCreated = (data?: any) => {
  console.log('🔄 vacation-exception-created event received, reloading calendar...', data)
  loadCalendar()
}

const handleVacationApproved = (data?: any) => {
  console.log('🔄 vacation-approved event received, reloading calendar...', data)
  loadCalendar()
}

const handleVacationCancelled = (data?: any) => {
  console.log('🔄 vacation-cancelled event received, reloading calendar...', data)
  loadCalendar()
}

onMounted(() => {
  loadCalendar()
  // Listen for all vacation-related events
  on('vacation-exception-created', handleExceptionCreated)
  on('vacation-approved', handleVacationApproved)
  on('vacation-cancelled', handleVacationCancelled)
})

// Cleanup listeners on unmount
onUnmounted(() => {
  off('vacation-exception-created', handleExceptionCreated)
  off('vacation-approved', handleVacationApproved)
  off('vacation-cancelled', handleVacationCancelled)
})
</script>
