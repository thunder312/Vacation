import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { VacationRequest } from '~/types/vacation'
import { formatDate, calculateDays, calculateWorkdays, getStatusText } from '~/utils/dateHelpers'

export const usePdfExport = () => {
    const toast = useToast()

    // Logo als Base64 laden
    const addLogoToPdf = (doc: any) => {
        try {
            // Logo oben rechts einfügen (40x40px)
            doc.addImage('/Logo_TecKonzept_noBg_blue.png', 'PNG', 170, 10, 30, 30)
        } catch (error) {
            console.warn('Logo konnte nicht geladen werden:', error)
        }
    }

    const exportMyApprovedVacations = (
        approvedRequests: VacationRequest[],
        username: string
    ) => {
        if (!approvedRequests || approvedRequests.length === 0) {
            toast.warning('Keine genehmigten Urlaube vorhanden')
            return
        }

        try {
            const doc = new jsPDF()

            // Logo hinzufügen
            addLogoToPdf(doc)

            doc.setFontSize(18)
            doc.text('Meine genehmigten Urlaube', 14, 20)

            doc.setFontSize(11)
            doc.text(`Mitarbeiter: ${username}`, 14, 30)
            doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 36)

            const tableData = approvedRequests.map(req => [
                formatDate(req.startDate),
                formatDate(req.endDate),
                calculateWorkdays(req.startDate, req.endDate).toString(),
                req.reason || '-',
                getStatusText(req.status)
            ])

            autoTable(doc, {
                startY: 45,
                head: [['Von', 'Bis', 'Urlaubstage', 'Grund', 'Status']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [102, 126, 234] },
                styles: { fontSize: 10, cellPadding: 3 }
            })

            const totalDays = approvedRequests.reduce((sum, req) =>
                sum + calculateWorkdays(req.startDate, req.endDate), 0
            )

            const finalY = (doc as any).lastAutoTable.finalY + 10
            doc.setFontSize(11)
            doc.text(`Gesamt genehmigte Urlaubstage: ${totalDays}`, 14, finalY)

            const filename = `Urlaube_${username}_${new Date().toISOString().split('T')[0]}.pdf`
            doc.save(filename)
            toast.success('PDF erfolgreich erstellt!')
        } catch (error) {
            console.error('Fehler beim PDF-Export:', error)
            toast.error('Fehler beim PDF-Export')
        }
    }

    const exportTeamVacations = (
        teamRequests: VacationRequest[],
        teamleadName: string
    ) => {
        if (!teamRequests || teamRequests.length === 0) {
            toast.warning('Keine Team-Urlaube vorhanden')
            return
        }

        try {
            const doc = new jsPDF()

            // Logo hinzufügen
            addLogoToPdf(doc)

            doc.setFontSize(18)
            doc.text('Team-Urlaubsübersicht', 14, 20)

            doc.setFontSize(11)
            doc.text(`Teamlead: ${teamleadName}`, 14, 30)
            doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 36)

            const tableData = teamRequests.map(req => [
                req.user,
                formatDate(req.startDate),
                formatDate(req.endDate),
                calculateWorkdays(req.startDate, req.endDate).toString(),
                req.reason || '-',
                getStatusText(req.status)
            ])

            autoTable(doc, {
                startY: 45,
                head: [['Mitarbeiter', 'Von', 'Bis', 'Urlaubstage', 'Grund', 'Status']],
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
            toast.success('Team-PDF erfolgreich erstellt!')
        } catch (error) {
            console.error('Fehler:', error)
            toast.error('Fehler beim PDF-Export')
        }
    }

    const exportAllVacations = (
        allRequests: VacationRequest[],
        managerName: string
    ) => {
        if (!allRequests || allRequests.length === 0) {
            toast.warning('Keine Urlaube vorhanden')
            return
        }

        try {
            const doc = new jsPDF()

            // Logo hinzufügen
            addLogoToPdf(doc)

            doc.setFontSize(18)
            doc.text('Urlaubsübersicht - TecKonzept', 14, 20)

            doc.setFontSize(11)
            doc.text(`Erstellt von: ${managerName}`, 14, 30)
            doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 36)

            const tableData = allRequests.map(req => [
                req.user,
                formatDate(req.startDate),
                formatDate(req.endDate),
                calculateWorkdays(req.startDate, req.endDate).toString(),
                req.reason || '-',
                getStatusText(req.status)
            ])

            autoTable(doc, {
                startY: 45,
                head: [['Mitarbeiter', 'Von', 'Bis', 'Urlaubstage', 'Grund', 'Status']],
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
            const totalApprovedDays = allRequests
                .filter(r => r.status === 'approved')
                .reduce((sum, req) => sum + calculateWorkdays(req.startDate, req.endDate), 0)

            const finalY = (doc as any).lastAutoTable.finalY + 10
            doc.setFontSize(10)
            doc.setFont('arial', 'bold')
            doc.text('Statistik:', 14, finalY)
            doc.setFont('arial', 'normal')
            doc.text(`Gesamt Anträge: ${totalRequests}`, 14, finalY + 6)
            doc.text(`Vollständig genehmigt: ${approvedCount}`, 14, finalY + 12)
            doc.text(`Bei Manager ausstehend: ${teamleadApprovedCount}`, 14, finalY + 18)
            doc.text(`Bei Teamlead ausstehend: ${pendingCount}`, 14, finalY + 24)
            doc.text(`Abgelehnt: ${rejectedCount}`, 14, finalY + 30)
            doc.text(`Genehmigte Urlaubstage gesamt: ${totalApprovedDays}`, 14, finalY + 36)

            doc.save(`Alle_Urlaube_${new Date().toISOString().split('T')[0]}.pdf`)
            toast.success('Urlaubs-PDF erfolgreich erstellt!')
        } catch (error) {
            console.error('Fehler:', error)
            toast.error('Fehler beim PDF-Export')
        }
    }

    return {
        exportMyApprovedVacations,
        exportTeamVacations,
        exportAllVacations
    }
}
