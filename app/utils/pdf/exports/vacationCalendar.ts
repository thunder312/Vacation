import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { addPdfHeaderLandscape } from '../shared/pdfHeader'
import { addPdfFooter } from '../shared/pdfFooter'
import { openPdfInNewTab } from '../shared/pdfBase'
import { getBavarianHolidaysWithNames, type Holiday } from '~/utils/holidays'

interface CalendarEmployee {
  userId: string
  displayName: string
  vacations: Array<{
    startDate: string
    endDate: string
    reason?: string
  }>
}

interface CalendarDay {
  date: string
  day: number
  isWeekend: boolean
  isHoliday: boolean
  holidayName?: string
  isHalfDay: boolean
  halfDayDescription?: string
}

interface VacationCalendarOptions {
  year: number
  month?: number // Optional: wenn nicht gesetzt, wird das ganze Jahr exportiert
  employees: CalendarEmployee[]
  halfDayRules: Array<{ date: string; description: string }>
  exceptions?: Array<{ userId: string; date: string; deduction: number }>
}

// Farben für die Kalender-Darstellung (identisch mit CSS-Kalender)
const COLORS = {
  weekend: { r: 221, g: 221, b: 221 },      // #ddd - var(--color-gray-300)
  holiday: { r: 65, g: 105, b: 225 },       // #4169E1 - Royal Blue (wie im Kalender)
  halfDay: { r: 227, g: 242, b: 253 },      // #e3f2fd - Hellblau (wie im Kalender)
  vacation: { r: 40, g: 167, b: 69 },       // #28a745 - var(--color-success)
  halfVacation: { r: 134, g: 194, b: 143 }, // Mix aus success + grau für Streifeneffekt-Simulation
  header: { r: 102, g: 126, b: 234 },       // Blau
  white: { r: 255, g: 255, b: 255 }
}

// Hilfsfunktion: Generiere Tage für einen Monat
const generateDaysForMonth = (
  year: number,
  month: number,
  holidays: Holiday[],
  halfDayRules: Array<{ date: string; description: string }>
): CalendarDay[] => {
  const lastDay = new Date(year, month, 0).getDate()
  const days: CalendarDay[] = []

  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dateObj = new Date(year, month - 1, d)

    const holiday = holidays.find(h =>
      h.date.getDate() === dateObj.getDate() &&
      h.date.getMonth() === dateObj.getMonth()
    )

    const halfDayRule = halfDayRules.find(rule => {
      const ruleDate = new Date(rule.date)
      return ruleDate.getMonth() === month - 1 && ruleDate.getDate() === d
    })

    days.push({
      date: dateStr,
      day: d,
      isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6,
      isHoliday: !!holiday,
      holidayName: holiday?.name,
      isHalfDay: !!halfDayRule,
      halfDayDescription: halfDayRule?.description
    })
  }

  return days
}

// Hilfsfunktion: Prüfe ob Mitarbeiter an einem Tag Urlaub hat
const hasVacation = (
  employee: CalendarEmployee,
  dateStr: string,
  exceptions?: Array<{ userId: string; date: string; deduction: number }>
): 'full' | 'half' | 'none' => {
  // Prüfe Exceptions
  const exception = exceptions?.find(e => e.userId === employee.userId && e.date === dateStr)
  if (exception) {
    if (exception.deduction >= 1) return 'none'
    if (exception.deduction === 0.5) return 'half'
  }

  // Prüfe Urlaub
  const vacation = employee.vacations?.find(v =>
    dateStr >= v.startDate && dateStr <= v.endDate
  )

  return vacation ? 'full' : 'none'
}

// Hilfsfunktion: Prüfe ob Mitarbeiter im gegebenen Monat mindestens einen Urlaubstag hat
const hasVacationInMonth = (
  employee: CalendarEmployee,
  year: number,
  month: number
): boolean => {
  if (!employee.vacations || employee.vacations.length === 0) return false

  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  return employee.vacations.some(v =>
    // Urlaub überlappt mit dem Monat
    v.startDate <= monthEnd && v.endDate >= monthStart
  )
}

// Hilfsfunktion: Monatsnamen
const getMonthName = (month: number, locale: string = 'de-DE'): string => {
  return new Date(2000, month - 1, 1).toLocaleDateString(locale, { month: 'long' })
}

// Kompakter Name: "Max M."
const getCompactName = (name: string): string => {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
  }
  return name
}

// Streifenmuster für halbe Urlaubstage zeichnen
const drawStripedRect = (doc: jsPDF, x: number, y: number, width: number, height: number) => {
  // Hintergrund grau
  doc.setFillColor(224, 224, 224) // #e0e0e0
  doc.rect(x, y, width, height, 'F')

  // Grüne Streifen
  doc.setFillColor(COLORS.vacation.r, COLORS.vacation.g, COLORS.vacation.b)
  const stripeWidth = 1.5
  const gap = 1.5

  // Vertikale Streifen als einfache Annäherung
  for (let i = 0; i < width; i += stripeWidth + gap) {
    if (i + stripeWidth <= width) {
      doc.rect(x + i, y, stripeWidth, height, 'F')
    }
  }

  // Rahmen
  doc.setDrawColor(150, 150, 150)
  doc.rect(x, y, width, height, 'S')
}

// Exportiere einen einzelnen Monat
const exportMonth = (
  doc: jsPDF,
  options: VacationCalendarOptions,
  month: number,
  startY: number,
  isFirstPage: boolean,
  t: (key: string, params?: any) => string
): number => {
  const { year, employees, halfDayRules, exceptions } = options
  const holidays = getBavarianHolidaysWithNames(year)
  const days = generateDaysForMonth(year, month, holidays, halfDayRules)

  // Filtere nur Mitarbeiter, die in diesem Monat Urlaub haben
  const employeesInMonth = employees.filter(emp => hasVacationInMonth(emp, year, month))

  // Wenn keine Mitarbeiter mit Urlaub, zeige Hinweis
  if (employeesInMonth.length === 0) {
    const margin = 15
    let currentY = startY

    // Monatsüberschrift
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(`${getMonthName(month)} ${year}`, margin, currentY)
    currentY += 8

    // Hinweis: Keine Urlaube
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(128, 128, 128)
    doc.text(t('calendarPdf.noVacationsInMonth'), margin, currentY)

    return currentY + 15
  }

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const employeeColWidth = 45
  const availableWidth = pageWidth - 2 * margin - employeeColWidth
  const cellWidth = Math.min(availableWidth / days.length, 8)
  const cellHeight = 6

  let currentY = startY

  // Monatsüberschrift
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(`${getMonthName(month)} ${year}`, margin, currentY)
  currentY += 8

  // Tages-Header
  const headerY = currentY
  doc.setFontSize(6)
  doc.setFont('helvetica', 'bold')

  // Mitarbeiter-Spalten-Header
  doc.setFillColor(COLORS.header.r, COLORS.header.g, COLORS.header.b)
  doc.rect(margin, headerY - 4, employeeColWidth, cellHeight, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text(t('calendar.employee'), margin + 2, headerY)

  // Tages-Header mit Farben
  days.forEach((day, index) => {
    const x = margin + employeeColWidth + index * cellWidth

    // Hintergrundfarbe basierend auf Tag-Typ
    if (day.isHoliday) {
      doc.setFillColor(COLORS.holiday.r, COLORS.holiday.g, COLORS.holiday.b)
    } else if (day.isWeekend) {
      doc.setFillColor(COLORS.weekend.r, COLORS.weekend.g, COLORS.weekend.b)
    } else if (day.isHalfDay) {
      doc.setFillColor(COLORS.halfDay.r, COLORS.halfDay.g, COLORS.halfDay.b)
    } else {
      doc.setFillColor(COLORS.header.r, COLORS.header.g, COLORS.header.b)
    }

    doc.rect(x, headerY - 4, cellWidth, cellHeight, 'F')

    // Tages-Nummer
    const textColor = (day.isHoliday || day.isWeekend || day.isHalfDay) ? 0 : 255
    doc.setTextColor(textColor, textColor, textColor)
    const dayText = String(day.day)
    const textWidth = doc.getTextWidth(dayText)
    doc.text(dayText, x + (cellWidth - textWidth) / 2, headerY)
  })

  currentY = headerY + cellHeight - 2

  // Mitarbeiter-Zeilen
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)

  employeesInMonth.forEach((employee, empIndex) => {
    const rowY = currentY + empIndex * cellHeight

    // Prüfe ob neue Seite nötig
    if (rowY + cellHeight > pageHeight - 40) {
      return // Mitarbeiter auf nächster Seite fortsetzen
    }

    // Mitarbeiter-Name
    doc.setFillColor(empIndex % 2 === 0 ? 250 : 245, empIndex % 2 === 0 ? 250 : 245, empIndex % 2 === 0 ? 250 : 245)
    doc.rect(margin, rowY - 3, employeeColWidth, cellHeight, 'F')
    doc.setTextColor(0, 0, 0)
    doc.text(getCompactName(employee.displayName), margin + 2, rowY + 1)

    // Tages-Zellen
    days.forEach((day, dayIndex) => {
      const x = margin + employeeColWidth + dayIndex * cellWidth

      // Zellen-Hintergrund
      let useStriped = false
      if (day.isHoliday) {
        doc.setFillColor(COLORS.holiday.r, COLORS.holiday.g, COLORS.holiday.b)
      } else if (day.isWeekend) {
        doc.setFillColor(COLORS.weekend.r, COLORS.weekend.g, COLORS.weekend.b)
      } else {
        // Prüfe Urlaub nur für Arbeitstage
        const vacationStatus = hasVacation(employee, day.date, exceptions)
        if (vacationStatus === 'full') {
          doc.setFillColor(COLORS.vacation.r, COLORS.vacation.g, COLORS.vacation.b)
        } else if (vacationStatus === 'half') {
          useStriped = true
        } else if (day.isHalfDay) {
          doc.setFillColor(COLORS.halfDay.r, COLORS.halfDay.g, COLORS.halfDay.b)
        } else {
          doc.setFillColor(COLORS.white.r, COLORS.white.g, COLORS.white.b)
        }
      }

      if (useStriped) {
        drawStripedRect(doc, x, rowY - 3, cellWidth, cellHeight)
      } else {
        doc.rect(x, rowY - 3, cellWidth, cellHeight, 'F')
      }

      // Rahmen
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.1)
      doc.rect(x, rowY - 3, cellWidth, cellHeight, 'S')
    })
  })

  return currentY + employeesInMonth.length * cellHeight + 5
}

// Legende zeichnen
const drawLegend = (
  doc: jsPDF,
  startY: number,
  t: (key: string, params?: any) => string
): number => {
  const margin = 15
  let currentY = startY + 5

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(t('calendarPdf.legend'), margin, currentY)
  currentY += 6

  const legendItems = [
    { color: COLORS.weekend, label: t('calendar.weekend'), striped: false },
    { color: COLORS.holiday, label: t('calendar.holiday'), striped: false },
    { color: COLORS.halfDay, label: t('calendar.halfDay'), striped: false },
    { color: COLORS.vacation, label: t('calendar.vacation'), striped: false },
    { color: COLORS.halfVacation, label: t('calendar.halfVacation'), striped: true }
  ]

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')

  let x = margin
  legendItems.forEach((item, index) => {
    // Farbbox (mit Streifen für half-vacation)
    if (item.striped) {
      drawStripedRect(doc, x, currentY - 3, 8, 5)
    } else {
      doc.setFillColor(item.color.r, item.color.g, item.color.b)
      doc.rect(x, currentY - 3, 8, 5, 'F')
      doc.setDrawColor(150, 150, 150)
      doc.rect(x, currentY - 3, 8, 5, 'S')
    }

    // Label
    doc.setTextColor(0, 0, 0)
    doc.text(item.label, x + 10, currentY)

    x += 50
    if (index === 2) {
      x = margin
      currentY += 8
    }
  })

  return currentY + 10
}

// Feiertage des Zeitraums auflisten
const drawHolidays = (
  doc: jsPDF,
  startY: number,
  year: number,
  month: number | undefined,
  t: (key: string, params?: any) => string
): number => {
  const margin = 15
  let currentY = startY

  const allHolidays = getBavarianHolidaysWithNames(year)

  // Filtere nach Monat wenn angegeben
  const relevantHolidays = month
    ? allHolidays.filter(h => h.date.getMonth() + 1 === month)
    : allHolidays

  if (relevantHolidays.length === 0) return currentY

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(t('calendarPdf.holidaysInPeriod'), margin, currentY)
  currentY += 6

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')

  // Sortiere nach Datum
  relevantHolidays
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .forEach(holiday => {
      const dateStr = holiday.date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      doc.text(`${dateStr} - ${holiday.name}`, margin, currentY)
      currentY += 4
    })

  return currentY + 5
}

// Haupt-Export-Funktion
export const exportVacationCalendar = (
  options: VacationCalendarOptions,
  t: (key: string, params?: any) => string
) => {
  const { year, month, employees } = options

  // Landscape A4
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  const pageHeight = doc.internal.pageSize.getHeight()

  if (month) {
    // Einzelner Monat
    const title = t('calendarPdf.title')
    const subtitle = `${getMonthName(month)} ${year}\n${t('organization.createdOn')}: ${new Date().toLocaleDateString('de-DE')}`

    let currentY = addPdfHeaderLandscape(doc, title, subtitle)

    // Kalender-Grid
    currentY = exportMonth(doc, options, month, currentY, true, t)

    // Legende
    currentY = drawLegend(doc, currentY, t)

    // Feiertage
    drawHolidays(doc, currentY, year, month, t)

  } else {
    // Ganzes Jahr - 12 Monate auf mehreren Seiten
    for (let m = 1; m <= 12; m++) {
      if (m > 1) {
        doc.addPage()
      }

      const title = t('calendarPdf.title')
      const subtitle = `${getMonthName(m)} ${year}\n${t('organization.createdOn')}: ${new Date().toLocaleDateString('de-DE')}`

      let currentY = addPdfHeaderLandscape(doc, title, subtitle)

      // Kalender-Grid
      currentY = exportMonth(doc, options, m, currentY, m === 1, t)

      // Legende nur auf erster Seite komplett, sonst Mini-Legende
      if (m === 1) {
        currentY = drawLegend(doc, currentY, t)
      }

      // Feiertage des Monats
      const holidaysInMonth = getBavarianHolidaysWithNames(year)
        .filter(h => h.date.getMonth() + 1 === m)

      if (holidaysInMonth.length > 0) {
        drawHolidays(doc, currentY, year, m, t)
      }
    }

    // Letzte Seite: Übersicht aller Feiertage des Jahres
    doc.addPage()
    let currentY = addPdfHeaderLandscape(doc, t('calendarPdf.yearOverview'), `${year}`)
    currentY = drawLegend(doc, currentY, t)
    drawHolidays(doc, currentY, year, undefined, t)
  }

  // Footer auf allen Seiten
  addPdfFooter(doc, (current, total) => t('pdf.totalPages', { current, total }))

  openPdfInNewTab(doc)
}
