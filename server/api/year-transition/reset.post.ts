// server/api/year-transition/reset.post.ts
import { query, run } from '../../database/db'

export default defineEventHandler(async (event) => {
  // Nur Manager darf Jahreswechsel zurücksetzen
  const cookies = parseCookies(event)

    const currentUser = getCookie(event, 'currentUser');

    const user = typeof currentUser === 'string'
        ? JSON.parse(currentUser)
        : currentUser;

    //console.log("@@@ User: ", user);

  if (!user || user.length === 0 || user.role !== 'manager') {
    throw createError({
      statusCode: 403,
      message: 'Nur Manager können den Jahreswechsel zurücksetzen'
    })
  }

  try {
    const currentYear = new Date().getFullYear()

    // Prüfe ob ein Jahreswechsel durchgeführt wurde
    const setting = query<any>(`
      SELECT value FROM system_settings WHERE key = 'last_year_transition'
    `)

    if (!setting || setting.length === 0 || setting[0].value !== currentYear.toString()) {
      throw createError({
        statusCode: 400,
        message: 'Kein Jahreswechsel für das aktuelle Jahr gefunden'
      })
    }

    // Lösche alle Carryover-Einträge für das aktuelle Jahr
    const deletedCarryover = run(`
      DELETE FROM carryover WHERE year = ?
    `, [currentYear])

    // Lösche alle Halbtage des aktuellen Jahres (die beim Jahreswechsel angelegt wurden)
    const deletedHalfDays = run(`
      DELETE FROM half_day_rules WHERE substr(date, 1, 4) = ?
    `, [currentYear.toString()])

    // Entferne den system_settings Eintrag
    run(`
      DELETE FROM system_settings WHERE key = 'last_year_transition'
    `)

    console.log(`🔄 Year transition reset for ${currentYear} (${deletedHalfDays.changes} Halbtage gelöscht)`)

    return {
      success: true,
      message: `Jahreswechsel ${currentYear} wurde zurückgesetzt`,
      year: currentYear
    }
  } catch (error: any) {
    console.error('Fehler beim Zurücksetzen des Jahreswechsels:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fehler beim Zurücksetzen des Jahreswechsels'
    })
  }
})
