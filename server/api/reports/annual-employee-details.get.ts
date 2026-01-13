// server/api/reports/annual-employee-details.get.ts
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

    // Alle aktiven Mitarbeiter (OHNE Administrator)
    const users = db.prepare(`
      SELECT
        username,
        firstName || ' ' || lastName as displayName,
        vacationDays as entitlement
      FROM users
      WHERE isActive = 1
        AND role != 'administrator'
      ORDER BY lastName, firstName
    `).all()

    const employees = []

    for (const user of users as any[]) {
      // Übertrag aus Vorjahr - SAFE: prüfe welche Spalte existiert
      let carryover = 0
      try {
        const result = db.prepare(`
          SELECT calculatedDays, approvedDays
          FROM carryover
          WHERE userId = ? AND year = ?
        `).get(user.username, year) as any
        
        if (result) {
          carryover = result.approvedDays || result.calculatedDays || 0
        }
      } catch (e: any) {
        if (e.message.includes('no such column')) {
          try {
            const result = db.prepare(`
              SELECT days as carryoverDays
              FROM carryover
              WHERE userId = ? AND year = ?
            `).get(user.username, year) as any
            carryover = result?.carryoverDays || 0
          } catch {
            carryover = 0
          }
        }
      }

      // Lade Exceptions für diesen User (inkl. Grund)
      const exceptions = db.prepare(`
        SELECT date, deduction, vacationRequestId, reason
        FROM vacation_exceptions
        WHERE userId = ?
      `).all(user.username) as any[]

      // Alle genehmigten Urlaube für das Jahr
      const vacations = db.prepare(`
        SELECT 
          id,
          startDate,
          endDate,
          reason
        FROM vacation_requests
        WHERE userId = ?
          AND status = 'approved'
          AND strftime('%Y', startDate) = ?
        ORDER BY startDate
      `).all(user.username, year) as any[]
      
      // Berechne genommene Tage MIT calculateWorkdays + Exceptions!
      let taken = 0
      const formattedVacations = vacations.map((v: any) => {
        // Finde relevante Exceptions für diesen Urlaubsantrag
        const relevantExceptions = exceptions
          .filter(e => e.vacationRequestId === v.id)
          .map(e => ({ date: e.date, deduction: e.deduction }))

        const workdays = calculateWorkdays(
          v.startDate, 
          v.endDate, 
          halfDayDates,
          relevantExceptions // ← NEU: Exceptions übergeben
        )
        taken += workdays
        
        // Berechne Original-Tage (ohne Exceptions) für Rückbuchungs-Anzeige
        const originalDays = calculateWorkdays(v.startDate, v.endDate, halfDayDates, [])
        const fullExceptions = exceptions.filter(e => e.vacationRequestId === v.id)
        const totalDeduction = fullExceptions.reduce((sum, e) => sum + e.deduction, 0)
        // Sammle alle Rückbuchungs-Gründe (eindeutig)
        const exceptionReasons = [...new Set(fullExceptions.map(e => e.reason).filter(Boolean))]

        return {
          startDate: new Date(v.startDate).toLocaleDateString('de-DE'),
          endDate: new Date(v.endDate).toLocaleDateString('de-DE'),
          days: workdays,
          originalDays: originalDays,
          deduction: totalDeduction,
          hasException: fullExceptions.length > 0,
          exceptionReason: exceptionReasons.join(', '),
          reason: v.reason
        }
      })

      const total = user.entitlement + carryover
      const remaining = total - taken

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

    console.log(`✓ Annual report: Loaded ${employees.length} employees for year ${year}`)
    
    return employees

  } catch (error: any) {
    console.error('❌ ERROR in GET /api/reports/annual-employee-details:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Mitarbeiterdaten: ' + error.message
    })
  }
})
