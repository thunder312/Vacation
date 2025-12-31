// composables/useVacationBalance.ts
import type { VacationBalance } from '~/types/vacation'
import { calculateWorkdays } from '~/utils/dateHelpers'

const STANDARD_VACATION_DAYS = 30

export const useVacationBalance = () => {
  const { getAllRequests } = useVacationRequests()
  const { getCarryover } = useCarryover()

  // Berechnet genutzte Urlaubstage (nur genehmigte) - MIT EXCEPTIONS
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
    let exceptions: Array<{date: string, deduction: number, vacationRequestId: number}> = []
    try {
      exceptions = await $fetch(`/api/vacation-exceptions?userId=${userId}`)
    } catch (error) {
      console.warn('Could not load exceptions:', error)
    }

    let totalDays = 0
    for (const request of approvedRequests) {
      // Finde relevante Exceptions für diesen Urlaubsantrag
      const relevantExceptions = exceptions
        .filter(e => e.vacationRequestId === request.id)
        .map(e => ({ date: e.date, deduction: e.deduction }))

      const days = calculateWorkdays(
        request.startDate,
        request.endDate,
        halfDayDates.value || [],
        relevantExceptions // ← NEU: Exceptions übergeben
      )
      totalDays += days
    }

    return totalDays
  }

  // Urlaubskonto für einen User abrufen - ASYNC wegen exceptions
  const getBalance = async (userId: string, year: number = new Date().getFullYear()): Promise<VacationBalance> => {
    const carryoverDays = getCarryover(userId, year).value
    const totalDays = STANDARD_VACATION_DAYS + carryoverDays
    const usedDays = await calculateUsedDays(userId) // ← Jetzt async
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

  // Computed für aktuellen User - ASYNC Ref
  const getCurrentUserBalance = (userId: string) => {
    const balance = ref<VacationBalance | null>(null)
    const loading = ref(true)

    const load = async () => {
      loading.value = true
      try {
        // Warte bis Daten geladen sind
        const allRequests = getAllRequests()
        if (!allRequests || !allRequests.value) {
          balance.value = null
          return
        }

        balance.value = await getBalance(userId)
      } catch (error) {
        console.error('Error loading balance:', error)
        balance.value = null
      } finally {
        loading.value = false
      }
    }

    // Initial load
    load()

    // Watch für Updates
    const allRequests = getAllRequests()
    watch(() => allRequests.value, () => {
      load()
    })

    return { balance: computed(() => balance.value), loading, refresh: load }
  }

  // Prüft ob Urlaubskonto im Minus ist - ASYNC
  const isInDeficit = async (userId: string): Promise<boolean> => {
    const balance = await getBalance(userId)
    return balance.remainingDays < 0
  }

  // Prüft ob Urlaubskonto fast aufgebraucht ist (< 5 Tage) - ASYNC
  const isLowBalance = async (userId: string): Promise<boolean> => {
    const balance = await getBalance(userId)
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
