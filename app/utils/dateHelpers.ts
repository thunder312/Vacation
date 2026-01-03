import { isWorkday } from '~/utils/holidays'
import { icons } from '~/config/icons'

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

// Hilfsfunktion: Prüft ob ein Datum einem Halbtag entspricht (jahresunabhängig)
const isHalfDay = (dateStr: string, halfDayDates: string[]): boolean => {
    // Extrahiere Monat und Tag aus dem aktuellen Datum (Format: YYYY-MM-DD)
    const monthDay = dateStr.slice(5) // z.B. "12-24"

    // Prüfe ob einer der Halbtage denselben Monat+Tag hat
    return halfDayDates.some(hd => hd.slice(5) === monthDay)
}

export const calculateWorkdays = (
    start: string,
    end: string,
    halfDayDates: string[] = [],
    exceptions?: Array<{date: string, deduction: number}>
): number => {
    const startDate = new Date(start)
    const endDate = new Date(end)

    let workdays = 0
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
        if (isWorkday(currentDate)) {
            const dateStr = currentDate.toISOString().split('T')[0]

            // Prüfe ob es eine personalisierte Exception gibt
            const exception = exceptions?.find(e => e.date === dateStr)
            if (exception) {
                // Exception: 1 - deduction (z.B. 1 - 0.5 = 0.5)
                workdays += Math.max(0, 1 - exception.deduction)
            }
            // Sonst prüfe globale Halbtage (jahresunabhängig!)
            else if (isHalfDay(dateStr, halfDayDates)) {
                workdays += 0.5
            }
            // Normal workday
            else {
                workdays += 1
            }
        }
        currentDate.setDate(currentDate.getDate() + 1)
    }

    return workdays
}

export const getStatusText = (status: string): string => {
    const { t } = useI18n()
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
    const { t } = useI18n()
    const statusMap: Record<string, string> = {
        pending: `${icons.status.pending} ${t('status.pending')}`,
        teamlead_approved: `${icons.actions.approve} ${t('status.teamleadApproved')}`,
        approved: `${icons.status.approved} ${t('status.approved')}`,
        rejected: `${icons.actions.reject} ${t('status.rejected')}`,
        cancelled: `${icons.status.cancelled} ${t('status.cancelled')}`
    }
    return statusMap[status] || status
}
