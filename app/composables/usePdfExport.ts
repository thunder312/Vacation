import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { VacationRequest } from '~/types/vacation'
import { formatDate, calculateDays, calculateWorkdays, getStatusText } from '~/utils/dateHelpers'
import { branding, getPdfHeader } from '~/config/branding'

export const usePdfExport = () => {
    const { t } = useI18n()
    const toast = useToast()
    const { halfDayRules } = useHalfDayRules()
    const { getBalance } = useVacationBalance()

    // Halbtags-Daten für Berechnung
    const getHalfDayDates = () => (halfDayRules.value || []).map(rule => rule.date)

    // Logo als Base64 laden
    const addLogoToPdf = (doc: any) => {
        const pdfHeader = getPdfHeader()
        try {
            // Logo oben rechts einfügen
            doc.addImage(pdfHeader.logo, 'PNG', 170, 10, pdfHeader.logoWidth, pdfHeader.logoHeight)
        } catch (error) {
            console.warn('Logo konnte nicht geladen werden:', error)
        }
    }

    // Seitenzahlen hinzufügen
    const addPageNumbers = (doc: any) => {
        const pageCount = doc.internal.getNumberOfPages()
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(9)
            doc.setTextColor(128, 128, 128)
            
            const pageText = t('pdf.totalPages', { current: i, total: pageCount })
            const pageWidth = doc.internal.pageSize.getWidth()
            const textWidth = doc.getTextWidth(pageText)
            
            // Zentriert am unteren Rand
            doc.text(pageText, (pageWidth - textWidth) / 2, doc.internal.pageSize.getHeight() - 10)
        }
    }

    const exportMyApprovedVacations = (username: string) => {
        // Hole approved requests für diesen User
        const { getApprovedUserRequests } = useVacationRequests()
        const approvedRequests = getApprovedUserRequests(username).value || []
        
        // Hole userId
        const { orgNodes } = useOrganization()
        const user = orgNodes.value?.find(n => n.userId === username)
        const userId = user?.userId || username
        
        if (!approvedRequests || approvedRequests.length === 0) {
            toast.warning(t('errors.notFound'))
            return
        }

        try {
            const doc = new jsPDF()
            const balance = getBalance(userId)

            // Logo hinzufügen
            addLogoToPdf(doc)

            doc.setFontSize(18)
            doc.text(t('pdf.myApprovedVacations'), 14, 20)

            doc.setFontSize(11)
            doc.text(`${t('roles.employee')}: ${username}`, 14, 30)
            doc.text(`${t('organization.createdOn')}: ${new Date().toLocaleDateString('de-DE')}`, 14, 36)
            
            // Urlaubskonto-Info
            doc.setFontSize(10)
            doc.setFont('arial', 'bold')
            doc.text(`${t('pdf.vacationAccount')}:`, 14, 45)
            doc.setFont('arial', 'normal')
            
            if (balance.carryoverDays > 0) {
                doc.text(`${t('vacation.standard')}: ${balance.standardDays} ${t('common.days')} | ${t('vacation.carryover')}: ${balance.carryoverDays} ${t('common.days')} | ${t('vacation.totalDays')}: ${balance.totalDays} ${t('common.days')}`, 14, 51)
                doc.text(`${t('vacation.usedDays')}: ${balance.usedDays} ${t('common.days')} | ${t('vacation.remainingDays')}: ${balance.remainingDays} ${t('common.days')}`, 14, 57)
            } else {
                doc.text(`${t('vacation.totalDays')}: ${balance.totalDays} ${t('common.days')} | ${t('vacation.usedDays')}: ${balance.usedDays} ${t('common.days')} | ${t('vacation.remainingDays')}: ${balance.remainingDays} ${t('common.days')}`, 14, 51)
            }

            // Nach Startdatum sortieren
            const sortedRequests = [...approvedRequests].sort((a, b) => 
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            )

            const tableData = sortedRequests.map(req => [
                formatDate(req.startDate),
                formatDate(req.endDate),
                calculateWorkdays(req.startDate, req.endDate, getHalfDayDates()).toString(),
                req.reason || '-',
                getStatusText(req.status)
            ])

            autoTable(doc, {
                startY: balance.carryoverDays > 0 ? 63 : 57,
                head: [[t('common.from'), t('common.to'), t('vacation.vacationDays'), t('common.reason'), t('common.status')]],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [102, 126, 234] },
                styles: { fontSize: 10, cellPadding: 3 }
            })

            const totalDays = approvedRequests.reduce((sum, req) =>
                sum + calculateWorkdays(req.startDate, req.endDate, getHalfDayDates()), 0
            )

            const finalY = (doc as any).lastAutoTable.finalY + 10
            doc.setFontSize(11)
            doc.text(`${t('pdf.totalApprovedDays')}: ${totalDays}`, 14, finalY)

            // Seitenzahlen hinzufügen
            addPageNumbers(doc)

            // PDF in neuem Tab öffnen
            const pdfBlob = doc.output('blob')
            const pdfUrl = URL.createObjectURL(pdfBlob)
            window.open(pdfUrl, '_blank')

            toast.success(t('vacation.pdfCreated'))
        } catch (error) {
            console.error('Fehler beim PDF-Export:', error)
            toast.error(t('errors.genericError'))
        }
    }

    const exportTeamVacations = (username: string) => {
        // Hole Team-Requests für diesen Teamlead
        const { getAllTeamRequests } = useVacationRequests()
        const teamRequests = getAllTeamRequests(username).value || []
        
        // Hole displayName
        const { orgNodes } = useOrganization()
        const user = orgNodes.value?.find(n => n.userId === username)
        const teamleadName = user?.displayName || username
        
        if (!teamRequests || teamRequests.length === 0) {
            toast.warning(t('errors.notFound'))
            return
        }

        try {
            const doc = new jsPDF()

            // Logo hinzufügen
            addLogoToPdf(doc)

            doc.setFontSize(18)
            doc.text(t('pdf.teamVacations'), 14, 20)

            doc.setFontSize(11)
            doc.text(`${t('roles.teamlead')}: ${teamleadName}`, 14, 30)
            doc.text(`${t('organization.createdOn')}: ${new Date().toLocaleDateString('de-DE')}`, 14, 36)

            // Sortieren: Erst nach Mitarbeiter, dann nach Startdatum
            const sortedRequests = [...teamRequests].sort((a, b) => {
                // Erst nach displayName/userId sortieren
                const nameA = (a.displayName || a.userId).toLowerCase()
                const nameB = (b.displayName || b.userId).toLowerCase()
                if (nameA !== nameB) {
                    return nameA.localeCompare(nameB)
                }
                // Dann nach Startdatum
                return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            })

            const tableData = sortedRequests.map(req => [
                req.displayName || req.userId,
                formatDate(req.startDate),
                formatDate(req.endDate),
                calculateWorkdays(req.startDate, req.endDate, getHalfDayDates()).toString(),
                req.reason || '-',
                getStatusText(req.status)
            ])

            autoTable(doc, {
                startY: 45,
                head: [[t('roles.employee'), t('common.from'), t('common.to'), t('vacation.vacationDays'), t('common.reason'), t('common.status')]],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [102, 126, 234] },
                styles: { fontSize: 9, cellPadding: 2 }
            })

            const approvedCount = teamRequests.filter(r => r.status === 'approved').length
            const pendingCount = teamRequests.filter(r => r.status === 'pending').length

            const finalY = (doc as any).lastAutoTable.finalY + 10
            doc.setFontSize(10)
            doc.text(`${t('pdf.totalRequests')}: ${teamRequests.length}`, 14, finalY)
            doc.text(`${t('pdf.fullyApproved')}: ${approvedCount}`, 14, finalY + 6)
            doc.text(`${t('pdf.pendingTeamlead')}: ${pendingCount}`, 14, finalY + 12)

            // Seitenzahlen hinzufügen
            addPageNumbers(doc)

            // PDF in neuem Tab öffnen
            const pdfBlob = doc.output('blob')
            const pdfUrl = URL.createObjectURL(pdfBlob)
            window.open(pdfUrl, '_blank')

            toast.success(t('vacation.pdfCreated'))
        } catch (error) {
            console.error('Fehler:', error)
            toast.error(t('errors.genericError'))
        }
    }

    const exportAllVacations = (username: string) => {
        // Hole alle Requests
        const { getAllRequests } = useVacationRequests()
        const allRequests = getAllRequests().value || []
        
        // Hole displayName
        const { orgNodes } = useOrganization()
        const user = orgNodes.value?.find(n => n.userId === username)
        const managerName = user?.displayName || username || 'Unbekannt'
        
        if (!allRequests || allRequests.length === 0) {
            toast.warning(t('errors.notFound'))
            return
        }

        try {
            const doc = new jsPDF()

            // Logo hinzufügen
            addLogoToPdf(doc)

            doc.setFontSize(18)
            doc.text(t('organization.vacationOverviewPdf', { company: branding.company.name }), 14, 20)

            doc.setFontSize(11)
            doc.text(`${t('organization.createdOn')}: ${managerName}`, 14, 30)
            doc.text(`${t('organization.createdOn')}: ${new Date().toLocaleDateString('de-DE')}`, 14, 36)

            // Sortieren: Erst nach Mitarbeiter, dann nach Startdatum
            const sortedRequests = [...allRequests].sort((a, b) => {
                // Erst nach displayName/userId sortieren
                const nameA = (a.displayName || a.userId).toLowerCase()
                const nameB = (b.displayName || b.userId).toLowerCase()
                if (nameA !== nameB) {
                    return nameA.localeCompare(nameB)
                }
                // Dann nach Startdatum
                return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            })

            const tableData = sortedRequests.map(req => [
                req.displayName || req.userId,
                formatDate(req.startDate),
                formatDate(req.endDate),
                calculateWorkdays(req.startDate, req.endDate, getHalfDayDates()).toString(),
                req.reason || '-',
                getStatusText(req.status)
            ])

            autoTable(doc, {
                startY: 45,
                head: [[t('roles.employee'), t('common.from'), t('common.to'), t('vacation.vacationDays'), t('common.reason'), t('common.status')]],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [102, 126, 234] },
                styles: { fontSize: 9, cellPadding: 2 }
            })

            const totalRequests = allRequests.length
            const approvedCount = allRequests.filter(r => r.status === 'approved').length
            const teamleadApprovedCount = allRequests.filter(r => r.status === 'teamlead_approved').length
            const pendingCount = allRequests.filter(r => r.status === 'pending').length
            const rejectedCount = allRequests.filter(r => r.status === 'rejected').length
            const cancelledCount = allRequests.filter(r => r.status === 'cancelled').length
            const totalApprovedDays = allRequests
                .filter(r => r.status === 'approved')
                .reduce((sum, req) => sum + calculateWorkdays(req.startDate, req.endDate, getHalfDayDates()), 0)
            const totalCancelledDays = allRequests
                .filter(r => r.status === 'cancelled')
                .reduce((sum, req) => sum + calculateWorkdays(req.startDate, req.endDate, getHalfDayDates()), 0)

            const finalY = (doc as any).lastAutoTable.finalY + 10
            doc.setFontSize(10)
            doc.setFont('arial', 'bold')
            doc.text(`${t('organization.statistics')}:`, 14, finalY)
            doc.setFont('arial', 'normal')
            doc.text(`${t('pdf.totalRequests')}: ${totalRequests}`, 14, finalY + 6)
            doc.text(`${t('pdf.fullyApproved')}: ${approvedCount}`, 14, finalY + 12)
            doc.text(`${t('pdf.pendingManager')}: ${teamleadApprovedCount}`, 14, finalY + 18)
            doc.text(`${t('pdf.pendingTeamlead')}: ${pendingCount}`, 14, finalY + 24)
            doc.text(`${t('status.rejected')}: ${rejectedCount}`, 14, finalY + 30)
            doc.text(`${t('status.cancelled')}: ${cancelledCount}`, 14, finalY + 36)
            doc.text(`${t('pdf.totalApprovedDays')}: ${totalApprovedDays}`, 14, finalY + 42)
            if (totalCancelledDays > 0) {
                doc.text(`${t('pdf.totalCancelledDays')}: ${totalCancelledDays}`, 14, finalY + 48)
            }

            // Seitenzahlen hinzufügen
            addPageNumbers(doc)

            // PDF in neuem Tab öffnen
            const pdfBlob = doc.output('blob')
            const pdfUrl = URL.createObjectURL(pdfBlob)
            window.open(pdfUrl, '_blank')

            toast.success(t('vacation.pdfCreated'))
        } catch (error) {
            console.error('Fehler:', error)
            toast.error(t('errors.genericError'))
        }
    }

    return {
        exportMyApprovedVacations,
        exportTeamVacations,
        exportAllVacations
    }
}
