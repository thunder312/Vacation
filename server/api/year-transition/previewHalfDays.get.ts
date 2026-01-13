// server/api/year-transition/previewHalfDays.get.ts
import { query } from '../../database/db'

export default defineEventHandler((event) => {
  try {
    const currentYear = new Date().getFullYear()
    const previousYear = currentYear - 1

    // Hole alle Halbtage aus dem Vorjahr
    const halfDays = query<any>(`
      SELECT
        id,
        date,
        description
      FROM half_day_rules
      WHERE substr(date, 1, 4) = ?
    `, [previousYear.toString()])

    // Prüfe welche Halbtage bereits im aktuellen Jahr existieren
    const existingInCurrentYear = query<any>(`
      SELECT date FROM half_day_rules
      WHERE substr(date, 1, 4) = ?
    `, [currentYear.toString()])

    const existingDates = new Set(existingInCurrentYear.map((h: any) => h.date.substring(5))) // MM-DD

    // Erstelle Preview für jeden Halbtag
    const previewHalfDays = halfDays.map((halfDay: any) => {
      // Neues Datum: gleiches MM-DD, aber aktuelles Jahr
      const monthDay = halfDay.date.substring(5) // MM-DD
      const newDate = `${currentYear}-${monthDay}`

      return {
        id: halfDay.id,
        current: {
          id: halfDay.id,
          date: halfDay.date,
          description: halfDay.description,
        },
        next: {
          date: newDate,
          description: halfDay.description,
        },
        alreadyExists: existingDates.has(monthDay)
      }
    })

    return previewHalfDays
  } catch (error: any) {
    console.error('Fehler beim Erstellen der Preview:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Erstellen der Preview: ' + error.message
    })
  }
})
