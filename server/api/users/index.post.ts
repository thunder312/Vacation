// server/api/users/index.post.ts
import { execute, queryOne } from '../../database/db'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { firstName, lastName, username, role, vacationDays, teamleadId, password } = body

    // Validierung
    if (!firstName || !lastName || !role || vacationDays === undefined) {
      throw createError({
        statusCode: 400,
        message: 'Fehlende Pflichtfelder'
      })
    }

    // Passwort validieren (falls übermittelt)
    if (password && password.length < 8) {
      throw createError({
        statusCode: 400,
        message: 'Passwort muss mindestens 8 Zeichen lang sein'
      })
    }

    // Passwort hashen (custom oder Standard)
    const plainPassword = password || `${role}123`
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    // 1. User erstellen
    execute(`
      INSERT INTO users (
        username, 
        password, 
        firstName,
        lastName,
        role, 
        vacationDays,
        isActive
      )
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [username, hashedPassword, firstName, lastName, role, vacationDays])

    // 2. Organization-Eintrag erstellen
    let managerId = null
    let teamId = null
    
    if (role === 'employee' && teamleadId) {
      teamId = teamleadId
      managerId = teamleadId
    } else if (role === 'teamlead' || role === 'office' || role === 'sysadmin') {
      // Teamleiter, Office und System-Admin direkt unter Manager
      managerId = 'Schulz'
    }
    
    execute(`
      INSERT INTO organization (userId, teamId, managerId)
      VALUES (?, ?, ?)
    `, [username, teamId, managerId])

    return {
      success: true,
      username,
      message: `Benutzer '${username}' erstellt. Passwort: ${plainPassword}`
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error creating user:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Erstellen des Benutzers: ' + error.message
    })
  }
})
