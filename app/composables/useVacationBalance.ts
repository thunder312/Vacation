// composables/useVacationBalance.ts
import type { VacationBalance } from '~/types/vacation'
import { calculateWorkdays } from '~/utils/dateHelpers'

const STANDARD_VACATION_DAYS = 30

export const useVacationBalance = () => {
  const { getAllRequests } = useVacationRequests()
  const { getCarryover } = useCarryover()

  // Berechnet genutzte Urlaubstage (nur genehmigte)
  const calculateUsedDays = (userId: string): number => {
    const allRequests = getAllRequests()
    
    // Null-Check: Wenn noch keine Daten geladen
    if (!allRequests || !allRequests.value || allRequests.value.length === 0) {
      return 0
    }

    const approvedRequests = allRequests.value.filter(
      r => r.userId === userId && r.status === 'approved'
    )

    if (approvedRequests.length === 0) return 0

    const { halfDayDates } = useHalfDayRules()

    let totalDays = 0
    for (const request of approvedRequests) {
      const days = calculateWorkdays(
        request.startDate,
        request.endDate,
        halfDayDates.value || []
      )
      totalDays += days
    }

    return totalDays
  }

  // Urlaubskonto für einen User abrufen
  const getBalance = (userId: string, year: number = new Date().getFullYear()): VacationBalance => {
    const carryoverDays = getCarryover(userId, year).value
    const totalDays = STANDARD_VACATION_DAYS + carryoverDays
    const usedDays = calculateUsedDays(userId)
    const remainingDays = totalDays - usedDays

    return {
      userId,
      year,
      standardDays: STANDARD_VACATION_DAYS,
      carryoverDays,
      totalDays,
      usedDays,
      remainingDays
    }
  }

  // Computed für aktuellen User
  const getCurrentUserBalance = (userId: string) => {
    return computed(() => {
      // Warte bis Daten geladen sind
      const allRequests = getAllRequests()
      if (!allRequests || !allRequests.value) {
        return null
      }

      return getBalance(userId)
    })
  }

  // Prüft ob Urlaubskonto im Minus ist
  const isInDeficit = (userId: string): boolean => {
    const balance = getBalance(userId)
    return balance.remainingDays < 0
  }

  // Prüft ob Urlaubskonto fast aufgebraucht ist (< 5 Tage)
  const isLowBalance = (userId: string): boolean => {
    const balance = getBalance(userId)
    return balance.remainingDays < 5 && balance.remainingDays >= 0
  }

  return {
    getBalance,
    getCurrentUserBalance,
    isInDeficit,
    isLowBalance,
    STANDARD_VACATION_DAYS
  }
}
