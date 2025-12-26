import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate, calculateWorkdays, getStatusText } from '~/utils/dateHelpers'
import { addPdfHeaderPortrait } from '../shared/pdfHeader'
import { addPdfFooter } from '../shared/pdfFooter'
import { openPdfInNewTab } from '../shared/pdfBase'

export const exportApprovedVacations = (
  username: string,
  approvedRequests: any[],
  balance: any,
  halfDayDates: string[],
  t: (key: string, params?: any) => string
) => {
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

  const tableData = sortedRequests.map(req => [
    formatDate(req.startDate),
    formatDate(req.endDate),
    calculateWorkdays(req.startDate, req.endDate, halfDayDates).toString(),
    req.reason || '-',
    getStatusText(req.status)
  ])

  autoTable(doc, {
    startY: currentY,
    head: [[t('common.from'), t('common.to'), t('vacation.vacationDays'), t('common.reason'), t('common.status')]],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234] },
    styles: { fontSize: 10, cellPadding: 3 }
  })

  // Summe
  const totalDays = approvedRequests.reduce(
    (sum, req) => sum + calculateWorkdays(req.startDate, req.endDate, halfDayDates),
    0
  )

  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.text(`${t('pdf.totalApprovedDays')}: ${totalDays}`, 15, finalY)

  // Footer
  addPdfFooter(doc, (current, total) => t('pdf.totalPages', { current, total }))

  openPdfInNewTab(doc)
}
