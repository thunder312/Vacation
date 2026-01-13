// server/api/admin/clear.post.ts
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  if (!user || user.role !== 'administrator') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Nur Administrator darf die Datenbank leeren'
    })
  }
  
  try {
    console.log('🗑️ Clearing database...')
    
    // Foreign Keys temporär deaktivieren
    db.pragma('foreign_keys = OFF')
    
    // Transaction starten
    db.exec('BEGIN TRANSACTION')
    
    try {
      // 1. Vacation Exceptions löschen (hat Foreign Keys)
      db.prepare('DELETE FROM vacation_exceptions').run()
      console.log('✓ vacation_exceptions gelöscht')
      
      // 2. Vacation Requests löschen (hat Foreign Key zu users)
      db.prepare('DELETE FROM vacation_requests').run()
      console.log('✓ vacation_requests gelöscht')
      
      // 3. Organization löschen (hat Foreign Keys zu users)
      db.prepare('DELETE FROM organization').run()
      console.log('✓ organization gelöscht')
      
      // 4. Carryover löschen (hat Foreign Key zu users)
      db.prepare('DELETE FROM carryover').run()
      console.log('✓ carryover gelöscht')
      
      // 5. Half Day Rules löschen (keine Foreign Keys)
      db.prepare('DELETE FROM half_day_rules').run()
      console.log('✓ half_day_rules gelöscht')
      
      // 6. Alle Users außer Administrator löschen
      db.prepare("DELETE FROM users WHERE role != 'administrator'").run()
      console.log('✓ users gelöscht (außer Administrator)')
      
      // 7. WICHTIG: AUTOINCREMENT Sequenzen zurücksetzen
      // SQLite speichert die AUTO_INCREMENT Werte in sqlite_sequence
      db.prepare("DELETE FROM sqlite_sequence").run()
      console.log('✓ AUTO_INCREMENT Sequenzen zurückgesetzt')
      
      // 8. VACUUM um Datenbank zu komprimieren und aufzuräumen
      // Muss NACH dem COMMIT ausgeführt werden (nicht in Transaction)
      
      // Transaction committen
      db.exec('COMMIT')
      console.log('✅ Datenbank geleert')
      
    } catch (error) {
      // Bei Fehler rollback
      db.exec('ROLLBACK')
      throw error
    } finally {
      // Foreign Keys wieder aktivieren
      db.pragma('foreign_keys = ON')
    }
    
    // VACUUM außerhalb der Transaction
    try {
      db.exec('VACUUM')
      console.log('✓ VACUUM abgeschlossen')
    } catch (vacuumError) {
      console.warn('⚠️ VACUUM Warnung:', vacuumError)
      // VACUUM Fehler sind nicht kritisch
    }
    
    return {
      success: true,
      message: 'Datenbank erfolgreich geleert'
    }
  } catch (error: any) {
    console.error('❌ Clear Fehler:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Leeren der Datenbank: ' + error.message
    })
  }
})
