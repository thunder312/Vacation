// composables/useVacationBalance.ts
import type { VacationBalance } from '~/types/vacation'
import { calculateWorkdays } from '~/utils/dateHelpers'

const STANDARD_VACATION_DAYS = 30

export const useVacationBalance = () => {
  const { getAllRequests } = useVacationRequests()
  const { getCarryover } = useCarryover()

  // Berechnet genutzte Urlaubstage (nur genehmigte) MIT EXCEPTIONS - STRIKT NACH JAHR
  const calculateUsedDays = async (userId: string, year: number): Promise<number> => {
    const allRequests = getAllRequests()

    // Null-Check: Wenn noch keine Daten geladen
    if (!allRequests || !allRequests.value || allRequests.value.length === 0) {
      return 0
    }

    // Filter: Nur genehmigte Requests UND nur für das angegebene Jahr
    const approvedRequests = allRequests.value.filter(r => {
      if (r.userId !== userId || r.status !== 'approved') return false

      // Prüfe ob der Urlaub im angegebenen Jahr liegt
      const startYear = new Date(r.startDate).getFullYear()
      const endYear = new Date(r.endDate).getFullYear()

      // Urlaub zählt zum Jahr, wenn Start ODER Ende im Jahr liegt
      return startYear === year || endYear === year
    })

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
      // Bestimme den effektiven Zeitraum für das betrachtete Jahr
      const requestStart = new Date(request.startDate)
      const requestEnd = new Date(request.endDate)
      const yearStart = new Date(year, 0, 1) // 1. Januar des Jahres
      const yearEnd = new Date(year, 11, 31) // 31. Dezember des Jahres

      // Schneide den Urlaub auf das betrachtete Jahr zu
      const effectiveStart = requestStart < yearStart ? yearStart : requestStart
      const effectiveEnd = requestEnd > yearEnd ? yearEnd : requestEnd

      // Formatiere Daten für calculateWorkdays
      const effectiveStartStr = effectiveStart.toISOString().split('T')[0]
      const effectiveEndStr = effectiveEnd.toISOString().split('T')[0]

      // Finde Exceptions für diesen Request (nur die im betrachteten Jahr)
      const requestExceptions = userExceptions.filter((ex: any) => {
        if (ex.vacationRequestId !== request.id) return false
        const exDate = new Date(ex.date)
        return exDate >= yearStart && exDate <= yearEnd
      })

      const days = calculateWorkdays(
        effectiveStartStr,
        effectiveEndStr,
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
    const usedDays = await calculateUsedDays(userId, year) // Jahr übergeben!
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
  const isInDeficit = async (userId: string, year: number = new Date().getFullYear()): Promise<boolean> => {
    const balance = await getBalance(userId, year)
    return balance.remainingDays < 0
  }

  // Prüft ob Urlaubskonto fast aufgebraucht ist (< 5 Tage)
  const isLowBalance = async (userId: string, year: number = new Date().getFullYear()): Promise<boolean> => {
    const balance = await getBalance(userId, year)
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
