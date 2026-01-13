// server/api/admin/backup/last.get.ts
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  if (!user || user.role !== 'administrator') {
    throw createError({
      statusCode: 403,
      message: 'Nur Administrator darf Backup-Info abrufen'
    })
  }
  
  try {
    // Berechne Größe aller Daten
    const users = await db.prepare('SELECT * FROM users').all()
    const requests = await db.prepare('SELECT * FROM vacation_requests').all()
    const org = await db.prepare('SELECT * FROM organization').all()
    const carryover = await db.prepare('SELECT * FROM carryover').all()
    const rules = await db.prepare('SELECT * FROM half_day_rules').all()
    
    const dataSize = JSON.stringify({ users, requests, org, carryover, rules }).length
    
    return {
      date: new Date().toISOString(),
      size: dataSize,
      tables: 5
    }
  } catch (error: any) {
    return null
  }
})
