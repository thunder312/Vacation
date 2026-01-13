import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate, calculateWorkdays, getStatusText } from '~/utils/dateHelpers'
import { addPdfHeaderPortrait } from '../shared/pdfHeader'
import { addPdfFooter } from '../shared/pdfFooter'
import { openPdfInNewTab } from '../shared/pdfBase'

interface TeamVacationsOptions {
  groupByTeamlead?: boolean
  orgNodes?: any[]
}

export const exportTeamVacations = (
  userName: string,
  teamRequests: any[],
  halfDayDates: string[],
  t: (key: string, params?: any) => string,
  options: TeamVacationsOptions = {}
) => {
  const doc = new jsPDF()
  const { groupByTeamlead = false, orgNodes = [] } = options

  // Header mit Logo rechts oben
  const subtitle = groupByTeamlead
    ? `${t('organization.createdOn')}: ${new Date().toLocaleDateString('de-DE')}`
    : `${t('roles.teamlead')}: ${userName}\n${t('organization.createdOn')}: ${new Date().toLocaleDateString('de-DE')}`

  let currentY = addPdfHeaderPortrait(
    doc,
    t('pdf.teamVacations'),
    subtitle
  ) + 5

  if (groupByTeamlead && orgNodes.length > 0) {
    // Gruppiere nach Teamleiter
    const teamleads = orgNodes.filter(n => n.role === 'teamlead')
    const requestsByTeamlead: Record<string, any[]> = {}

    // Initialisiere für jeden Teamleiter
    teamleads.forEach(tl => {
      requestsByTeamlead[tl.userId] = []
    })
    requestsByTeamlead['_ohne_teamlead'] = [] // Für Requests ohne Teamleiter

    // Ordne Requests den Teamleitern zu
    teamRequests.forEach(req => {
      const requester = orgNodes.find(n => n.userId === req.userId)
      if (requester?.teamleadId && requestsByTeamlead[requester.teamleadId]) {
        requestsByTeamlead[requester.teamleadId].push(req)
      } else if (requester?.role === 'teamlead' || requester?.role === 'manager' || requester?.role === 'office') {
        // Teamleiter, Manager und Office haben keinen Teamleiter
        requestsByTeamlead['_ohne_teamlead'].push(req)
      } else {
        requestsByTeamlead['_ohne_teamlead'].push(req)
      }
    })

    // Erstelle Tabelle für jeden Teamleiter
    teamleads.forEach(tl => {
      const requests = requestsByTeamlead[tl.userId]
      if (requests.length === 0) return

      // Prüfe ob neue Seite nötig
      if (currentY > 250) {
        doc.addPage()
        currentY = 20
      }

      // Teamleiter-Überschrift
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`${t('roles.teamlead')}: ${tl.displayName}`, 15, currentY)
      currentY += 6

      const tableData = requests
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .map(req => [
          req.displayName || req.userId,
          formatDate(req.startDate),
          formatDate(req.endDate),
          calculateWorkdays(req.startDate, req.endDate, halfDayDates).toString(),
          req.reason || '-',
          getStatusText(req.status)
        ])

      autoTable(doc, {
        startY: currentY,
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

      currentY = (doc as any).lastAutoTable.finalY + 12
    })

    // Requests ohne Teamleiter (Manager, Office, etc.)
    const ohneTeamlead = requestsByTeamlead['_ohne_teamlead']
    if (ohneTeamlead.length > 0) {
      if (currentY > 250) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(t('pdf.withoutTeamlead') || 'Ohne Teamleiter', 15, currentY)
      currentY += 6

      const tableData = ohneTeamlead
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .map(req => [
          req.displayName || req.userId,
          formatDate(req.startDate),
          formatDate(req.endDate),
          calculateWorkdays(req.startDate, req.endDate, halfDayDates).toString(),
          req.reason || '-',
          getStatusText(req.status)
        ])

      autoTable(doc, {
        startY: currentY,
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

      currentY = (doc as any).lastAutoTable.finalY + 10
    }
  } else {
    // Ursprüngliche Logik für Teamleiter
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
      startY: currentY,
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

    currentY = (doc as any).lastAutoTable.finalY + 10
  }

  // Statistik
  const approvedCount = teamRequests.filter(r => r.status === 'approved').length
  const pendingCount = teamRequests.filter(r => r.status === 'pending' || r.status === 'teamlead_approved').length

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${t('pdf.totalRequests')}: ${teamRequests.length}`, 15, currentY)
  doc.text(`${t('pdf.fullyApproved')}: ${approvedCount}`, 15, currentY + 6)
  doc.text(`${t('pdf.pendingTeamlead')}: ${pendingCount}`, 15, currentY + 12)

  // Footer
  addPdfFooter(doc, (current, total) => t('pdf.totalPages', { current, total }))

  openPdfInNewTab(doc)
}
