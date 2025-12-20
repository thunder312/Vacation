// server/api/year-transition/execute.post.ts
import Database from 'better-sqlite3'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const dbPath = join(process.cwd(), 'vacation.db')
    const db = new Database(dbPath)

    const currentYear = new Date().getFullYear()

    // Transaction starten
    const transaction = db.transaction(() => {
      // Hole alle aktiven Benutzer
      const users = db.prepare(`
        SELECT 
          userId,
          vacationDaysPerYear,
          carryoverDays
        FROM users
        WHERE isActive = 1
      `).all() as Array<{
        userId: string
        vacationDaysPerYear: number
        carryoverDays: number
      }>

      const updateStmt = db.prepare(`
        UPDATE users 
        SET carryoverDays = ?
        WHERE userId = ?
      `)

      let updatedCount = 0

      users.forEach(user => {
        // Berechne verbleibende Tage
        const balance = db.prepare(`
          SELECT 
            COALESCE(SUM(days), 0) as usedDays
          FROM vacation_requests
          WHERE userId = ? 
            AND status = 'approved'
            AND strftime('%Y', startDate) = ?
        `).get(user.userId, (currentYear - 1).toString()) as { usedDays: number }

        const currentTotal = user.vacationDaysPerYear + user.carryoverDays
        const remaining = currentTotal - balance.usedDays

        // Alle verbleibenden Tage werden übertragen (keine Begrenzung)
        const newCarryover = Math.max(remaining, 0)

        // Update User
        updateStmt.run(newCarryover, user.userId)
        updatedCount++
      })

      // Erstelle system_settings Tabelle falls nicht existiert
      db.exec(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Speichere letzten Jahreswechsel
      db.prepare(`
        INSERT OR REPLACE INTO system_settings (key, value, updatedAt)
        VALUES ('last_year_transition', ?, datetime('now'))
      `).run(currentYear.toString())

      return updatedCount
    })

    const updatedCount = transaction()
    db.close()

    return {
      success: true,
      updatedCount,
      year: currentYear
    }
  } catch (error) {
    console.error('Fehler beim Jahreswechsel:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Jahreswechsel'
    })
  }
})
