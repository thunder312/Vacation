// scripts/reset-db.ts
/**
 * Reset-Script: Löscht und erstellt die Datenbank neu
 * 
 * Ausführen mit: npm run db:reset
 */

import { resetDatabase } from '../server/database/schema'
import { seedDatabase } from '../server/database/seed'
import { closeDb } from '../server/database/db'

console.log('🔄 Setze Datenbank zurück...\n')

async function reset() {
  try {
    // 1. Datenbank zurücksetzen (Tabellen löschen & neu erstellen)
    resetDatabase()
    
    // 2. Seed-Daten einfügen
    await seedDatabase()
    
    console.log('\n✅ Datenbank erfolgreich zurückgesetzt!')
  } catch (error) {
    console.error('\n❌ Fehler beim Reset:', error)
    throw error
  } finally {
    closeDb()
  }
}

reset()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
