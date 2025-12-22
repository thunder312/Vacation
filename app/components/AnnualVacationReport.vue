<template>
  <div class="annual-vacation-report">
    <div class="report-card">
      <h3>📊 Jahresbericht Urlaube</h3>
      <p class="description">
        Erstellt einen vollständigen Jahresbericht für alle Mitarbeiter mit Gesamtstatistik, 
        individuellen Urlaubsnachweisen und Unterschriftenvorlagen.
      </p>

      <!-- Jahr-Auswahl -->
      <div class="year-selector">
        <label>Jahr auswählen:</label>
        <select v-model="selectedYear" @change="loadStatistics">
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <!-- Vorschau Statistik -->
      <div v-if="statistics" class="statistics-preview">
        <h4>Vorschau Gesamtstatistik {{ selectedYear }}</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.totalEmployees }}</div>
            <div class="stat-label">Mitarbeiter</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ statistics.totalVacationDays }}</div>
            <div class="stat-label">Urlaubstage gesamt</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ statistics.averagePerEmployee }}</div>
            <div class="stat-label">Ø pro Mitarbeiter</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ statistics.takenDays }}</div>
            <div class="stat-label">Genommen</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ statistics.remainingDays }}</div>
            <div class="stat-label">Resturlaub</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ statistics.takenPercentage }}%</div>
            <div class="stat-label">Quote</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        ⏳ Lade Statistiken...
      </div>

      <!-- Fehler -->
      <div v-if="error" class="error-state">
        ❌ {{ error }}
      </div>

      <!-- Export Button -->
      <div class="report-actions">
        <button 
          @click="generateReport" 
          class="btn-pdf"
          :disabled="loading || !statistics || generating"
        >
          {{ generating ? '⏳ PDF wird erstellt...' : '📄 Jahresbericht als PDF erstellen' }}
        </button>
      </div>

      <!-- Info -->
      <div class="report-info">
        <strong>ℹ️ Das PDF enthält:</strong>
        <ul>
          <li>Seite 1: Gesamtstatistik über alle Mitarbeiter</li>
          <li>Ab Seite 2: Individueller Nachweis pro Mitarbeiter (alphabetisch sortiert)</li>
          <li>Jede Mitarbeiterseite enthält eine Unterschriftenvorlage zur Bestätigung</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()

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
    error.value = 'Fehler beim Laden der Statistiken'
    statistics.value = null
  } finally {
    loading.value = false
  }
}

// PDF generieren
const generateReport = async () => {
  if (!statistics.value) return
  
  generating.value = true
  toast.info('PDF wird erstellt, bitte warten...')
  
  try {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Seite 1: Gesamtstatistik
    generateOverviewPage(doc, statistics.value)
    
    // Ab Seite 2: Mitarbeiter-Seiten
    const employees = await $fetch('/api/reports/annual-employee-details', {
      params: { year: selectedYear.value }
    })
    
    employees.forEach((employee: any, index: number) => {
      if (index > 0 || true) {  // Neue Seite für jeden MA
        doc.addPage()
      }
      generateEmployeePage(doc, employee, selectedYear.value, autoTable)
    })
    
    // PDF in neuem Tab öffnen
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000)
    
    toast.success('PDF erfolgreich erstellt')
  } catch (err: any) {
    console.error('Fehler beim Erstellen des PDFs:', err)
    toast.error('Fehler beim Erstellen des PDFs')
  } finally {
    generating.value = false
  }
}

// Seite 1: Gesamtstatistik
const generateOverviewPage = (doc: any, stats: any) => {
  const year = selectedYear.value
  const yearStr = String(year)
  
  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('URLAUBSBERICHT ' + yearStr, 105, 20, { align: 'center' })
  
  doc.setFontSize(14)
  doc.text('Gesamtstatistik', 105, 30, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date().toLocaleDateString('de-DE')
  doc.text('Erstellt am: ' + dateStr, 105, 38, { align: 'center' })
  
  // Linie
  doc.setLineWidth(0.5)
  doc.line(20, 42, 190, 42)
  
  let y = 55
  
  // Übersicht
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Übersicht', 20, y)
  y += 10
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Mitarbeiteranzahl: ' + String(stats.totalEmployees), 25, y)
  y += 6
  doc.text('Urlaubstage gesamt: ' + String(stats.totalVacationDays) + ' Tage', 25, y)
  y += 6
  doc.text('Durchschnitt pro Mitarbeiter: ' + String(stats.averagePerEmployee) + ' Tage', 25, y)
  y += 12
  
  doc.text('Genommener Urlaub: ' + String(stats.takenDays) + ' Tage (' + String(stats.takenPercentage) + '%)', 25, y)
  y += 6
  doc.text('Resturlaub: ' + String(stats.remainingDays) + ' Tage (' + String(100 - stats.takenPercentage) + '%)', 25, y)
  y += 15
  
  // Status
  doc.setFont('helvetica', 'bold')
  doc.text('Status der Anträge', 20, y)
  y += 10
  
  doc.setFont('helvetica', 'normal')
  doc.text('Genehmigt: ' + String(stats.approvedRequests) + ' Anträge', 25, y)
  y += 6
  doc.text('Ausstehend: ' + String(stats.pendingRequests) + ' Anträge', 25, y)
  y += 15
  
  // Häufigste Urlaubsmonate
  if (stats.topMonths && stats.topMonths.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.text('Häufigste Urlaubsmonate', 20, y)
    y += 10
    
    doc.setFont('helvetica', 'normal')
    stats.topMonths.slice(0, 5).forEach((month: any) => {
      doc.text(String(month.name) + ': ' + String(month.days) + ' Tage', 25, y)
      y += 6
    })
  }
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128)
  doc.text('Vertraulich - Nur für internen Gebrauch', 105, 280, { align: 'center' })
}

// Mitarbeiter-Seite
const generateEmployeePage = (doc: any, employee: any, year: number, autoTable: any) => {
  // Sichere Werte und konvertiere zu String
  const displayName = String(employee.displayName || 'Unbekannt')
  const entitlement = String(employee.entitlement || 0)
  const carryover = String(employee.carryover || 0)
  const total = String(employee.total || 0)
  const taken = String(employee.taken || 0)
  const remaining = String(employee.remaining || 0)
  const yearStr = String(year)
  const lastYearStr = String(year - 1)
  
  // Header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('URLAUBSNACHWEIS ' + yearStr, 105, 20, { align: 'center' })
  
  doc.setFontSize(14)
  doc.text(displayName, 105, 30, { align: 'center' })
  
  // Linie
  doc.setLineWidth(0.5)
  doc.line(20, 35, 190, 35)
  
  let y = 48
  
  // Urlaubsanspruch
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Urlaubsanspruch: ' + entitlement + ' Tage', 20, y)
  y += 6
  doc.text('Übertrag aus ' + lastYearStr + ': ' + carryover + ' Tage', 20, y)
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Gesamt verfügbar: ' + total + ' Tage', 20, y)
  y += 10
  
  doc.setFont('helvetica', 'normal')
  doc.text('Genommener Urlaub: ' + taken + ' Tage', 20, y)
  y += 6
  doc.text('Resturlaub: ' + remaining + ' Tage', 20, y)
  y += 12
  
  // Urlaubsübersicht Tabelle
  doc.setFont('helvetica', 'bold')
  doc.text('URLAUBSÜBERSICHT:', 20, y)
  y += 5
  
  if (employee.vacations && employee.vacations.length > 0) {
    const tableData = employee.vacations.map((v: any) => [
      v.startDate,
      v.endDate,
      v.days.toString(),
      v.reason || '-'
    ])
    
    autoTable(doc, {
      startY: y,
      head: [['Von', 'Bis', 'Tage', 'Grund']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 }
    })
    
    y = (doc as any).lastAutoTable.finalY + 15
  } else {
    doc.setFont('helvetica', 'italic')
    doc.text('Keine Urlaube in diesem Jahr', 25, y + 5)
    y += 20
  }
  
  // Unterschriftenbereich
  doc.setLineWidth(0.3)
  doc.line(20, y, 190, y)
  y += 10
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('BESTÄTIGUNG', 105, y, { align: 'center' })
  y += 10
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Ich bestätige die Richtigkeit der Urlaubserfassung', 20, y)
  y += 5
  doc.text('für das Jahr ' + yearStr + '.', 20, y)
  y += 15
  
  doc.text('Ort, Datum: _______________________', 20, y)
  y += 20
  
  doc.text('Unterschrift Mitarbeiter: _______________________', 20, y)
  y += 20
  
  doc.text('Unterschrift Vorgesetzter: _______________________', 20, y)
  
  // Footer
  doc.setFontSize(7)
  doc.setTextColor(128)
  const pageNum = String(doc.internal.getNumberOfPages())
  doc.text('Seite ' + pageNum, 105, 285, { align: 'center' })
}

// Initial laden
onMounted(() => {
  loadStatistics()
})
</script>
