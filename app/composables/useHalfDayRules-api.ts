// composables/useHalfDayRules.ts
export interface HalfDayRule {
  id: number
  date: string
  description: string
  createdBy: string
}

export const useHalfDayRules = () => {
  const toast = useToast()
  const { currentUser } = useAuth()
  
  // State für Halbtags-Regeln
  const halfDayRules = useState<HalfDayRule[]>('halfDayRules', () => [])
  const loading = useState('halfDayRulesLoading', () => false)

  // Regeln vom Server laden
  const fetchHalfDayRules = async () => {
    loading.value = true
    try {
      const data = await $fetch<HalfDayRule[]>('/api/half-day-rules')
      // Nur Halbtage des aktuellen Jahres anzeigen
      halfDayRules.value = data.filter((d) => d.date.substring(0, 4) === new Date().getFullYear().toString())
    } catch (error) {
      console.error('Failed to fetch half day rules:', error)
      toast.error('Fehler beim Laden der Halbtags-Regelungen')
    } finally {
      loading.value = false
    }
  }

  // Neue Regel hinzufügen
  const addHalfDayRule = async (date: string, description: string) => {
    try {
      const createdBy = currentUser.value?.username || 'admin'
      
      const newRule = await $fetch<HalfDayRule>('/api/half-day-rules', {
        method: 'POST',
        body: { date, description, createdBy }
      })

      // Lokale Liste aktualisieren
      halfDayRules.value.push(newRule)
      halfDayRules.value.sort((a, b) => a.date.localeCompare(b.date))
      
      toast.success('Halbtags-Regelung hinzugefügt')
      return true
    } catch (error: any) {
      console.error('Failed to add half day rule:', error)
      
      if (error.statusCode === 409) {
        toast.error('Für dieses Datum existiert bereits eine Regelung')
      } else {
        toast.error('Fehler beim Hinzufügen')
      }
      return false
    }
  }

  // Regel entfernen
  const removeHalfDayRule = async (id: number) => {
    try {
      await $fetch(`/api/half-day-rules/${id}`, {
        method: 'DELETE'
      })

      // Lokale Liste aktualisieren
      halfDayRules.value = halfDayRules.value.filter(r => r.id !== id)
      
      toast.success('Halbtags-Regelung entfernt')
      return true
    } catch (error) {
      console.error('Failed to remove half day rule:', error)
      toast.error('Fehler beim Entfernen')
      return false
    }
  }

  // Alle Daten auch Alte. Nicht Jahres unabhängig
  const isHalfDay = (date: string): boolean => {
    return halfDayRules.value.some(rule => rule.date === date)
  }

  // Alle Halbtags-Daten als Array
  const halfDayDates = computed(() => 
    halfDayRules.value.map(rule => rule.date)
  )

  return {
    halfDayRules: readonly(halfDayRules),
    halfDayDates,
    loading: readonly(loading),
    fetchHalfDayRules,
    addHalfDayRule,
    removeHalfDayRule,
    isHalfDay
  }
}
