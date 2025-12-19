// server/api/users/index.post.ts
import { execute, queryOne } from '../../database/db'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { firstName, lastName, role, vacationDays, teamleadId, password } = body

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

    // Username generieren mit intelligenter Konfliktauflösung
    const generateUsername = (first: string, last: string): string => {
      const firstLower = first.toLowerCase()
      const lastLower = last.toLowerCase()
      
      // Versuch 1: Nur Nachname
      let username = lastLower
      let existing = queryOne<any>('SELECT username FROM users WHERE username = ?', [username])
      if (!existing) return username
      
      // Versuch 2-N: Füge Buchstaben des Vornamens hinzu (1, 2, 3, ... alle)
      for (let i = 1; i <= firstLower.length; i++) {
        username = firstLower.substring(0, i) + lastLower
        existing = queryOne<any>('SELECT username FROM users WHERE username = ?', [username])
        if (!existing) {
          console.log(`⚠️  '${lastLower}' existiert, verwende '${username}'`)
          return username
        }
      }
      
      // Versuch 3-N: Vollständiger Name existiert auch → Füge Index hinzu
      const fullName = firstLower + lastLower
      let index = 1
      while (true) {
        username = fullName + index
        existing = queryOne<any>('SELECT username FROM users WHERE username = ?', [username])
        if (!existing) {
          console.log(`⚠️  '${fullName}' existiert, verwende '${username}'`)
          return username
        }
        index++
        
        // Sicherheit: Maximal 100 Versuche
        if (index > 100) {
          throw new Error('Konnte keinen eindeutigen Username generieren')
        }
      }
    }

    const username = generateUsername(firstName, lastName)

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
