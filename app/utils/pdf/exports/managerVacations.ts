import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate, calculateWorkdays, getStatusText } from '~/utils/dateHelpers'
import { branding } from '~/config/branding'
import { addPdfHeaderPortrait } from '../shared/pdfHeader'
import { addPdfFooter } from '../shared/pdfFooter'
import { openPdfInNewTab } from '../shared/pdfBase'

export const exportManagerVacations = (
  managerName: string,
  allRequests: any[],
  halfDayDates: string[],
  t: (key: string, params?: any) => string
) => {
  const doc = new jsPDF()

  // Header mit Logo rechts oben
  const contentStartY = addPdfHeaderPortrait(
    doc,
    t('pdf.vacationOverviewPdf', { company: branding.company.name }),
    `${t('organization.createdOn')}: ${new Date().toLocaleDateString('de-DE')}`
  )

  // Tabelle
  const sortedRequests = [...allRequests].sort((a, b) => {
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
  const totalRequests = allRequests.length
  const approvedCount = allRequests.filter(r => r.status === 'approved').length
  const teamleadApprovedCount = allRequests.filter(r => r.status === 'teamlead_approved').length
  const pendingCount = allRequests.filter(r => r.status === 'pending').length
  const rejectedCount = allRequests.filter(r => r.status === 'rejected').length
  const cancelledCount = allRequests.filter(r => r.status === 'cancelled').length
  const totalApprovedDays = allRequests
    .filter(r => r.status === 'approved')
    .reduce((sum, req) => sum + calculateWorkdays(req.startDate, req.endDate, halfDayDates), 0)
  const totalCancelledDays = allRequests
    .filter(r => r.status === 'cancelled')
    .reduce((sum, req) => sum + calculateWorkdays(req.startDate, req.endDate, halfDayDates), 0)

  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(10)
  doc.setFont('arial', 'bold')
  doc.text(`${t('pdf.statistics')}:`, 15, finalY)
  doc.setFont('arial', 'normal')
  doc.text(`${t('pdf.totalRequests')}: ${totalRequests}`, 15, finalY + 6)
  doc.text(`${t('pdf.fullyApproved')}: ${approvedCount}`, 15, finalY + 12)
  doc.text(`${t('pdf.pendingManager')}: ${teamleadApprovedCount}`, 15, finalY + 18)
  doc.text(`${t('pdf.pendingTeamlead')}: ${pendingCount}`, 15, finalY + 24)
  doc.text(`${t('status.rejected')}: ${rejectedCount}`, 15, finalY + 30)
  doc.text(`${t('status.cancelled')}: ${cancelledCount}`, 15, finalY + 36)
  doc.text(`${t('pdf.totalApprovedDays')}: ${totalApprovedDays}`, 15, finalY + 42)
  if (totalCancelledDays > 0) {
    doc.text(`${t('pdf.totalCancelledDays')}: ${totalCancelledDays}`, 15, finalY + 48)
  }

  // Footer
  addPdfFooter(doc, (current, total) => t('pdf.totalPages', { current, total }))

  openPdfInNewTab(doc)
}
