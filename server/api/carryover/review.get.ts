// server/api/carryover/review.get.ts
import { query } from '../../database/db'
import { icons } from '../../../app/config/icons'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const year = parseInt(queryParams.year as string) || new Date().getFullYear()

  try {
    // Hole alle aktiven Mitarbeiter mit berechneten Überträgen
    const carryovers = query<any>(`
      SELECT 
        u.username as userId,
        CASE 
          WHEN u.firstName IS NOT NULL AND u.lastName IS NOT NULL 
          THEN u.firstName || ' ' || u.lastName
          ELSE u.username
        END as displayName,
        u.vacationDays as vacationDaysPerYear,
        
        -- Berechneter Übertrag aus Vorjahr
        -- = Jahres-Urlaubstage MINUS genommene Tage im Vorjahr
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
        ) as originalDays,
        
        -- Bereits gespeicherter Übertrag (falls vorhanden)
        c.carryoverDays as approvedDays,
        c.expiryDate
        
      FROM users u
      LEFT JOIN carryover c 
        ON u.username = c.userId AND c.year = ?
      WHERE u.isActive = 1
        AND u.role IN ('employee', 'teamlead')
      ORDER BY displayName
    `, [(year - 1).toString(), year])

    // Formatiere Ergebnis für UI
    const result = carryovers.map((c: any) => ({
      userId: c.userId,
      displayName: c.displayName,
      vacationDaysPerYear: c.vacationDaysPerYear,
      originalDays: Math.max(c.originalDays, 0), // Negativ → 0
      approvedDays: c.approvedDays ?? Math.max(c.originalDays, 0),
      status: c.approvedDays !== null ? 'approved' : 'pending',
      expiryDate: c.expiryDate,
      // Dummy-Felder für UI (nicht im Schema vorhanden)
      adjustmentReason: null,
      adjustedBy: null,
      adjustedAt: null,
      approvedBy: null,
      approvedAt: null
    }))

    console.log(icons.actions.activate + ' Loaded ${result.length} carryover entries for year ${year}')
    return result

  } catch (error: any) {
    console.error(icons.ui.error + ' ERROR in GET /api/carryover/review:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Überträge: ' + error.message
    })
  }
})
