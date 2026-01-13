// server/api/carryover/approve.post.ts
import { query } from '../../database/db'
import { icons } from '../../../app/config/icons'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, year, approvedBy } = body

  try {
    // Berechne Übertrag für diesen User
    const user = query<any>(`
      SELECT 
        u.username,
        u.vacationDays,
        COALESCE(
          u.vacationDays - 
          (SELECT COALESCE(SUM(
            julianday(endDate) - julianday(startDate) + 1
          ), 0) 
           FROM vacation_requests 
           WHERE userId = u.username 
             AND status IN ('approved', 'teamlead_approved')
             AND strftime('%Y', startDate) = ?),
          0
        ) as calculatedCarryover
      FROM users u
      WHERE u.username = ?
    `, [(year - 1).toString(), userId])

    if (!user || user.length === 0) {
      throw createError({ 
        statusCode: 404, 
        message: 'User not found' 
      })
    }

    const carryoverDays = Math.max(user[0].calculatedCarryover, 0)

    // Speichere in carryover Tabelle
    query(`
      INSERT INTO carryover 
        (userId, year, carryoverDays, createdAt, updatedAt)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(userId, year) 
      DO UPDATE SET 
        carryoverDays = ?,
        updatedAt = datetime('now')
    `, [userId, year, carryoverDays, carryoverDays])

    console.log(icons.actions.activate + '  Approved carryover for ${userId}: ${carryoverDays} days (${year})')

    return { 
      success: true,
      userId,
      year,
      approvedDays: carryoverDays
    }

  } catch (error: any) {
    console.error(icons.ui.error + ' ERROR in POST /api/carryover/approve:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Bestätigen des Übertrags: ' + error.message
    })
  }
})
