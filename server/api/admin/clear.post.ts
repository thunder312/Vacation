// server/api/admin/clear.post.ts
import { db } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  if (user?.username !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Nur Admin darf Datenbank leeren'
    })
  }
  
  try {
    // Lösche alle Daten (außer Admin-User)
    await db.prepare('DELETE FROM vacation_requests').run()
    await db.prepare('DELETE FROM carryover').run()
    await db.prepare('DELETE FROM half_day_rules').run()
    await db.prepare('DELETE FROM organization').run()
    await db.prepare('DELETE FROM users WHERE username != ?').run('admin')
    
    return {
      success: true,
      message: 'Datenbank erfolgreich geleert (Admin-User behalten)'
    }
  } catch (error: any) {
    console.error('Clear Fehler:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Leeren der Datenbank'
    })
  }
})
