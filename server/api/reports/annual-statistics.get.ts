// server/api/reports/annual-statistics.get.ts
import { db } from '../../utils/db'
import { calculateWorkdays } from '../../../app/utils/dateHelpers'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const year = queryParams.year as string

  if (!year) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Jahr ist erforderlich'
    })
  }

  try {
    // Hole Halbtage
    const halfDayRules = db.prepare(`SELECT date FROM half_day_rules`).all()
    const halfDayDates = halfDayRules.map((rule: any) => rule.date)

    // Anzahl aktive Mitarbeiter (OHNE Administrator)
    const employeesResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM users
      WHERE isActive = 1
        AND role != 'administrator'
    `).get() as any
    const totalEmployees = employeesResult?.count || 0

    // Gesamte Urlaubstage aller Mitarbeiter (OHNE Administrator)
    const entitlementResult = db.prepare(`
      SELECT
        SUM(u.vacationDays) as total,
        AVG(u.vacationDays) as average
      FROM users u
      WHERE u.isActive = 1
        AND u.role != 'administrator'
    `).get() as any
    
    const totalVacationDays = Math.round(entitlementResult?.total || 0)
    const averagePerEmployee = parseFloat((entitlementResult?.average || 0).toFixed(1))

    // Genommene Urlaubstage - MIT CALCULATEWORKDAYS!
    const vacations = db.prepare(`
      SELECT 
        startDate,
        endDate
      FROM vacation_requests
      WHERE status = 'approved'
        AND strftime('%Y', startDate) = ?
    `).all(year) as any[]
    
    // Berechne bereinigte Tage
    let takenDays = 0
    for (const v of vacations) {
      takenDays += calculateWorkdays(v.startDate, v.endDate, halfDayDates)
    }
    
    const remainingDays = totalVacationDays - takenDays
    const takenPercentage = totalVacationDays > 0 
      ? Math.round((takenDays / totalVacationDays) * 100) 
      : 0

    // Status der Anträge
    const approvedResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM vacation_requests
      WHERE status = 'approved'
        AND strftime('%Y', startDate) = ?
    `).get(year) as any
    
    const pendingResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM vacation_requests
      WHERE status IN ('pending', 'teamlead_approved')
        AND strftime('%Y', startDate) = ?
    `).get(year) as any
    
    const approvedRequests = approvedResult?.count || 0
    const pendingRequests = pendingResult?.count || 0

    // Häufigste Urlaubsmonate - MIT CALCULATEWORKDAYS!
    const monthVacations = db.prepare(`
      SELECT 
        strftime('%m', startDate) as month,
        startDate,
        endDate
      FROM vacation_requests
      WHERE status = 'approved'
        AND strftime('%Y', startDate) = ?
      ORDER BY startDate
    `).all(year) as any[]
    
    // Gruppiere nach Monat
    const monthMap = new Map<string, number>()
    for (const v of monthVacations) {
      const workdays = calculateWorkdays(v.startDate, v.endDate, halfDayDates)
      const current = monthMap.get(v.month) || 0
      monthMap.set(v.month, current + workdays)
    }
    
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
    
    const topMonths = Array.from(monthMap.entries())
      .map(([month, days]) => ({
        name: monthNames[parseInt(month) - 1],
        days: Math.round(days)
      }))
      .sort((a, b) => b.days - a.days)

    console.log(`✓ Annual statistics: ${totalEmployees} employees, ${takenDays} days taken in ${year}`)

    return {
      totalEmployees,
      totalVacationDays,
      averagePerEmployee,
      takenDays, // ← Bereinigte Tage!
      remainingDays,
      takenPercentage,
      approvedRequests,
      pendingRequests,
      topMonths
    }

  } catch (error: any) {
    console.error('❌ ERROR in GET /api/reports/annual-statistics:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Statistiken: ' + error.message
    })
  }
})
