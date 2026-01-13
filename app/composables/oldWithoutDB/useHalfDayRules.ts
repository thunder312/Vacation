import type { HalfDayRule } from '~/types/vacation'

export const useHalfDayRules = () => {
    const toast = useToast()
    
    // Mock-Daten (später durch API/localStorage ersetzen)
    const rules = ref<HalfDayRule[]>([
        {
            id: 1,
            date: '2025-12-24',
            description: 'Heiligabend',
            createdBy: 'admin',
            createdAt: '2025-01-15'
        },
        {
            id: 2,
            date: '2025-12-31',
            description: 'Silvester',
            createdBy: 'admin',
            createdAt: '2025-01-15'
        }
    ])

    const addRule = (date: string, description: string, createdBy: string) => {
        // Prüfen ob Datum bereits existiert
        const exists = rules.value.find(r => r.date === date)
        if (exists) {
            toast.warning('Für dieses Datum existiert bereits eine Regelung')
            return false
        }

        const newRule: HalfDayRule = {
            id: Date.now(),
            date,
            description,
            createdBy,
            createdAt: new Date().toISOString().split('T')[0]
        }

        rules.value.push(newRule)
        rules.value.sort((a, b) => a.date.localeCompare(b.date))
        toast.success('Halbtags-Regelung hinzugefügt')
        return true
    }

    const removeRule = (id: number) => {
        const index = rules.value.findIndex(r => r.id === id)
        if (index > -1) {
            rules.value.splice(index, 1)
            toast.success('Regelung gelöscht')
            return true
        }
        return false
    }

    const isHalfDay = (dateStr: string): boolean => {
        return rules.value.some(r => r.date === dateStr)
    }

    const getAllRules = computed(() => [...rules.value])

    return {
        rules: readonly(rules),
        addRule,
        removeRule,
        isHalfDay,
        getAllRules
    }
}
