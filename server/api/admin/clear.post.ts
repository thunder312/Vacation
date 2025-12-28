// server/api/admin/clear.post.ts
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  if (!user || user.username !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Nur Admin darf die Datenbank leeren'
    })
  }
  
  try {
    console.log('Clearing database...')
    
    // Foreign Keys temporär deaktivieren
    db.pragma('foreign_keys = OFF')
    
    // Transaction starten
    db.exec('BEGIN TRANSACTION')
    
    try {
      // 1. Vacation Requests löschen (hat Foreign Key zu users)
      db.prepare('DELETE FROM vacation_requests').run()
      console.log('✓ vacation_requests gelöscht')
      
      // 2. Organization löschen (hat Foreign Keys zu users)
      db.prepare('DELETE FROM organization').run()
      console.log('✓ organization gelöscht')
      
      // 3. Carryover löschen (hat Foreign Key zu users)
      db.prepare('DELETE FROM carryover').run()
      console.log('✓ carryover gelöscht')
      
      // 4. Half Day Rules löschen (keine Foreign Keys)
      db.prepare('DELETE FROM half_day_rules').run()
      console.log('✓ half_day_rules gelöscht')
      
      // 5. Alle Users außer admin löschen
      db.prepare("DELETE FROM users WHERE username != 'admin'").run()
      console.log('✓ users gelöscht (außer admin)')
      
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
    
    return {
      success: true,
      message: 'Datenbank erfolgreich geleert'
    }
  } catch (error: any) {
    console.error('Clear Fehler:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Leeren der Datenbank: ' + error.message
    })
  }
})
