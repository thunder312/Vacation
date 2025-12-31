// server/api/users/index.post.ts
import { db } from '../../utils/db'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { firstName, lastName, username, role, vacationDays, teamleadId, password } = body

    // Validierung
    if (!firstName || !lastName || !role || vacationDays === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Fehlende Pflichtfelder'
      })
    }

    // Passwort validieren (falls übermittelt)
    if (password && password.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Passwort muss mindestens 8 Zeichen lang sein'
      })
    }

    // Passwort hashen (custom oder Standard)
    const plainPassword = password || `${role}123`
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    // 1. User erstellen
    db.prepare(`
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
    `).run(username, hashedPassword, firstName, lastName, role, vacationDays)

    // 2. Organization-Eintrag erstellen
    // Die organization Tabelle hat nur: userId, teamleadId
    let finalTeamleadId = null
    
    if (role === 'employee' && teamleadId) {
      // Employee hat einen Teamleiter
      finalTeamleadId = teamleadId
    } else if (role === 'teamlead') {
      // Teamleiter: Suche ob es einen Manager gibt
      const manager = db.prepare(`
        SELECT username FROM users WHERE role = 'manager' LIMIT 1
      `).get() as any
      
      if (manager) {
        finalTeamleadId = manager.username  // Teamleiter → unter Manager
      }
      // Sonst null (kein Manager vorhanden)
    }
    // Für manager, office, sysadmin: teamleadId bleibt null
    
    db.prepare(`
      INSERT INTO organization (userId, teamleadId)
      VALUES (?, ?)
    `).run(username, finalTeamleadId)

    console.log(`✓ User created: ${username} (${role})`)

    return {
      success: true,
      username,
      password: plainPassword,
      message: `Benutzer '${username}' erstellt`
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('❌ Error creating user:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Erstellen des Benutzers: ' + error.message
    })
  }
})
