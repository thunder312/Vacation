export const useLocale = () => {
  const i18n = useI18n()

  const saveLocale = (newLocale: string) => {
    i18n.setLocale(newLocale as 'de' | 'en' | 'pt-br')
    if (process.client) {
      localStorage.setItem('user-locale', newLocale)
    }
  }

  const loadLocale = () => {
    if (process.client) {
      const savedLocale = localStorage.getItem('user-locale')
      if (savedLocale) {
        i18n.setLocale(savedLocale as 'de' | 'en' | 'pt-br')
        return savedLocale
      }
    }
    return i18n.locale.value
  }

  return {
    locale: i18n.locale,  // Gebe das originale ref zurück, nicht destrukturiert!
    saveLocale,
    loadLocale
  }
}
