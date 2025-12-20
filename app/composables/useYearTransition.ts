// app/composables/useYearTransition.ts
export const useYearTransition = () => {
  /**
   * Prüft ob ein Jahreswechsel nötig ist
   */
  const checkYearTransitionNeeded = async () => {
    try {
      const data = await $fetch('/api/year-transition/check')
      return data
    } catch (error) {
      console.error('Fehler beim Prüfen des Jahreswechsels:', error)
      return {
        needed: false,
        lastYear: new Date().getFullYear(),
        currentYear: new Date().getFullYear()
      }
    }
  }

  /**
   * Erstellt eine Preview der Änderungen beim Jahreswechsel
   */
  const getYearTransitionPreview = async () => {
    try {
      const data = await $fetch('/api/year-transition/preview')
      return data
    } catch (error) {
      console.error('Fehler beim Erstellen der Preview:', error)
      return []
    }
  }

  /**
   * Führt den Jahreswechsel durch
   */
  const executeYearTransition = async () => {
    try {
      const data = await $fetch('/api/year-transition/execute', {
        method: 'POST'
      })
      return data
    } catch (error) {
      console.error('Fehler beim Jahreswechsel:', error)
      throw error
    }
  }

  return {
    checkYearTransitionNeeded,
    getYearTransitionPreview,
    executeYearTransition
  }
}
