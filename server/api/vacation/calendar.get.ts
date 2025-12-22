// server/api/vacation/calendar.get.ts
import { query } from '../../database/db'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const startDate = queryParams.startDate as string
  const endDate = queryParams.endDate as string

  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      message: 'startDate und endDate sind erforderlich'
    })
  }

  try {
    // Hole alle GENEHMIGTEN Urlaubsanträge die den Zeitraum überlappen
    const vacations = query<any>(`
      SELECT 
        vr.id,
        vr.userId,
        vr.displayName,
        vr.startDate,
        vr.endDate,
        vr.reason,
        vr.status
      FROM vacation_requests vr
      WHERE vr.status = 'approved'
        AND (
          (date(vr.startDate) <= date(?) AND date(vr.endDate) >= date(?))
          OR (date(vr.startDate) >= date(?) AND date(vr.startDate) <= date(?))
          OR (date(vr.endDate) >= date(?) AND date(vr.endDate) <= date(?))
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

    const result = Array.from(employeeMap.values())
    
    console.log(`✅ Calendar: Found ${result.length} employees with vacations in period ${startDate} to ${endDate}`)
    
    return result

  } catch (error: any) {
    console.error('❌ ERROR in GET /api/vacation/calendar:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden des Kalenders: ' + error.message
    })
  }
})
