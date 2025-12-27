// server/api/admin/backup.post.ts
import { db } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  // Nur Admin darf Backup erstellen
  if (user?.username !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Nur Admin darf Backups erstellen'
    })
  }
  
  try {
    // Alle Tabellen exportieren
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
    const backupSize = Buffer.byteLength(backupJson, 'utf8')
    
    // Speichere Backup-Info
    const backupInfo = {
      date: backup.timestamp,
      size: backupSize,
      tables: Object.keys(backup.data).length
    }
    
    // Optional: Backup in Filesystem speichern
    // await writeFile(`./backups/backup-${Date.now()}.json`, backupJson)
    
    return backupInfo
  } catch (error: any) {
    console.error('Backup Fehler:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Erstellen des Backups'
    })
  }
})
