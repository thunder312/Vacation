// server/api/year-transition/preview.get.ts
import Database from 'better-sqlite3'
import { join } from 'path'

export default defineEventHandler((event) => {
  try {
    const dbPath = join(process.cwd(), 'vacation.db')
    const db = new Database(dbPath)

    // Hole alle aktiven Benutzer mit ihren Urlaubsdaten
    const users = db.prepare(`
      SELECT 
        userId,
        displayName,
        vacationDaysPerYear,
        carryoverDays
      FROM users
      WHERE isActive = 1
    `).all() as Array<{
      userId: string
      displayName: string
      vacationDaysPerYear: number
      carryoverDays: number
    }>

    // Berechne für jeden User die Änderungen
    const preview = users.map(user => {
      // Hole genommene Urlaubstage dieses Jahr
      const balance = db.prepare(`
        SELECT 
          COALESCE(SUM(days), 0) as usedDays
        FROM vacation_requests
        WHERE userId = ? 
          AND status = 'approved'
          AND strftime('%Y', startDate) = strftime('%Y', 'now')
      `).get(user.userId) as { usedDays: number }

      const currentTotal = user.vacationDaysPerYear + user.carryoverDays
      const remaining = currentTotal - balance.usedDays

      // Alle verbleibenden Tage werden übertragen (keine Begrenzung)
      const newCarryover = Math.max(remaining, 0)

      return {
        userId: user.userId,
        displayName: user.displayName,
        current: {
          standard: user.vacationDaysPerYear,
          carryover: user.carryoverDays,
          total: currentTotal,
          used: balance.usedDays,
          remaining: remaining
        },
        new: {
          standard: user.vacationDaysPerYear,
          carryover: newCarryover,
          total: user.vacationDaysPerYear + newCarryover
        }
      }
    })

    db.close()

    return preview
  } catch (error) {
    console.error('Fehler beim Erstellen der Preview:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Erstellen der Preview'
    })
  }
})
