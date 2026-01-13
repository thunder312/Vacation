// server/api/admin/backup.post.ts
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  console.log('Backup Request - User:', user)
  
  // Nur Administrator darf Backup erstellen
  if (!user || user.role !== 'administrator') {
    console.error('Access denied:', user)
    throw createError({
      statusCode: 403,
      message: 'Nur Administrator darf Backups erstellen'
    })
  }
  
  try {
    console.log('Creating backup...')
    
    // Alle Tabellen exportieren
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        users: db.prepare('SELECT * FROM users').all(),
        vacationRequests: db.prepare('SELECT * FROM vacation_requests').all(),
        organization: db.prepare('SELECT * FROM organization').all(),
        carryover: db.prepare('SELECT * FROM carryover').all(),
        halfDayRules: db.prepare('SELECT * FROM half_day_rules').all()
      }
    }
    
    const backupJson = JSON.stringify(backup, null, 2)
    const backupSize = Buffer.byteLength(backupJson, 'utf8')
    
    console.log('Backup created successfully, size:', backupSize)
    
    // Speichere Backup-Info
    const backupInfo = {
      date: backup.timestamp,
      size: backupSize,
      tables: Object.keys(backup.data).length
    }
    
    return backupInfo
  } catch (error: any) {
    console.error('Backup Fehler:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Erstellen des Backups: ' + error.message
    })
  }
})
