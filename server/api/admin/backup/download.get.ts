// server/api/admin/backup/download.get.ts
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  if (user?.username !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Nur Admin darf Backups herunterladen'
    })
  }
  
  try {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        users: await db.prepare('SELECT * FROM users').all(),
        vacationRequests: await db.prepare('SELECT * FROM vacation_requests').all(),
        organization: await db.prepare('SELECT * FROM organization').all(),
        carryover: await db.prepare('SELECT * FROM carryover').all(),
        halfDayRules: await db.prepare('SELECT * FROM half_day_rules').all()
      }
    }
    
    const backupJson = JSON.stringify(backup, null, 2)
    
    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Content-Disposition', `attachment; filename="backup-${Date.now()}.json"`)
    
    return backupJson
  } catch (error: any) {
    console.error('Download Fehler:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Download des Backups'
    })
  }
})
