// server/plugins/database.ts
import { initSchema } from '../schema'
import {icons} from "~/config/icons";

/**
 * Nitro Plugin: Wird beim Server-Start ausgeführt
 * Initialisiert die Datenbank und erstellt Tabellen
 */
export default defineNitroPlugin(() => {
  console.log('🚀 Initialisiere Datenbank...')
  
  try {
    // Schema erstellen (falls noch nicht vorhanden)
    initSchema()
    
    console.log(icons.actions.activate + ' Datenbank bereit')
  } catch (error) {
    console.error('{{`icons.ui.error`}} Fehler beim Initialisieren der Datenbank:', error)
    throw error
  }
})
