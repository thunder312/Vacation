// server/api/year-transition/execute.post.ts
import { query, run, transaction } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const currentYear = new Date().getFullYear()
    let updatedCount = 0

    // Transaction verwenden
    transaction(() => {
      // Hole alle aktiven Benutzer (username nicht userId!)
      const users = query<any>(`
        SELECT 
          username as userId,
          vacationDays as vacationDaysPerYear
        FROM users
        WHERE isActive = 1
      `)

      users.forEach((user: any) => {
        // Hole existierendes Carryover für letztes Jahr
        const lastYearCarryover = query<any>(`
          SELECT carryoverDays FROM carryover 
          WHERE userId = ? AND year = ?
        `, [user.userId, currentYear - 1])

        const carryover = lastYearCarryover.length > 0 ? lastYearCarryover[0].carryoverDays : 0

        // Berechne verbleibende Tage - mit julianday für korrekte Berechnung
        const balance = query<any>(`
          SELECT 
            COALESCE(SUM(julianday(endDate) - julianday(startDate) + 1), 0) as usedDays
          FROM vacation_requests
          WHERE userId = ? 
            AND status IN ('approved', 'teamlead_approved')
            AND strftime('%Y', startDate) = ?
        `, [user.userId, (currentYear - 1).toString()])

        const currentTotal = user.vacationDaysPerYear + carryover
        const remaining = currentTotal - balance[0].usedDays

        // Alle verbleibenden Tage werden übertragen
        const newCarryover = Math.max(remaining, 0)

        // Speichere in carryover Tabelle
        run(`
          INSERT INTO carryover (userId, year, carryoverDays, createdAt, updatedAt)
          VALUES (?, ?, ?, datetime('now'), datetime('now'))
          ON CONFLICT(userId, year) 
          DO UPDATE SET 
            carryoverDays = ?,
            updatedAt = datetime('now')
        `, [user.userId, currentYear, newCarryover, newCarryover])

        updatedCount++
      })

      // Erstelle system_settings Tabelle falls nicht existiert
      run(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Speichere letzten Jahreswechsel
      run(`
        INSERT OR REPLACE INTO system_settings (key, value, updatedAt)
        VALUES ('last_year_transition', ?, datetime('now'))
      `, [currentYear.toString()])

      console.log(`✅ Year transition completed for ${updatedCount} users`)
    })

    return {
      success: true,
      updatedCount,
      year: currentYear
    }
  } catch (error: any) {
    console.error('Fehler beim Jahreswechsel:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Jahreswechsel: ' + error.message
    })
  }
})
