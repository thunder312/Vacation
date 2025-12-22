// server/api/year-transition/preview.get.ts
import { query } from '../../database/db'

export default defineEventHandler((event) => {
  try {
    const currentYear = new Date().getFullYear()

    // Hole alle aktiven Benutzer (username nicht userId!)
    const users = query<any>(`
      SELECT 
        username as userId,
        firstName || ' ' || lastName as displayName,
        vacationDays as vacationDaysPerYear
      FROM users
      WHERE isActive = 1
    `)

    // Berechne für jeden User die Änderungen
    const preview = users.map((user: any) => {
      // Hole existierendes Carryover
      const carryoverResult = query<any>(`
        SELECT carryoverDays FROM carryover 
        WHERE userId = ? AND year = ?
      `, [user.userId, currentYear])

      const currentCarryover = carryoverResult.length > 0 ? carryoverResult[0].carryoverDays : 0

      // Hole genommene Urlaubstage dieses Jahr - mit julianday
      const balance = query<any>(`
        SELECT 
          COALESCE(SUM(julianday(endDate) - julianday(startDate) + 1), 0) as usedDays
        FROM vacation_requests
        WHERE userId = ? 
          AND status IN ('approved', 'teamlead_approved')
          AND strftime('%Y', startDate) = ?
      `, [user.userId, currentYear.toString()])

      const currentTotal = user.vacationDaysPerYear + currentCarryover
      const remaining = currentTotal - balance[0].usedDays

      // Alle verbleibenden Tage werden übertragen (keine Begrenzung)
      const newCarryover = Math.max(remaining, 0)

      return {
        userId: user.userId,
        displayName: user.displayName,
        current: {
          standard: user.vacationDaysPerYear,
          carryover: currentCarryover,
          total: currentTotal,
          used: balance[0].usedDays,
          remaining: remaining
        },
        new: {
          standard: user.vacationDaysPerYear,
          carryover: newCarryover,
          total: user.vacationDaysPerYear + newCarryover
        }
      }
    })

    return preview
  } catch (error: any) {
    console.error('Fehler beim Erstellen der Preview:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Erstellen der Preview: ' + error.message
    })
  }
})
