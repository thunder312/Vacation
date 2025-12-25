export const useLocale = () => {
  const { locale, setLocale } = useI18n()

  const saveLocale = (newLocale: string) => {
    setLocale(newLocale)
    if (process.client) {
      localStorage.setItem('user-locale', newLocale)
    }
  }

  const loadLocale = () => {
    if (process.client) {
      const savedLocale = localStorage.getItem('user-locale')
      if (savedLocale) {
        setLocale(savedLocale)
        return savedLocale
      }
    }
    return locale.value
  }

  return {
    locale,
    saveLocale,
    loadLocale
  }
}
