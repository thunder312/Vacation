// server/api/carryover/my-info.get.ts
import Database from 'better-sqlite3'
import { join } from 'path'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const year = parseInt(query.year as string) || new Date().getFullYear()
  
  // Hole userId aus Cookie (wie in anderen APIs)
  const cookies = parseCookies(event)
  const userId = cookies.userId
  
  if (!userId) {
    console.warn('⚠️ Kein userId Cookie gefunden')
    // Kein Fehler werfen, einfach null zurückgeben
    return null
  }

  try {
    const projectRoot = process.cwd().includes('.nuxt') 
      ? join(process.cwd(), '..', '..')
      : process.cwd()
    const dbPath = join(projectRoot, 'sqlite.db')
    const db = new Database(dbPath)

    // Hole Carryover Adjustment für diesen User
    const carryoverInfo = db.prepare(`
      SELECT 
        ca.userId,
        ca.year,
        ca.originalDays,
        ca.approvedDays,
        ca.status,
        ca.adjustmentReason,
        ca.adjustedBy,
        ca.adjustedAt,
        ca.approvedBy,
        ca.approvedAt
      FROM carryover_adjustments ca
      WHERE ca.userId = ? AND ca.year = ?
    `).get(userId, year) as any

    db.close()

    // Wenn kein Eintrag existiert, berechne den Übertrag
    if (!carryoverInfo) {
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

      if (user && user.calculatedCarryover > 0) {
        return {
          userId,
          year,
          originalDays: Math.max(user.calculatedCarryover, 0),
          approvedDays: null,
          status: 'pending',
          adjustmentReason: null,
          adjustedBy: null,
          adjustedAt: null
        }
      }

      return null
    }

    return carryoverInfo

  } catch (error) {
    console.error('Fehler beim Laden der Carryover-Info:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Übertrag-Information'
    })
  }
})
