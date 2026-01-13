// server/api/year-transition/execute.post.ts
import { query, run, transaction } from '../../database/db'

interface AdjustmentVacation {
  days: number
  reason: string
}
interface AdjustmentHalfDay {
  id: number
  description: string
  date: string
  proceed: boolean
}

export default defineEventHandler(async (event) => {
  // Nur Manager darf Jahreswechsel durchführen
  const currentUserCookie = getCookie(event, 'currentUser')

  let currentUser: any = null
  try {
    currentUser = currentUserCookie ? JSON.parse(currentUserCookie) : null
  } catch (e) {
    console.error('Fehler beim Parsen des currentUser Cookies:', e)
  }


  if (!currentUser || (currentUser.role !== 'manager' && currentUser.role !== 'sysadmin')) {
    throw createError({
      statusCode: 403,
      message: `Nur Manager können den Jahreswechsel durchführen (aktuell: ${currentUser?.username || 'unbekannt'}, rolle: ${currentUser?.role || 'nicht gefunden'})`
    })
  }

  try {
    const body = await readBody(event)
    const adjustmentsVacation: Record<string, AdjustmentVacation> = body?.adjustmentsVacation || {}
    const adjustmentsHalfDay: Record<string, AdjustmentHalfDay> = body?.adjustmentsHalfDay || {}

    const currentYear = new Date().getFullYear()
    const previousYear = currentYear - 1

    let updatedCountUser = 0
      let updatedCountHalfDays = 0

    // Erstelle system_settings Tabelle ZUERST (außerhalb Transaction)
    run(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Transaction verwenden
    transaction(() => {
      // Hole alle aktiven Benutzer (ohne Administrator)
      const users = query<any>(`
        SELECT
          username as userId,
          vacationDays as vacationDaysPerYear
        FROM users
        WHERE isActive = 1 AND role != 'administrator'
      `)

       // HalfDays werden aus adjustmentsHalfDay übernommen (vom Frontend übergeben)

      users.forEach((user: any) => {
        // Hole existierendes Carryover für letztes Jahr
        const lastYearCarryover = query<any>(`
          SELECT calculatedDays FROM carryover
          WHERE userId = ? AND year = ?
        `, [user.userId, currentYear - 1])

        const carryover = lastYearCarryover.length > 0 ? lastYearCarryover[0].calculatedDays : 0

        // Berechne verbleibende Tage - mit julianday für korrekte Berechnung
        const balance = query<any>(`
          SELECT
            COALESCE(SUM(julianday(endDate) - julianday(startDate) + 1), 0) as usedDays
          FROM vacation_requests
          WHERE userId = ?
            AND status IN ('approved', 'teamlead_approved')
            AND strftime('%Y', startDate) = ?
        `, [user.userId, (currentYear - 1).toString()])

        const currentTotal = user.vacationDaysPerYear + carryover
        const remaining = currentTotal - balance[0].usedDays

        // Berechneter Übertrag
        const calculatedCarryover = Math.max(remaining, 0)

        // Angepasster Übertrag (falls vorhanden)
        const adjustment = adjustmentsVacation[user.userId]
        const approvedDays = adjustment ? adjustment.days : calculatedCarryover
        const reason = adjustment?.reason || null

        // Speichere in carryover Tabelle
        run(`
          INSERT INTO carryover (userId, year, calculatedDays, approvedDays, reason, status, createdAt)
          VALUES (?, ?, ?, ?, ?, 'approved', datetime('now'))
          ON CONFLICT(userId, year)
          DO UPDATE SET
            calculatedDays = ?,
            approvedDays = ?,
            reason = ?,
            status = 'approved'
        `, [user.userId, currentYear, calculatedCarryover, approvedDays, reason, calculatedCarryover, approvedDays, reason])

        updatedCountUser++
      })

      // Übertrage die ausgewählten Halbtage ins neue Jahr
      Object.values(adjustmentsHalfDay).forEach((adjustment) => {
        // Nur übernehmen wenn proceed = true
        if (!adjustment.proceed) return

        // Prüfe ob der Halbtag für dieses Jahr bereits existiert
        const existing = query<any>(`
          SELECT id FROM half_day_rules WHERE date = ?
        `, [adjustment.date])

        if (existing.length === 0) {
          // Neuen Halbtag für das aktuelle Jahr einfügen
          run(`
            INSERT INTO half_day_rules (date, description, createdAt)
            VALUES (?, ?, datetime('now'))
          `, [adjustment.date, adjustment.description])

          updatedCountHalfDays++
        }
      })

      // Speichere letzten Jahreswechsel
      run(`
        INSERT OR REPLACE INTO system_settings (key, value, updatedAt)
        VALUES ('last_year_transition', ?, datetime('now'))
      `, [currentYear.toString()])

      console.log(`✅ Year transition completed for ${updatedCountHalfDays} half days.`)
    })

    return {
      success: true,
        updatedCountUser,
        updatedCountHalfDays,
      year: currentYear
    }
  } catch (error: any) {
    console.error('Fehler beim Jahreswechsel:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Jahreswechsel: ' + error.message
    })
  }
})
