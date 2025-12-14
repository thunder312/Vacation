// server/plugins/database.ts
import { initSchema } from '../database/schema'

/**
 * Nitro Plugin: Wird beim Server-Start ausgeführt
 * Initialisiert die Datenbank und erstellt Tabellen
 */
export default defineNitroPlugin(() => {
  console.log('🚀 Initialisiere Datenbank...')
  
  try {
    // Schema erstellen (falls noch nicht vorhanden)
    initSchema()
    
    console.log('✅ Datenbank bereit')
  } catch (error) {
    console.error('❌ Fehler beim Initialisieren der Datenbank:', error)
    throw error
  }
})
