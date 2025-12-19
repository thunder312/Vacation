// app/composables/useI18n.ts
import { de } from '~/config/i18n/de'
import { en } from '~/config/i18n/en'

type Locale = 'de' | 'en'

const translations = { de, en }

/**
 * i18n Composable für mehrsprachige Unterstützung
 */
export const useI18n = () => {
  // Aktuelle Sprache (reactive)
  const locale = useState<Locale>('locale', () => 'de')
  
  /**
   * Übersetzung holen
   * @param key - Übersetzungsschlüssel (z.B. 'login.title')
   * @param params - Optionale Parameter für Interpolation
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = translations[locale.value]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }
    
    // String interpolation
    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param]?.toString() || match
      })
    }
    
    return value || key
  }
  
  /**
   * Sprache wechseln
   */
  const setLocale = (newLocale: Locale) => {
    locale.value = newLocale
    // Sprache in localStorage speichern
    if (process.client) {
      localStorage.setItem('locale', newLocale)
    }
  }
  
  /**
   * Verfügbare Sprachen
   */
  const availableLocales: { code: Locale; name: string; flag: string }[] = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ]
  
  /**
   * Sprache beim Start laden
   */
  const initLocale = () => {
    if (process.client) {
      const savedLocale = localStorage.getItem('locale') as Locale
      if (savedLocale && (savedLocale === 'de' || savedLocale === 'en')) {
        locale.value = savedLocale
      }
    }
  }
  
  return {
    t,
    locale: readonly(locale),
    setLocale,
    availableLocales,
    initLocale
  }
}

/**
 * Beispiel-Verwendung:
 * 
 * <script setup>
 * const { t, locale, setLocale } = useI18n()
 * </script>
 * 
 * <template>
 *   <h1>{{ t('login.title') }}</h1>
 *   <button @click="setLocale('en')">English</button>
 *   <button @click="setLocale('de')">Deutsch</button>
 * </template>
 */
