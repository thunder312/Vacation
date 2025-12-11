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

export const calculateWorkdays = (start: string, end: string): number => {
    const startDate = new Date(start)
    const endDate = new Date(end)

    let workdays = 0
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
        if (isWorkday(currentDate)) {
            workdays++
        }
        currentDate.setDate(currentDate.getDate() + 1)
    }

    return workdays
}

export const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
        pending: 'Ausstehend',
        teamleiter_approved: 'Teamleiter genehmigt',
        approved: 'Genehmigt',
        rejected: 'Abgelehnt'
    }
    return statusMap[status] || status
}

export const getStatusTextWithIcon = (status: string): string => {
    const statusMap: Record<string, string> = {
        pending: 'Ausstehend',
        teamleiter_approved: 'Teamleiter ✓',
        approved: 'Genehmigt ✓✓',
        rejected: 'Abgelehnt'
    }
    return statusMap[status] || status
}