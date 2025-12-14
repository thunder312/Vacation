import type { VacationBalance } from '~/types/vacation'
import { calculateWorkdays } from '~/utils/dateHelpers'

export const useVacationBalance = () => {
    const { getAllRules } = useHalfDayRules()
    const { getAllRequests } = useVacationRequests()
    const { getCarryover } = useCarryover()
    
    const STANDARD_VACATION_DAYS = 30
    const currentYear = new Date().getFullYear()

    // Berechnet die genutzten Urlaubstage für einen User
    const calculateUsedDays = (userId: string): number => {
        const halfDayDates = getAllRules.value.map(rule => rule.date)
        const allRequests = getAllRequests.value
        
        // Sicherheitscheck falls requests noch nicht geladen sind
        if (!allRequests || allRequests.length === 0) {
            return 0
        }
        
        // Nur approved requests zählen
        const approvedRequests = allRequests.filter(
            r => r.userId === userId && r.status === 'approved'
        )

        return approvedRequests.reduce((total, request) => {
            return total + calculateWorkdays(request.startDate, request.endDate, halfDayDates)
        }, 0)
    }

    // Gibt das Urlaubskonto für einen User zurück
    const getBalance = (userId: string): VacationBalance => {
        const usedDays = calculateUsedDays(userId)
        const standardDays = STANDARD_VACATION_DAYS
        const carryoverDays = getCarryover(userId, currentYear)
        const totalDays = standardDays + carryoverDays
        const remainingDays = totalDays - usedDays

        return {
            userId,
            totalDays,
            carryoverDays,
            standardDays,
            usedDays,
            remainingDays,
            year: currentYear
        }
    }

    // Computed für aktuellen User
    const getCurrentUserBalance = (userId: string) => {
        return computed(() => getBalance(userId))
    }

    // Prüft ob genug Urlaubstage verfügbar sind
    const hasEnoughDays = (userId: string, requestedDays: number): boolean => {
        const balance = getBalance(userId)
        return balance.remainingDays >= requestedDays
    }

    return {
        getBalance,
        getCurrentUserBalance,
        calculateUsedDays,
        hasEnoughDays,
        STANDARD_VACATION_DAYS
    }
}
