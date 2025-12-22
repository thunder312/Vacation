// server/api/year-transition/check.get.ts
import { query } from '../../database/db'

export default defineEventHandler((event) => {
  try {
    // Prüfe ob system_settings Tabelle existiert
    const tableCheck = query<any>(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='system_settings'
    `)
    
    const tableExists = tableCheck.length > 0

    let lastYear = new Date().getFullYear() - 1

    if (tableExists) {
      // Prüfe ob es eine letzte Jahreswechsel-Info gibt
      const lastTransition = query<any>(`
        SELECT value FROM system_settings WHERE key = 'last_year_transition'
      `)

      if (lastTransition && lastTransition.length > 0) {
        lastYear = parseInt(lastTransition[0].value)
      }
    }

    const currentYear = new Date().getFullYear()

    return {
      needed: lastYear < currentYear,
      lastYear,
      currentYear
    }
  } catch (error) {
    console.error('Fehler beim Prüfen des Jahreswechsels:', error)
    return {
      needed: false,
      lastYear: new Date().getFullYear(),
      currentYear: new Date().getFullYear()
    }
  }
})
