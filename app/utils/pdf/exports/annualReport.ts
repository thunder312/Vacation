import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getPdfHeader } from '~/config/branding'
import { openPdfInNewTab } from '../shared/pdfBase'

// Logo oben rechts einfügen (Standard-Position)
const addLogo = (doc: jsPDF, yOffset: number = 10) => {
  const pdfHeader = getPdfHeader()
  try {
    // Logo oben rechts: A4 Portrait ist 210mm breit
    const logoX = 210 - pdfHeader.logoWidth - 15
    doc.addImage(pdfHeader.logo, 'PNG', logoX, yOffset, pdfHeader.logoWidth, pdfHeader.logoHeight)
  } catch (error) {
    console.warn('Logo konnte nicht geladen werden:', error)
  }
}

// Seite 1: Gesamtstatistik
const generateOverviewPage = (doc: jsPDF, stats: any, year: number) => {
  const yearStr = String(year)
  
  // Logo oben rechts (Standard-Position)
  addLogo(doc)
  
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('URLAUBSBERICHT ' + yearStr, 105, 20, { align: 'center' })
  
  doc.setFontSize(14)
  doc.text('Gesamtstatistik', 105, 30, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date().toLocaleDateString('de-DE')
  doc.text('Erstellt am: ' + dateStr, 105, 38, { align: 'center' })
  
  doc.setLineWidth(0.5)
  doc.line(20, 42, 190, 42)
  
  let y = 55
  
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
  y += 6
  doc.text('Genommene Tage: ' + String(stats.takenDays) + ' Tage', 25, y)
  y += 6
  doc.text('Verbleibende Tage: ' + String(stats.remainingDays) + ' Tage', 25, y)
  y += 6
  doc.text('Quote: ' + String(stats.takenPercentage) + '%', 25, y)
}

// Mitarbeiter-Seite mit kompaktem Bestätigungsbereich und Logo
const generateEmployeePage = (doc: jsPDF, employee: any, year: number) => {
  const displayName = String(employee.displayName || 'Unbekannt')
  const entitlement = String(employee.entitlement || 0)
  const carryover = String(employee.carryover || 0)
  const total = String(employee.total || 0)
  const taken = String(employee.taken || 0)
  const remaining = String(employee.remaining || 0)
  const yearStr = String(year)
  const lastYearStr = String(year - 1)
  
  // Logo RECHTS - 5mm höher (bei Y=5 statt Y=10)
  addLogo(doc, 5)
  
  // Titel und Name LINKS
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('URLAUBSNACHWEIS ' + yearStr, 20, 20)
  
  doc.setFontSize(14)
  doc.text(displayName, 20, 28)
  
  // Trennlinie unterhalb von Titel/Name/Logo
  doc.setLineWidth(0.5)
  doc.line(20, 35, 190, 35)
  
  let y = 48
  
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
  
  doc.setFont('helvetica', 'bold')
  doc.text('URLAUBSÜBERSICHT:', 20, y)
  y += 5
  
  if (employee.vacations && employee.vacations.length > 0) {
    // Prüfe ob es Rückbuchungen gibt
    const hasAnyExceptions = employee.vacations.some((v: any) => v.hasException)

    const tableData = employee.vacations.map((v: any) => {
      const baseRow = [
        v.startDate,
        v.endDate,
        v.days.toString(),
        v.reason || '-'
      ]

      // Füge Rückbuchungs-Spalte hinzu, wenn es welche gibt
      if (hasAnyExceptions) {
        if (v.hasException) {
          // Zeige Berechnung + Grund
          const reasonText = v.exceptionReason ? `\n(${v.exceptionReason})` : ''
          baseRow.push(`${v.originalDays} - ${v.deduction} = ${v.days}${reasonText}`)
        } else {
          baseRow.push('-')
        }
      }

      return baseRow
    })

    const headers = ['Von', 'Bis', 'Tage', 'Grund']
    if (hasAnyExceptions) {
      headers.push('Rückbuchung')
    }

    autoTable(doc, {
      startY: y,
      head: [headers],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 }
    })

    y = (doc as any).lastAutoTable.finalY + 8

    // Hinweis zu Rückbuchungen (falls vorhanden)
    if (hasAnyExceptions) {
      const totalDeductions = employee.vacations
        .filter((v: any) => v.hasException)
        .reduce((sum: number, v: any) => sum + v.deduction, 0)
      const exceptionCount = employee.vacations.filter((v: any) => v.hasException).length

      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 80, 0) // Orange/Braun
      doc.text(
        `* ${exceptionCount} Rückbuchung${exceptionCount > 1 ? 'en' : ''} (${totalDeductions} Tag${totalDeductions !== 1 ? 'e' : ''}) bereits abgezogen`,
        20,
        y
      )
      doc.setTextColor(0, 0, 0) // Zurücksetzen
      doc.setFont('helvetica', 'normal')
      y += 7
    }
  } else {
    doc.setFont('helvetica', 'italic')
    doc.text('Keine Urlaube in diesem Jahr', 25, y + 5)
    y += 20
  }
  
  doc.setLineWidth(0.3)
  doc.line(20, y, 190, y)
  y += 10
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('BESTÄTIGUNG', 105, y, { align: 'center' })
  y += 8
  
  // Kompakter Bestätigungsbereich - zweispaltig
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Hiermit bestätige ich die Richtigkeit der Urlaubserfassung für ' + yearStr + '.', 20, y)
  y += 10
  
  // Zweispaltig: Mitarbeiter links, Vorgesetzter rechts
  const leftCol = 20
  const rightCol = 115
  const lineLength = 70
  
  // Linke Spalte - Mitarbeiter
  doc.text('Ort, Datum:', leftCol, y)
  doc.line(leftCol + 22, y, leftCol + lineLength, y)
  
  y += 10
  doc.text('Mitarbeiter:', leftCol, y)
  doc.line(leftCol + 22, y, leftCol + lineLength, y)
  
  // Rechte Spalte - Vorgesetzter (gleiche Y-Positionen)
  y -= 10
  doc.text('Ort, Datum:', rightCol, y)
  doc.line(rightCol + 22, y, rightCol + lineLength, y)
  
  y += 10
  doc.text('Vorgesetzter:', rightCol, y)
  doc.line(rightCol + 22, y, rightCol + lineLength, y)
}

// Haupt-Export-Funktion
export const exportAnnualReport = async (
  statistics: any,
  year: number,
  employees: any[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  
  // Seite 1: Gesamtstatistik
  generateOverviewPage(doc, statistics, year)
  
  // Ab Seite 2: Mitarbeiter-Seiten
  employees.forEach((employee, index) => {
    doc.addPage()
    generateEmployeePage(doc, employee, year)
  })
  
  openPdfInNewTab(doc)
}
