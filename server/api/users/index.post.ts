// server/api/users/index.post.ts
import { execute, queryOne } from '../../database/db'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, firstName, lastName, role, vacationDays, teamleadId } = body

    // Validierung
    if (!username || !firstName || !lastName || !role || vacationDays === undefined) {
      throw createError({
        statusCode: 400,
        message: 'Fehlende Pflichtfelder'
      })
    }

    // Prüfe ob Username bereits existiert
    const existing = queryOne<any>('SELECT username FROM users WHERE username = ?', [username])
    if (existing) {
      throw createError({
        statusCode: 400,
        message: 'Benutzername existiert bereits'
      })
    }

    // Standard-Passwort: role + "123" (z.B. employee123)
    const defaultPassword = `${role}123`
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    // User erstellen
    execute(`
      INSERT INTO users (
        username, 
        password, 
        firstName,
        lastName,
        role, 
        vacationDays,
        teamleadId,
        isActive
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [username, hashedPassword, firstName, lastName, role, vacationDays, teamleadId || null])

    return {
      success: true,
      username,
      message: `Benutzer erstellt. Standard-Passwort: ${defaultPassword}`
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error creating user:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Erstellen des Benutzers'
    })
  }
})
