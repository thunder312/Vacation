// server/api/vacation/calendar.get.ts
import { query } from '../../database/db'
import { icons } from '../../../app/config/icons'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const year = queryParams.year as string
  const month = queryParams.month as string | undefined

  if (!year) {
    throw createError({
      statusCode: 400,
      message: 'year ist erforderlich'
    })
  }

  try {
    const yearNum = parseInt(year)

    let startDate: string
    let endDate: string

    if (month) {
      // Einzelner Monat
      const monthNum = parseInt(month)
      startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`
      const lastDay = new Date(yearNum, monthNum, 0).getDate()
      endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    } else {
      // Ganzes Jahr
      startDate = `${yearNum}-01-01`
      endDate = `${yearNum}-12-31`
    }

    // Hole alle GENEHMIGTEN Urlaubsanträge die den Zeitraum überlappen
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
    console.error(icons.ui.error + ' ERROR in GET /api/vacation/calendar:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden des Kalenders: ' + error.message
    })
  }
})
