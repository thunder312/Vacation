import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { VacationRequest } from '~/types/vacation'
import { formatDate, calculateDays, getStatusText } from '~/utils/dateHelpers'

export const usePdfExport = () => {
    const exportMyApprovedVacations = (
        approvedRequests: VacationRequest[],
        username: string
    ) => {
        if (!approvedRequests || approvedRequests.length === 0) {
            alert('Keine genehmigten Urlaube vorhanden')
            return
        }

        try {
            const doc = new jsPDF()

            doc.setFontSize(18)
            doc.text('Meine genehmigten Urlaube', 14, 20)

            doc.setFontSize(11)
            doc.text(`Mitarbeiter: ${username}`, 14, 30)
            doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 36)

            const tableData = approvedRequests.map(req => [
                formatDate(req.startDate),
                formatDate(req.endDate),
                calculateDays(req.startDate, req.endDate).toString(),
                req.reason || '-',
                getStatusText(req.status)
            ])

            autoTable(doc, {
                startY: 45,
                head: [['Von', 'Bis', 'Tage', 'Grund', 'Status']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [102, 126, 234] },
                styles: { fontSize: 10, cellPadding: 3 }
            })

            const totalDays = approvedRequests.reduce((sum, req) =>
                sum + calculateDays(req.startDate, req.endDate), 0
            )

            const finalY = (doc as any).lastAutoTable.finalY + 10
            doc.setFontSize(11)
            doc.text(`Gesamt genehmigte Urlaubstage: ${totalDays}`, 14, finalY)

            const filename = `Urlaube_${username}_${new Date().toISOString().split('T')[0]}.pdf`
            doc.save(filename)
        } catch (error) {
            console.error('Fehler beim PDF-Export:', error)
            alert('Fehler beim PDF-Export: ' + error)
        }
    }

    const exportTeamVacations = (
        teamRequests: VacationRequest[],
        teamleiterName: string
    ) => {
        if (!teamRequests || teamRequests.length === 0) {
            alert('Keine Team-Urlaube vorhanden')
            return
        }

        try {
            const doc = new jsPDF()

            doc.setFontSize(18)
            doc.text('Team-Urlaubsübersicht', 14, 20)

            doc.setFontSize(11)
            doc.text(`Teamleiter: ${teamleiterName}`, 14, 30)
            doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 36)

            const tableData = teamRequests.map(req => [
                req.user,
                formatDate(req.startDate),
                formatDate(req.endDate),
                calculateDays(req.startDate, req.endDate).toString(),
                req.reason || '-',
                getStatusText(req.status)
            ])

            autoTable(doc, {
                startY: 45,
                head: [['Mitarbeiter', 'Von', 'Bis', 'Tage', 'Grund', 'Status']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [102, 126, 234] },
                styles: { fontSize: 9, cellPadding: 2 }
            })

            const approvedCount = teamRequests.filter(r => r.status === 'approved').length
            const pendingCount = teamRequests.filter(r => r.status === 'pending').length

            const finalY = (doc as any).lastAutoTable.finalY + 10
            doc.setFontSize(10)
            doc.text(`Gesamt Anträge: ${teamRequests.length}`, 14, finalY)
            doc.text(`Genehmigt: ${approvedCount}`, 14, finalY + 6)
            doc.text(`Ausstehend: ${pendingCount}`, 14, finalY + 12)

            doc.save(`Team_Urlaube_${new Date().toISOString().split('T')[0]}.pdf`)
        } catch (error) {
            console.error('Fehler:', error)
            alert('Fehler beim PDF-Export: ' + error)
        }
    }

    const exportAllVacations = (
        allRequests: VacationRequest[],
        chefName: string
    ) => {
        if (!allRequests || allRequests.length === 0) {
            alert('Keine Urlaube vorhanden')
            return
        }

        try {
            const doc = new jsPDF()

            doc.setFontSize(18)
            doc.text('Urlaubsübersicht - Gesamtunternehmen', 14, 20)

            doc.setFontSize(11)
            doc.text(`Erstellt von: ${chefName} (Chef)`, 14, 30)
            doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 36)

            const tableData = allRequests.map(req => [
                req.user,
                formatDate(req.startDate),
                formatDate(req.endDate),
                calculateDays(req.startDate, req.endDate).toString(),
                req.reason || '-',
                getStatusText(req.status)
            ])

            autoTable(doc, {
                startY: 45,
                head: [['Mitarbeiter', 'Von', 'Bis', 'Tage', 'Grund', 'Status']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [102, 126, 234] },
                styles: { fontSize: 9, cellPadding: 2 }
            })

            const totalRequests = allRequests.length
            const approvedCount = allRequests.filter(r => r.status === 'approved').length
            const teamleiterApprovedCount = allRequests.filter(r => r.status === 'teamleiter_approved').length
            const pendingCount = allRequests.filter(r => r.status === 'pending').length
            const rejectedCount = allRequests.filter(r => r.status === 'rejected').length
            const totalApprovedDays = allRequests
                .filter(r => r.status === 'approved')
                .reduce((sum, req) => sum + calculateDays(req.startDate, req.endDate), 0)

            const finalY = (doc as any).lastAutoTable.finalY + 10
            doc.setFontSize(10)
            doc.setFont('Arial', 'bold')
            doc.text('Statistik:', 14, finalY)
            doc.setFont('Arial', 'normal')
            doc.text(`Gesamt Anträge: ${totalRequests}`, 14, finalY + 6)
            doc.text(`Vollständig genehmigt: ${approvedCount}`, 14, finalY + 12)
            doc.text(`Bei Chef ausstehend: ${teamleiterApprovedCount}`, 14, finalY + 18)
            doc.text(`Bei Teamleiter ausstehend: ${pendingCount}`, 14, finalY + 24)
            doc.text(`Abgelehnt: ${rejectedCount}`, 14, finalY + 30)
            doc.text(`Genehmigte Urlaubstage gesamt: ${totalApprovedDays}`, 14, finalY + 36)

            doc.save(`Alle_Urlaube_${new Date().toISOString().split('T')[0]}.pdf`)
        } catch (error) {
            console.error('Fehler:', error)
            alert('Fehler beim PDF-Export: ' + error)
        }
    }

    return {
        exportMyApprovedVacations,
        exportTeamVacations,
        exportAllVacations
    }
}