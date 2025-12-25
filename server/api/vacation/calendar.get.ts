// server/api/vacation/calendar.get.ts
import { query } from '../../database/db'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const year = queryParams.year as string
  const month = queryParams.month as string

  if (!year || !month) {
    throw createError({
      statusCode: 400,
      message: 'year und month sind erforderlich'
    })
  }

  try {
    const monthNum = parseInt(month)
    const yearNum = parseInt(year)
    
    // Berechne Start- und Enddatum des Monats
    const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`
    const lastDay = new Date(yearNum, monthNum, 0).getDate()
    const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    // Hole alle GENEHMIGTEN Urlaubsanträge die den Monat überlappen
    // substr() extrahiert nur YYYY-MM-DD (ohne Zeitstempel)
    const vacations = query<any>(`
      SELECT 
        vr.id,
        vr.userId,
        vr.displayName,
        substr(vr.startDate, 1, 10) as startDate,
        substr(vr.endDate, 1, 10) as endDate,
        vr.reason,
        vr.status
      FROM vacation_requests vr
      WHERE vr.status = 'approved'
        AND (
          (substr(vr.startDate, 1, 10) <= ? AND substr(vr.endDate, 1, 10) >= ?)
          OR (substr(vr.startDate, 1, 10) >= ? AND substr(vr.startDate, 1, 10) <= ?)
          OR (substr(vr.endDate, 1, 10) >= ? AND substr(vr.endDate, 1, 10) <= ?)
        )
      ORDER BY vr.displayName, vr.startDate
    `, [endDate, startDate, startDate, endDate, startDate, endDate])

    // Gruppiere nach Mitarbeiter
    const employeeMap = new Map<string, any>()

    vacations.forEach((vacation: any) => {
      if (!employeeMap.has(vacation.userId)) {
        employeeMap.set(vacation.userId, {
          userId: vacation.userId,
          displayName: vacation.displayName,
          vacations: []
        })
      }
      
      employeeMap.get(vacation.userId).vacations.push({
        id: vacation.id,
        startDate: vacation.startDate,
        endDate: vacation.endDate,
        reason: vacation.reason,
        status: vacation.status
      })
    })

    return Array.from(employeeMap.values())

  } catch (error: any) {
    console.error('❌ ERROR in GET /api/vacation/calendar:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden des Kalenders: ' + error.message
    })
  }
})
