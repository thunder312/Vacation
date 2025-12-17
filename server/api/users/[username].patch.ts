// server/api/users/[username].patch.ts
import { execute, queryOne } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const username = getRouterParam(event, 'username')
    const body = await readBody(event)

    if (!username) {
      throw createError({
        statusCode: 400,
        message: 'Username erforderlich'
      })
    }

    // Prüfe ob User existiert
    const user = queryOne<any>('SELECT * FROM users WHERE username = ?', [username])
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Benutzer nicht gefunden'
      })
    }

    // UPDATE users Tabelle
    const userUpdates: string[] = []
    const userParams: any[] = []

    if (body.role !== undefined) {
      userUpdates.push('role = ?')
      userParams.push(body.role)
    }

    if (body.vacationDays !== undefined) {
      userUpdates.push('vacationDays = ?')
      userParams.push(body.vacationDays)
    }

    if (body.isActive !== undefined) {
      userUpdates.push('isActive = ?')
      userParams.push(body.isActive ? 1 : 0)
    }

    if (userUpdates.length > 0) {
      userUpdates.push('updatedAt = datetime("now")')
      userParams.push(username)

      execute(`
        UPDATE users 
        SET ${userUpdates.join(', ')}
        WHERE username = ?
      `, userParams)
    }

    // UPDATE organization Tabelle (teamId)
    if (body.teamleadId !== undefined) {
      // teamleadId kann '' (leer), null oder ein Username sein
      const teamId = body.teamleadId === '' ? null : body.teamleadId
      
      // Prüfe ob organization Eintrag existiert
      const orgEntry = queryOne<any>('SELECT * FROM organization WHERE userId = ?', [username])
      
      if (orgEntry) {
        // Update bestehenden Eintrag
        execute(`
          UPDATE organization 
          SET teamId = ?, managerId = ?
          WHERE userId = ?
        `, [teamId, teamId, username])  // managerId = teamId für Employees
      } else {
        // Erstelle neuen Eintrag (sollte nicht vorkommen, aber zur Sicherheit)
        execute(`
          INSERT INTO organization (userId, teamId, managerId)
          VALUES (?, ?, ?)
        `, [username, teamId, teamId])
      }
    }

    // Rolle geändert? → Update organization.managerId
    if (body.role !== undefined) {
      const newRole = body.role
      let managerId = null
      
      if (newRole === 'employee' && body.teamleadId) {
        // Employee: managerId = teamleadId
        managerId = body.teamleadId === '' ? null : body.teamleadId
      } else if (newRole === 'teamlead' || newRole === 'office') {
        // Teamleiter/Office: Unter Manager
        managerId = 'Schulz'
      }
      // Manager: managerId = null (bereits default)
      
      execute(`
        UPDATE organization 
        SET managerId = ?
        WHERE userId = ?
      `, [managerId, username])
    }

    return { success: true, message: 'Benutzer aktualisiert' }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error updating user:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Aktualisieren des Benutzers'
    })
  }
})
