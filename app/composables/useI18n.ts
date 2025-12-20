// app/composables/useI18n.ts
import { de } from '~/config/i18n/de'
import { en } from '~/config/i18n/en'
import { ptBr } from '~/config/i18n/pt-br'

type Locale = 'de' | 'en' | 'pt-br'

const translations = { de, en, 'pt-br': ptBr }

/**
 * i18n Composable für mehrsprachige Unterstützung
 */
export const useI18n = () => {
  // Aktuelle Sprache (reactive, global state)
  const locale = useState<Locale>('app-locale', () => {
    // Initial von localStorage laden
    if (import.meta.client) {
      const saved = localStorage.getItem('app-locale') as Locale
      if (saved && (saved === 'de' || saved === 'en' || saved === 'pt-br')) {
        return saved
      }
    }
    return 'de'
  })
  
  // Watch für automatisches Speichern bei Änderung (nur client-side)
  if (import.meta.client) {
    watchEffect(() => {
      localStorage.setItem('app-locale', locale.value)
      console.log('✅ Language changed to:', locale.value)
    })
  }
  
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
    console.log('🌍 Switching language to:', newLocale)
    locale.value = newLocale
  }
  
  /**
   * Verfügbare Sprachen
   */
  const availableLocales: { code: Locale; name: string; flag: string }[] = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'pt-br', name: 'Português (BR)', flag: '🇧🇷' }
  ]
  
  return {
    t,
    locale: readonly(locale),
    setLocale,
    availableLocales
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
