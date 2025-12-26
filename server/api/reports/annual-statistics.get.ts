// server/api/reports/annual-statistics.get.ts
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
    // Anzahl aktive Mitarbeiter (OHNE admin)
    const employeesResult = query<any>(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE isActive = 1
        AND username != 'admin'
    `)
    const totalEmployees = employeesResult[0]?.count || 0

    // Gesamte Urlaubstage aller Mitarbeiter (OHNE admin)
    const entitlementResult = query<any>(`
      SELECT 
        SUM(u.vacationDays) as total,
        AVG(u.vacationDays) as average
      FROM users u
      WHERE u.isActive = 1
        AND u.username != 'admin'
    `)
    
    const totalVacationDays = Math.round(entitlementResult[0]?.total || 0)
    const averagePerEmployee = parseFloat((entitlementResult[0]?.average || 0).toFixed(1))

    // Genommene Urlaubstage
    const takenResult = query<any>(`
      SELECT 
        SUM(julianday(endDate) - julianday(startDate) + 1) as taken
      FROM vacation_requests
      WHERE status = 'approved'
        AND strftime('%Y', startDate) = ?
    `, [year])
    
    const takenDays = Math.round(takenResult[0]?.taken || 0)
    const remainingDays = totalVacationDays - takenDays
    const takenPercentage = totalVacationDays > 0 
      ? Math.round((takenDays / totalVacationDays) * 100) 
      : 0

    // Status der Anträge
    const approvedResult = query<any>(`
      SELECT COUNT(*) as count
      FROM vacation_requests
      WHERE status = 'approved'
        AND strftime('%Y', startDate) = ?
    `, [year])
    
    const pendingResult = query<any>(`
      SELECT COUNT(*) as count
      FROM vacation_requests
      WHERE status IN ('pending', 'teamlead_approved')
        AND strftime('%Y', startDate) = ?
    `, [year])
    
    const approvedRequests = approvedResult[0]?.count || 0
    const pendingRequests = pendingResult[0]?.count || 0

    // Häufigste Urlaubsmonate
    const monthsResult = query<any>(`
      SELECT 
        strftime('%m', startDate) as month,
        SUM(julianday(endDate) - julianday(startDate) + 1) as days
      FROM vacation_requests
      WHERE status = 'approved'
        AND strftime('%Y', startDate) = ?
      GROUP BY strftime('%m', startDate)
      ORDER BY days DESC
    `, [year])
    
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
    
    const topMonths = monthsResult.map((m: any) => ({
      name: monthNames[parseInt(m.month) - 1],
      days: Math.round(m.days)
    }))

    return {
      totalEmployees,
      totalVacationDays,
      averagePerEmployee,
      takenDays,
      remainingDays,
      takenPercentage,
      approvedRequests,
      pendingRequests,
      topMonths
    }

  } catch (error: any) {
    console.error(icons.ui.error + ' ERROR in GET /api/reports/annual-statistics:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Statistiken: ' + error.message
    })
  }
})
