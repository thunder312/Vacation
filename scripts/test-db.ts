// scripts/test-db.ts
/**
 * Test-Script für Datenbank-Verbindung
 * 
 * Ausführen mit: npx tsx scripts/test-db.ts
 */

import { getDb, closeDb } from '../server/database/db'
import { initSchema } from '../server/database/schema'
import { icons } from '../app/config/icons'

console.log('🧪 Teste Datenbank-Verbindung...\n')

try {
  // Datenbank öffnen
  const db = getDb()
  console.log(icons.actions.activate + ' Datenbank-Verbindung erfolgreich')

  // Schema initialisieren
  initSchema()
  console.log(icons.actions.activate + ' Schema initialisiert')

  // Test-Query
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all()

  console.log('\n' + icons.roles.office + ' Vorhandene Tabellen:')
  tables.forEach((table: any) => {
    console.log('  -', table.name)
  })

  // Statistiken
  const stats = {
    users: db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number },
    vacations: db.prepare('SELECT COUNT(*) as count FROM vacation_requests').get() as { count: number },
    halfDays: db.prepare('SELECT COUNT(*) as count FROM half_day_rules').get() as { count: number },
    carryover: db.prepare('SELECT COUNT(*) as count FROM carryover').get() as { count: number },
    organization: db.prepare('SELECT COUNT(*) as count FROM organization').get() as { count: number }
  }

  console.log('\n Datenbank-Statistiken:')
  console.log('  Benutzer:', stats.users.count)
  console.log('  Urlaubsanträge:', stats.vacations.count)
  console.log('  Halbtags-Regelungen:', stats.halfDays.count)
  console.log('  Überträge:', stats.carryover.count)
  console.log('  Org-Zuordnungen:', stats.organization.count)

  console.log(icons.actions.activate + ' Datenbank-Test erfolgreich!')

} catch (error) {
  console.error('\n' + icons.ui.error + ' Fehler beim Testen der Datenbank:', error)
  process.exit(1)
} finally {
  closeDb()
}
