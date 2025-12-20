import { isWorkday } from '~/utils/holidays'

export const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export const calculateDays = (start: string, end: string): number => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

export const calculateWorkdays = (start: string, end: string, halfDayDates: string[] = []): number => {
    const startDate = new Date(start)
    const endDate = new Date(end)

    let workdays = 0
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
        if (isWorkday(currentDate)) {
            const dateStr = currentDate.toISOString().split('T')[0]
            
            // Prüfen ob es ein Halbtag ist
            if (halfDayDates.includes(dateStr)) {
                workdays += 0.5
            } else {
                workdays += 1
            }
        }
        currentDate.setDate(currentDate.getDate() + 1)
    }

    return workdays
}

export const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
        pending: t('status.pending'),
        teamlead_approved: t('status.teamleadApproved'),
        approved: t('status.approved'),
        rejected: t('status.rejected'),
        cancelled: t('status.cancelled')
    }
    return statusMap[status] || status
}

export const getStatusTextWithIcon = (status: string): string => {
    const statusMap: Record<string, string> = {
        pending: t('status.pending'),
        teamlead_approved: 'Teamlead ✓',
        approved: 'Genehmigt ✓✓',
        rejected: t('status.rejected'),
        cancelled: '🚫 Abgesagt'
    }
    return statusMap[status] || status
}
