// composables/useVacationBalance.ts
import type { VacationBalance } from '~/types/vacation'
import { calculateWorkdays } from '~/utils/dateHelpers'

const STANDARD_VACATION_DAYS = 30

export const useVacationBalance = () => {
  const { getAllRequests } = useVacationRequests()
  const { getCarryover } = useCarryover()

  // Berechnet genutzte Urlaubstage (nur genehmigte) MIT EXCEPTIONS
  const calculateUsedDays = async (userId: string): Promise<number> => {
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

    // Lade Exceptions für diesen User
    let userExceptions: any[] = []
    try {
      userExceptions = await $fetch(`/api/vacation-exceptions?userId=${userId}`)
    } catch (err) {
      console.warn('Could not load exceptions:', err)
      userExceptions = []
    }

    let totalDays = 0
    for (const request of approvedRequests) {
      // Finde Exceptions für diesen Request
      const requestExceptions = userExceptions.filter(
        (ex: any) => ex.vacationRequestId === request.id
      )
      
      const days = calculateWorkdays(
        request.startDate,
        request.endDate,
        halfDayDates.value || [],
        requestExceptions
      )
      totalDays += days
    }

    return totalDays
  }

  // Urlaubskonto für einen User abrufen
  const getBalance = async (userId: string, year: number = new Date().getFullYear()): Promise<VacationBalance> => {
    const carryoverDays = getCarryover(userId, year).value
    const totalDays = STANDARD_VACATION_DAYS + carryoverDays
    const usedDays = await calculateUsedDays(userId)
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
    return computed(async () => {
      // Warte bis Daten geladen sind
      const allRequests = getAllRequests()
      if (!allRequests || !allRequests.value) {
        return null
      }

      return await getBalance(userId)
    })
  }

  // Prüft ob Urlaubskonto im Minus ist
  const isInDeficit = async (userId: string): Promise<boolean> => {
    const balance = await getBalance(userId)
    return balance.remainingDays < 0
  }

  // Prüft ob Urlaubskonto fast aufgebraucht ist (< 5 Tage)
  const isLowBalance = async (userId: string): Promise<boolean> => {
    const balance = await getBalance(userId)
    return balance.remainingDays < 5
  }

  return {
    calculateUsedDays,
    getBalance,
    getCurrentUserBalance,
    isInDeficit,
    isLowBalance
  }
}
