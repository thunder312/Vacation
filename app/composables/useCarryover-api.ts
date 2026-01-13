// composables/useCarryover.ts
export interface UserCarryover {
  id: number
  userId: string
  year: number
  carryoverDays: number
  expiryDate?: string
}

export const useCarryover = () => {
  const toast = useToast()
  
  // State für Carryover-Daten
  const carryovers = useState<UserCarryover[]>('carryovers', () => [])
  const loading = useState('carryoversLoading', () => false)

  // Carryover-Daten vom Server laden
  const fetchCarryovers = async () => {
    loading.value = true
    try {
      const data = await $fetch<UserCarryover[]>('/api/carryover')
      carryovers.value = data
    } catch (error) {
      console.error('Failed to fetch carryovers:', error)
      toast.error('Fehler beim Laden der Übertragstage')
    } finally {
      loading.value = false
    }
  }

  // Carryover für User holen
  const getCarryover = (userId: string, year: number = new Date().getFullYear()) => {
    return computed(() => {
      const carryover = carryovers.value.find(
        c => c.userId === userId && c.year === year
      )

      if (!carryover) return 0

      // Prüfen ob abgelaufen
      if (carryover.expiryDate) {
        const expiry = new Date(carryover.expiryDate)
        const now = new Date()
        if (now > expiry) {
          return 0
        }
      }

      return carryover.carryoverDays
    })
  }

  // Carryover setzen/aktualisieren
  const setCarryover = async (
    userId: string, 
    carryoverDays: number, 
    year: number = new Date().getFullYear(),
    expiryDate?: string
  ) => {
    try {
      const result = await $fetch<UserCarryover & { updated: boolean }>('/api/carryover', {
        method: 'POST',
        body: { userId, year, carryoverDays, expiryDate }
      })

      // Lokale Liste aktualisieren
      const existingIndex = carryovers.value.findIndex(
        c => c.userId === userId && c.year === year
      )

      if (existingIndex >= 0) {
        carryovers.value[existingIndex] = result
        toast.success('Übertrag aktualisiert')
      } else {
        carryovers.value.push(result)
        toast.success('Übertrag hinzugefügt')
      }

      return true
    } catch (error) {
      console.error('Failed to set carryover:', error)
      toast.error('Fehler beim Speichern des Übertrags')
      return false
    }
  }

  // Carryover entfernen
  const removeCarryover = async (userId: string, year: number) => {
    try {
      const carryover = carryovers.value.find(
        c => c.userId === userId && c.year === year
      )

      if (!carryover) {
        toast.error('Übertrag nicht gefunden')
        return false
      }

      await $fetch(`/api/carryover/${carryover.id}`, {
        method: 'DELETE'
      })

      // Lokale Liste aktualisieren
      carryovers.value = carryovers.value.filter(c => c.id !== carryover.id)
      
      toast.success('Übertrag entfernt')
      return true
    } catch (error) {
      console.error('Failed to remove carryover:', error)
      toast.error('Fehler beim Entfernen des Übertrags')
      return false
    }
  }

  // Prüfen ob Carryover bald abläuft (innerhalb 30 Tage)
  const isCarryoverExpiringSoon = (userId: string, year: number): boolean => {
    const carryover = carryovers.value.find(
      c => c.userId === userId && c.year === year
    )

    if (!carryover?.expiryDate) return false

    const expiry = new Date(carryover.expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return daysUntilExpiry > 0 && daysUntilExpiry <= 30
  }

  // Alle Carryovers
  const getAllCarryovers = computed(() => carryovers.value)

  return {
    carryovers: readonly(carryovers),
    loading: readonly(loading),
    fetchCarryovers,
    getCarryover,
    setCarryover,
    removeCarryover,
    isCarryoverExpiringSoon,
    getAllCarryovers
  }
}
