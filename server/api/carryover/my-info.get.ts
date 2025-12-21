// server/api/carryover/my-info.get.ts
import { query } from '../../database/db'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const year = parseInt(queryParams.year as string) || new Date().getFullYear()
  
  // Hole userId aus Cookie
  const cookies = parseCookies(event)
  const userId = cookies.userId
  
  if (!userId) {
    console.warn('⚠️ Kein userId Cookie gefunden')
    return null
  }

  try {
    // Hole gespeicherten Carryover für diesen User
    const carryoverInfo = query<any>(`
      SELECT 
        c.userId,
        c.year,
        c.carryoverDays as approvedDays,
        c.expiryDate
      FROM carryover c
      WHERE c.userId = ? AND c.year = ?
    `, [userId, year])

    // Wenn Eintrag existiert → wurde bereits genehmigt
    if (carryoverInfo && carryoverInfo.length > 0) {
      return {
        userId,
        year,
        originalDays: carryoverInfo[0].approvedDays, // Original unbekannt
        approvedDays: carryoverInfo[0].approvedDays,
        status: 'approved',
        expiryDate: carryoverInfo[0].expiryDate,
        // Nicht im Schema vorhanden:
        adjustmentReason: null,
        adjustedBy: null,
        adjustedAt: null
      }
    }

    // Kein Eintrag → Berechne was übertragen werden würde
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

    if (user && user.length > 0 && user[0].calculatedCarryover > 0) {
      return {
        userId,
        year,
        originalDays: Math.max(user[0].calculatedCarryover, 0),
        approvedDays: null,
        status: 'pending',
        expiryDate: null,
        adjustmentReason: null,
        adjustedBy: null,
        adjustedAt: null
      }
    }

    // Kein Übertrag
    return null

  } catch (error: any) {
    console.error('❌ ERROR in GET /api/carryover/my-info:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Übertrag-Information: ' + error.message
    })
  }
})
