// server/api/admin/import-users.post.ts
import { db } from '~/server/utils/db'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  if (user?.username !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Nur Admin darf Benutzer importieren'
    })
  }
  
  const { users } = await readBody(event)
  
  if (!Array.isArray(users) || users.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Keine Benutzerdaten zum Importieren'
    })
  }
  
  const results = {
    imported: 0,
    skipped: 0,
    errors: [] as string[],
    details: [] as string[]
  }
  
  try {
    for (const userData of users) {
      try {
        // Validierung
        if (!userData.username || !userData.displayName) {
          results.skipped++
          results.errors.push(`Zeile ${results.imported + results.skipped + 1}: Username oder DisplayName fehlt`)
          continue
        }
        
        // Prüfe ob User existiert
        const existing = await db.prepare('SELECT username FROM users WHERE username = ?')
          .get(userData.username)
        
        if (existing) {
          results.skipped++
          results.details.push(`${userData.username}: Übersprungen (existiert bereits)`)
          continue
        }
        
        // Generiere Passwort
        const password = Math.random().toString(36).slice(-8)
        const hashedPassword = await bcrypt.hash(password, 10)
        
        // Erstelle User
        await db.prepare(`
          INSERT INTO users (username, password, displayName, role, vacationDays, isActive)
          VALUES (?, ?, ?, ?, ?, 1)
        `).run(
          userData.username,
          hashedPassword,
          userData.displayName,
          userData.role || 'employee',
          userData.vacationDays || 30
        )
        
        // Füge zur Organization hinzu (falls teamlead angegeben)
        if (userData.teamleadUsername) {
          await db.prepare(`
            INSERT INTO organization (userId, teamleadId)
            VALUES (?, ?)
          `).run(userData.username, userData.teamleadUsername)
        }
        
        results.imported++
        results.details.push(`${userData.username}: Importiert (Passwort: ${password})`)
      } catch (err: any) {
        results.skipped++
        results.errors.push(`${userData.username}: ${err.message}`)
      }
    }
    
    return {
      success: true,
      imported: results.imported,
      skipped: results.skipped,
      details: results.details,
      errors: results.errors
    }
  } catch (error: any) {
    console.error('Import Fehler:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Importieren der Benutzer',
      data: { errors: results.errors }
    })
  }
})
