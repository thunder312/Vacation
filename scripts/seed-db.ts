// scripts/seed-db.ts
/**
 * Seed-Script: Füllt die Datenbank mit initialen Daten
 * 
 * Ausführen mit: npm run db:seed
 */

import { seedDatabase } from '../server/database/seed'
import { closeDb } from '../server/database/db'

console.log('🌱 Starte Datenbank-Seeding...\n')

seedDatabase()
  .then(() => {
    console.log('\n✅ Seeding erfolgreich abgeschlossen!')
    closeDb()
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fehler beim Seeding:', error)
    closeDb()
    process.exit(1)
  })
