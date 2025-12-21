// server/api/carryover/approve.post.ts
import Database from 'better-sqlite3'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, year, approvedBy } = body

  try {
    const projectRoot = process.cwd().includes('.nuxt') 
      ? join(process.cwd(), '..', '..')
      : process.cwd()
    const dbPath = join(projectRoot, 'sqlite.db')
    const db = new Database(dbPath)

    // Hole berechneten Übertrag
    const user = db.prepare(`
      SELECT 
        userId,
        vacationDaysPerYear,
        carryoverDays,
        (vacationDaysPerYear + COALESCE(carryoverDays, 0)) - 
        (SELECT COALESCE(SUM(days), 0) 
         FROM vacation_requests 
         WHERE userId = ? 
           AND status = 'approved'
           AND strftime('%Y', startDate) = ?) as calculatedCarryover
      FROM users
      WHERE userId = ?
    `).get(userId, (year - 1).toString(), userId) as any

    if (!user) {
      db.close()
      throw createError({ statusCode: 404, message: 'User not found' })
    }

    const originalDays = Math.max(user.calculatedCarryover, 0)

    // Erstelle oder update Carryover Adjustment
    db.prepare(`
      INSERT INTO carryover_adjustments 
        (userId, year, originalDays, approvedDays, status, approvedBy, approvedAt)
      VALUES (?, ?, ?, ?, 'approved', ?, datetime('now'))
      ON CONFLICT(userId, year) 
      DO UPDATE SET 
        status = 'approved',
        approvedDays = ?,
        approvedBy = ?,
        approvedAt = datetime('now')
    `).run(userId, year, originalDays, originalDays, approvedBy, originalDays, approvedBy)

    // Update User carryoverDays
    db.prepare(`
      UPDATE users 
      SET carryoverDays = ?
      WHERE userId = ?
    `).run(originalDays, userId)

    db.close()

    return { 
      success: true,
      userId,
      approvedDays: originalDays
    }

  } catch (error) {
    console.error('Fehler beim Bestätigen:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Bestätigen des Übertrags'
    })
  }
})
