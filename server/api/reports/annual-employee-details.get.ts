// server/api/reports/annual-employee-details.get.ts
import { query } from '../../database/db'
import { icons } from '../../../app/config/icons'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const year = queryParams.year as string

  if (!year) {
    throw createError({
      statusCode: 400,
      message: 'Jahr ist erforderlich'
    })
  }

  try {
    // Alle aktiven Mitarbeiter (OHNE admin)
    const users = query<any>(`
      SELECT 
        username,
        firstName || ' ' || lastName as displayName,
        vacationDays as entitlement
      FROM users
      WHERE isActive = 1
        AND username != 'admin'
      ORDER BY lastName, firstName
    `)

    const employees = []

    for (const user of users) {
      // Übertrag aus Vorjahr
      const carryoverResult = query<any>(`
        SELECT carryoverDays
        FROM carryover
        WHERE userId = ? AND year = ?
      `, [user.username, year])
      
      const carryover = carryoverResult[0]?.carryoverDays || 0

      // Genommene Urlaubstage
      const takenResult = query<any>(`
        SELECT 
          SUM(julianday(endDate) - julianday(startDate) + 1) as taken
        FROM vacation_requests
        WHERE userId = ?
          AND status = 'approved'
          AND strftime('%Y', startDate) = ?
      `, [user.username, year])
      
      const taken = Math.round(takenResult[0]?.taken || 0)
      const total = user.entitlement + carryover
      const remaining = total - taken

      // Alle genehmigten Urlaube
      const vacations = query<any>(`
        SELECT 
          startDate,
          endDate,
          reason,
          julianday(endDate) - julianday(startDate) + 1 as days
        FROM vacation_requests
        WHERE userId = ?
          AND status = 'approved'
          AND strftime('%Y', startDate) = ?
        ORDER BY startDate
      `, [user.username, year])
      
      const formattedVacations = vacations.map((v: any) => ({
        startDate: new Date(v.startDate).toLocaleDateString('de-DE'),
        endDate: new Date(v.endDate).toLocaleDateString('de-DE'),
        days: Math.round(v.days),
        reason: v.reason
      }))

      employees.push({
        username: user.username,
        displayName: user.displayName,
        entitlement: user.entitlement,
        carryover,
        total,
        taken,
        remaining,
        vacations: formattedVacations
      })
    }

    console.log(icons.actions.activate + ' Annual report: Loaded ${employees.length} employees for year ${year}')
    
    return employees

  } catch (error: any) {
    console.error(icons.ui.error + ' ERROR in GET /api/reports/annual-employee-details:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Mitarbeiterdaten: ' + error.message
    })
  }
})
