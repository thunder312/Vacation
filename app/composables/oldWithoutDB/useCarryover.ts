import type { UserCarryover } from '~/types/vacation'

export const useCarryover = () => {
    const toast = useToast()
    
    // Mock-Daten für Übertrag (später durch API/DB ersetzen)
    const carryovers = ref<UserCarryover[]>([
        {
            userId: 'Mustermann',
            year: 2025,
            carryoverDays: 8,
            // Kein Verfallsdatum = bleibt gültig
        },
        {
            userId: 'Schmidt',
            year: 2025,
            carryoverDays: 3,
            expiryDate: '2025-03-31'
        }
    ])

    // Übertrag für einen User abrufen
    const getCarryover = (userId: string, year: number = new Date().getFullYear()): number => {
        const carryover = carryovers.value.find(
            c => c.userId === userId && c.year === year
        )
        
        // Prüfen ob Übertrag bereits verfallen ist
        if (carryover?.expiryDate) {
            const expiry = new Date(carryover.expiryDate)
            const today = new Date()
            if (today > expiry) {
                return 0 // Übertrag verfallen
            }
        }
        
        return carryover?.carryoverDays || 0
    }

    // Übertrag setzen/aktualisieren
    const setCarryover = (userId: string, days: number, year: number = new Date().getFullYear(), expiryDate?: string) => {
        const index = carryovers.value.findIndex(
            c => c.userId === userId && c.year === year
        )

        const newCarryover: UserCarryover = {
            userId,
            year,
            carryoverDays: days,
            expiryDate
        }

        if (index > -1) {
            carryovers.value[index] = newCarryover
            toast.success('Übertrag aktualisiert')
        } else {
            carryovers.value.push(newCarryover)
            toast.success('Übertrag hinzugefügt')
        }

        return true
    }

    // Übertrag löschen
    const removeCarryover = (userId: string, year: number = new Date().getFullYear()) => {
        const index = carryovers.value.findIndex(
            c => c.userId === userId && c.year === year
        )

        if (index > -1) {
            carryovers.value.splice(index, 1)
            toast.success('Übertrag gelöscht')
            return true
        }
        return false
    }

    // Alle Überträge abrufen
    const getAllCarryovers = computed(() => [...carryovers.value])

    // Prüfen ob Übertrag bald verfällt (innerhalb 30 Tage)
    const isCarryoverExpiringSoon = (userId: string, year: number = new Date().getFullYear()): boolean => {
        const carryover = carryovers.value.find(
            c => c.userId === userId && c.year === year
        )

        if (!carryover?.expiryDate) return false

        const expiry = new Date(carryover.expiryDate)
        const today = new Date()
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        return daysUntilExpiry > 0 && daysUntilExpiry <= 30
    }

    return {
        carryovers: readonly(carryovers),
        getCarryover,
        setCarryover,
        removeCarryover,
        getAllCarryovers,
        isCarryoverExpiringSoon
    }
}
