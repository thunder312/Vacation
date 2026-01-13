// server/api/year-transition/init-system-settings.post.ts
import { run } from '../../database/db'
import { icons } from '../../../app/config/icons'

/**
 * Initialisiert system_settings Tabelle und setzt Jahr 2025
 * Nur für einmalige Verwendung wenn Tabelle fehlt!
 */
export default defineEventHandler(async (event) => {
  try {
    // Erstelle system_settings Tabelle
    run(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Setze Jahr 2025 als letzten Jahreswechsel
    run(`
      INSERT OR REPLACE INTO system_settings (key, value, updatedAt)
      VALUES ('last_year_transition', '2025', datetime('now'))
    `)

    console.log(icons.actions.activate + ' system_settings initialisiert mit Jahr 2025')

    return {
      success: true,
      message: 'system_settings Tabelle erstellt und Jahr 2025 gesetzt'
    }
  } catch (error: any) {
    console.error(icons.ui.error + ' Fehler bei Initialisierung:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler bei Initialisierung: ' + error.message
    })
  }
})
