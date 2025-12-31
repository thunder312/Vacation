// server/api/vacation-exceptions/index.get.ts
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = query.userId as string | undefined
  const year = query.year as string | undefined
  const month = query.month as string | undefined

  try {
    let sql = `
      SELECT 
        ve.*,
        vr.startDate as vacationStart,
        vr.endDate as vacationEnd,
        u.firstName || ' ' || u.lastName as displayName
      FROM vacation_exceptions ve
      LEFT JOIN vacation_requests vr ON ve.vacationRequestId = vr.id
      LEFT JOIN users u ON ve.userId = u.username
      WHERE 1=1
    `
    const params: any[] = []

    // Filter nach userId
    if (userId) {
      sql += ` AND ve.userId = ?`
      params.push(userId)
    }

    // Filter nach Jahr UND Monat (kombiniert)
    if (month && year) {
      sql += ` AND strftime('%Y-%m', ve.date) = ?`
      params.push(`${year}-${String(month).padStart(2, '0')}`)
    } 
    // Filter nur nach Jahr (wenn kein Monat angegeben)
    else if (year) {
      sql += ` AND strftime('%Y', ve.date) = ?`
      params.push(year)
    }

    sql += ` ORDER BY ve.date DESC`

    const exceptions = db.prepare(sql).all(...params)

    return exceptions

  } catch (error: any) {
    console.error('❌ ERROR in GET /api/vacation-exceptions:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Exceptions: ' + error.message
    })
  }
})
