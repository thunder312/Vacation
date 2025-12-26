import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate, calculateWorkdays, getStatusText } from '~/utils/dateHelpers'
import { addPdfHeaderPortrait } from '../shared/pdfHeader'
import { addPdfFooter } from '../shared/pdfFooter'
import { openPdfInNewTab } from '../shared/pdfBase'

export const exportTeamVacations = (
  teamleadName: string,
  teamRequests: any[],
  halfDayDates: string[],
  t: (key: string, params?: any) => string
) => {
  const doc = new jsPDF()

  // Header mit Logo rechts oben
  const contentStartY = addPdfHeaderPortrait(
    doc,
    t('pdf.teamVacations'),
    `${t('roles.teamlead')}: ${teamleadName}\n${t('organization.createdOn')}: ${new Date().toLocaleDateString('de-DE')}`
  )

  // Tabelle
  const sortedRequests = [...teamRequests].sort((a, b) => {
    const nameA = (a.displayName || a.userId).toLowerCase()
    const nameB = (b.displayName || b.userId).toLowerCase()
    if (nameA !== nameB) return nameA.localeCompare(nameB)
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  })

  const tableData = sortedRequests.map(req => [
    req.displayName || req.userId,
    formatDate(req.startDate),
    formatDate(req.endDate),
    calculateWorkdays(req.startDate, req.endDate, halfDayDates).toString(),
    req.reason || '-',
    getStatusText(req.status)
  ])

  autoTable(doc, {
    startY: contentStartY + 5,
    head: [[
      t('roles.employee'),
      t('common.from'),
      t('common.to'),
      t('vacation.vacationDays'),
      t('common.reason'),
      t('common.status')
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234] },
    styles: { fontSize: 9, cellPadding: 2 }
  })

  // Statistik
  const approvedCount = teamRequests.filter(r => r.status === 'approved').length
  const pendingCount = teamRequests.filter(r => r.status === 'pending').length

  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(10)
  doc.text(`${t('pdf.totalRequests')}: ${teamRequests.length}`, 15, finalY)
  doc.text(`${t('pdf.fullyApproved')}: ${approvedCount}`, 15, finalY + 6)
  doc.text(`${t('pdf.pendingTeamlead')}: ${pendingCount}`, 15, finalY + 12)

  // Footer
  addPdfFooter(doc, (current, total) => t('pdf.totalPages', { current, total }))

  openPdfInNewTab(doc)
}
