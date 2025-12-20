// server/api/year-transition/check.get.ts
import Database from 'better-sqlite3'
import { join } from 'path'

export default defineEventHandler((event) => {
  try {
    const dbPath = join(process.cwd(), 'vacation.db')
    const db = new Database(dbPath)

    // Prüfe ob es eine letzte Jahreswechsel-Info gibt
    const lastTransition = db.prepare(`
      SELECT value FROM system_settings WHERE key = 'last_year_transition'
    `).get() as { value: string } | undefined

    const currentYear = new Date().getFullYear()
    const lastYear = lastTransition ? parseInt(lastTransition.value) : currentYear - 1

    db.close()

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
