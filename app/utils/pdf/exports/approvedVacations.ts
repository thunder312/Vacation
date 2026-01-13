import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate, calculateWorkdays, getStatusText } from '~/utils/dateHelpers'
import { addPdfHeaderPortrait } from '../shared/pdfHeader'
import { addPdfFooter } from '../shared/pdfFooter'
import { openPdfInNewTab } from '../shared/pdfBase'

export const exportApprovedVacations = async (
  username: string,
  approvedRequests: any[],
  balance: any,
  halfDayDates: string[],
  t: (key: string, params?: any) => string,
  userId: string
) => {
  // Lade alle Exceptions für den User
  let allExceptions: any[] = []
  try {
    allExceptions = await $fetch(`/api/vacation-exceptions?userId=${userId}`)
  } catch (err) {
    console.warn('Could not load exceptions for PDF export:', err)
    allExceptions = []
  }

  const doc = new jsPDF()

  // Header mit Logo rechts oben
  const contentStartY = addPdfHeaderPortrait(
    doc,
    t('pdf.myApprovedVacations'),
    `${t('roles.employee')}: ${username}\n${t('organization.createdOn')}: ${new Date().toLocaleDateString('de-DE')}`
  )

  // Urlaubskonto
  let currentY = contentStartY + 5
  doc.setFontSize(10)
  doc.setFont('arial', 'bold')
  doc.text(`${t('pdf.vacationAccount')}:`, 15, currentY)
  currentY += 6
  
  doc.setFont('arial', 'normal')
  if (balance.carryoverDays > 0) {
    doc.text(
      `${t('vacation.standard')}: ${balance.standardDays} ${t('common.days')} | ${t('vacation.carryover')}: ${balance.carryoverDays} ${t('common.days')} | ${t('vacation.totalDays')}: ${balance.totalDays} ${t('common.days')}`,
      15,
      currentY
    )
    currentY += 6
    doc.text(
      `${t('vacation.usedDays')}: ${balance.usedDays} ${t('common.days')} | ${t('vacation.remainingDays')}: ${balance.remainingDays} ${t('common.days')}`,
      15,
      currentY
    )
    currentY += 8
  } else {
    doc.text(
      `${t('vacation.totalDays')}: ${balance.totalDays} ${t('common.days')} | ${t('vacation.usedDays')}: ${balance.usedDays} ${t('common.days')} | ${t('vacation.remainingDays')}: ${balance.remainingDays} ${t('common.days')}`,
      15,
      currentY
    )
    currentY += 8
  }

  // Tabelle
  const sortedRequests = [...approvedRequests].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )

  // Prüfe ob es Exceptions gibt
  const hasAnyExceptions = allExceptions.length > 0

  const tableData = sortedRequests.map(req => {
    // Finde Exceptions für diesen Request
    const requestExceptions = allExceptions.filter(e => e.vacationRequestId === req.id)

    const originalDays = calculateWorkdays(req.startDate, req.endDate, halfDayDates)
    const effectiveDays = calculateWorkdays(req.startDate, req.endDate, halfDayDates, requestExceptions)

    const baseRow = [
      formatDate(req.startDate),
      formatDate(req.endDate),
      effectiveDays.toString(),
      req.reason || '-',
      getStatusText(req.status)
    ]

    // Füge Rückbuchungs-Spalte nur hinzu, wenn es welche gibt
    if (hasAnyExceptions) {
      if (requestExceptions.length > 0) {
        const totalDeduction = requestExceptions.reduce((sum, e) => sum + e.deduction, 0)
        // Sammle alle Rückbuchungs-Gründe (eindeutig)
        const reasons = [...new Set(requestExceptions.map(e => e.reason).filter(Boolean))]
        const reasonText = reasons.length > 0 ? `\n(${reasons.join(', ')})` : ''
        baseRow.push(`${originalDays} - ${totalDeduction} = ${effectiveDays}${reasonText}`)
      } else {
        baseRow.push('-')
      }
    }

    return baseRow
  })

  const headers = [t('common.from'), t('common.to'), t('vacation.vacationDays'), t('common.reason'), t('common.status')]
  if (hasAnyExceptions) {
    headers.push('Rückbuchung')
  }

  autoTable(doc, {
    startY: currentY,
    head: [headers],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234] },
    styles: { fontSize: 10, cellPadding: 3 }
  })

  // Summe (mit Exceptions berücksichtigt)
  const totalDays = approvedRequests.reduce((sum, req) => {
    const requestExceptions = allExceptions.filter(e => e.vacationRequestId === req.id)
    return sum + calculateWorkdays(req.startDate, req.endDate, halfDayDates, requestExceptions)
  }, 0)

  let finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.text(`${t('pdf.totalApprovedDays')}: ${totalDays}`, 15, finalY)

  // Anmerkung zu Rückbuchungen (falls vorhanden)
  if (hasAnyExceptions) {
    finalY += 8
    const totalExceptions = allExceptions.length
    const totalDeductions = allExceptions.reduce((sum, e) => sum + e.deduction, 0)

    doc.setFontSize(8)
    doc.setFont('arial', 'italic')
    doc.setTextColor(150, 80, 0) // Orange/Braun
    doc.text(
      `* ${totalExceptions} Rückbuchung${totalExceptions > 1 ? 'en' : ''} (${totalDeductions} Tag${totalDeductions !== 1 ? 'e' : ''}) bereits abgezogen`,
      15,
      finalY
    )
    doc.setTextColor(0, 0, 0)
    doc.setFont('arial', 'normal')
  }

  // Footer
  addPdfFooter(doc, (current, total) => t('pdf.totalPages', { current, total }))

  openPdfInNewTab(doc)
}
