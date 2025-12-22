<template>
  <div class="vacation-calendar">
    <div class="calendar-header">
      <h2>Urlaubskalender</h2>
      
      <!-- Monats-Auswahl -->
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

    <!-- Legende -->
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

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      ⏳ Lade Kalender...
    </div>

    <!-- Kalender -->
    <div v-else class="calendar-container">
      <div class="calendar-grid">
        <!-- Header: Tage des Monats -->
        <div class="calendar-days-header">
          <div class="employee-header">Mitarbeiter</div>
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

        <!-- Body: Mitarbeiter mit Urlaub -->
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
                :key="`${employee.userId}-${day.date}`"
                :class="['day-cell', getDayClass(day)]"
              >
                <!-- Urlaubsbalken -->
                <div 
                  v-for="vacation in getVacationsForDay(employee, day)"
                  :key="vacation.id"
                  :class="['vacation-bar', `status-${vacation.status}`]"
                  :style="getVacationBarStyle(vacation, day)"
                  :title="getVacationTooltip(vacation)"
                >
                  <span v-if="isVacationStart(vacation, day)" class="vacation-label">
                    {{ vacation.reason || 'Urlaub' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Button -->
    <div class="calendar-actions">
      <button @click="exportCalendarPDF" class="btn-pdf" :disabled="loading">
        📄 Kalender als PDF exportieren
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isWeekend, isHoliday } from '~/utils/holidays'

const toast = useToast()

// State
const selectedMonth = ref(new Date().getMonth() + 1) // 1-12
const selectedYear = ref(new Date().getFullYear())
const loading = ref(false)
const employeesWithVacation = ref<any[]>([])
const daysInMonth = ref<any[]>([])

// Jahre für Auswahl (5 Jahre zurück, 2 Jahre voraus)
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 8 }, (_, i) => currentYear - 5 + i)
})

// Monatsnamen
const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

const getMonthName = (month: number) => monthNames[month - 1]

// Navigation
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

// Tage des Monats generieren
const generateDays = () => {
  const year = selectedYear.value
  const month = selectedMonth.value
  const daysCount = new Date(year, month, 0).getDate()
  
  daysInMonth.value = []
  
  for (let day = 1; day <= daysCount; day++) {
    const date = new Date(year, month - 1, day)
    const dateStr = date.toISOString().split('T')[0]
    
    daysInMonth.value.push({
      day,
      date: dateStr,
      weekday: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][date.getDay()],
      isWeekend: isWeekend(date),
      isHoliday: isHoliday(date),
      dateObj: date
    })
  }
}

// Kompakter Mitarbeiter-Name für bessere Übersicht
const getCompactName = (displayName: string) => {
  // "Max Mustermann" → "Mustermann, M."
  const parts = displayName.trim().split(' ')
  if (parts.length < 2) return displayName
  
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ')
  
  return `${lastName}, ${firstName.charAt(0)}.`
}

// Kalender laden
const loadCalendar = async () => {
  loading.value = true
  generateDays()
  
  try {
    const firstDay = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-01`
    const lastDay = daysInMonth.value[daysInMonth.value.length - 1].date
    
    const response = await $fetch('/api/vacation/calendar', {
      params: {
        startDate: firstDay,
        endDate: lastDay
      }
    })
    
    employeesWithVacation.value = response || []
  } catch (error: any) {
    console.error('Fehler beim Laden des Kalenders:', error)
    toast.error('Fehler beim Laden des Kalenders')
    employeesWithVacation.value = []
  } finally {
    loading.value = false
  }
}

// Urlaube für einen Tag finden
const getVacationsForDay = (employee: any, day: any) => {
  return employee.vacations.filter((v: any) => {
    return day.date >= v.startDate && day.date <= v.endDate
  })
}

// Prüfe ob Urlaubsstart
const isVacationStart = (vacation: any, day: any) => {
  return vacation.startDate === day.date
}

// Urlaubsbalken Style
const getVacationBarStyle = (vacation: any, day: any) => {
  const startDate = vacation.startDate
  const endDate = vacation.endDate
  const currentDate = day.date
  
  // Berechne Breite und Position
  const monthStart = daysInMonth.value[0].date
  const monthEnd = daysInMonth.value[daysInMonth.value.length - 1].date
  
  const vacStart = startDate < monthStart ? monthStart : startDate
  const vacEnd = endDate > monthEnd ? monthEnd : endDate
  
  // Finde Start- und End-Tag im Monat
  const startIndex = daysInMonth.value.findIndex(d => d.date === vacStart)
  const endIndex = daysInMonth.value.findIndex(d => d.date === vacEnd)
  const currentIndex = daysInMonth.value.findIndex(d => d.date === currentDate)
  
  if (currentIndex === startIndex) {
    // Startag - Balken beginnt hier
    const width = (endIndex - startIndex + 1) * 100
    return {
      width: `${width}%`,
      left: '0'
    }
  } else {
    // Mittlere/Ende Tage - kein Balken (wird vom Start überspannt)
    return {
      display: 'none'
    }
  }
}

// Tooltip für Urlaub
const getVacationTooltip = (vacation: any) => {
  const start = new Date(vacation.startDate).toLocaleDateString('de-DE')
  const end = new Date(vacation.endDate).toLocaleDateString('de-DE')
  return `${start} - ${end}\n${vacation.reason || 'Urlaub'}\nStatus: Genehmigt`
}

// Tag-CSS-Klassen
const getDayClass = (day: any) => {
  // Heute in lokaler Zeitzone (Deutschland)
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  return {
    'is-weekend': day.isWeekend,
    'is-holiday': day.isHoliday,
    'is-today': day.date === todayStr
  }
}

// Tag-Tooltip
const getDayTitle = (day: any) => {
  if (day.isHoliday) return 'Feiertag'
  if (day.isWeekend) return 'Wochenende'
  return ''
}

// PDF Export
const exportCalendarPDF = async () => {
  if (loading.value || employeesWithVacation.value.length === 0) {
    toast.warning('Keine Daten zum Exportieren')
    return
  }
  
  toast.info('PDF-Export wird vorbereitet...')
  
  try {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    
    // PDF im QUERFORMAT (landscape)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    const monthName = getMonthName(selectedMonth.value)
    const yearStr = selectedYear.value.toString()
    
    // Titel
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(`Urlaubskalender - ${monthName} ${yearStr}`, 148, 15, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 148, 22, { align: 'center' })
    
    // Tabelle erstellen
    const tableHeaders = ['Mitarbeiter', ...daysInMonth.value.map(d => d.day.toString())]
    const tableData: any[] = []
    
    employeesWithVacation.value.forEach(employee => {
      const row = [employee.displayName]
      
      daysInMonth.value.forEach(day => {
        const vacations = getVacationsForDay(employee, day)
        if (vacations.length > 0) {
          // Markiere Urlaubstag
          row.push('U')
        } else if (day.isWeekend) {
          row.push('WE')
        } else if (day.isHoliday) {
          row.push('F')
        } else {
          row.push('')
        }
      })
      
      tableData.push(row)
    })
    
    // AutoTable verwenden
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 7,
        cellPadding: 1,
        overflow: 'linebreak',
        halign: 'center'
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 40, halign: 'left' }  // Mitarbeiter-Spalte breiter
      },
      didDrawCell: (data: any) => {
        // Wochenenden grau hinterlegen
        if (data.row.section === 'body' && data.column.index > 0) {
          const dayIndex = data.column.index - 1
          const day = daysInMonth.value[dayIndex]
          
          if (day?.isWeekend) {
            doc.setFillColor(240, 240, 240)
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F')
          } else if (day?.isHoliday) {
            doc.setFillColor(220, 240, 255)
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F')
          }
          
          // Text neu zeichnen wenn vorhanden
          if (data.cell.text && data.cell.text[0]) {
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(7)
            doc.text(data.cell.text[0], data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, {
              align: 'center',
              baseline: 'middle'
            })
          }
        }
      }
    })
    
    // Legende hinzufügen
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Legende:', 14, finalY)
    
    doc.setFont('helvetica', 'normal')
    doc.text('U = Urlaub', 14, finalY + 5)
    doc.text('WE = Wochenende', 50, finalY + 5)
    doc.text('F = Feiertag', 90, finalY + 5)
    
    // PDF in neuem Tab öffnen (wie alle anderen PDFs)
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, '_blank')
    
    // URL nach 1 Minute aufräumen
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000)
    
    toast.success('PDF wird in neuem Tab geöffnet')
  } catch (error: any) {
    console.error('Fehler beim PDF-Export:', error)
    toast.error('Fehler beim PDF-Export: ' + error.message)
  }
}

// Initial laden
onMounted(() => {
  loadCalendar()
})
</script>
