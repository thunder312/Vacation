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
   * Erstellt eine Preview der User Änderungen beim Jahreswechsel
   */
  const getYearTransitionPreviewUser = async () => {
    try {
      const data = await $fetch('/api/year-transition/previewUser')
      return data
    } catch (error) {
      console.error('Fehler beim Erstellen der Preview der User:', error)
      return []
    }
  }

    /**
     * Erstellt eine Preview der Halbtage Änderungen beim Jahreswechsel
     */
    const getYearTransitionPreviewHalfDays = async () => {
        try {
            const data = await $fetch('/api/year-transition/previewHalfDays')
            console.log('useYearTransition data: ', data);
            return data
        } catch (error) {
            console.error('Fehler beim Erstellen der Preview der Halbtage:', error)
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
    getYearTransitionPreviewUser,
      getYearTransitionPreviewHalfDays,
    executeYearTransition
  }
}
