// server/api/users/[username].patch.ts
import { execute, queryOne } from '../../database/db'
import { icons } from '../../../app/config/icons'

export default defineEventHandler(async (event) => {
  try {
    const username = getRouterParam(event, 'username')
    const body = await readBody(event)

    console.log(icons.roles.sysadmin + ' PATCH /api/users/' + username)
    console.log('📝 Body:', body)

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

    console.log(icons.actions.approve + ' User gefunden:', user.username)

    // UPDATE users Tabelle
    const userUpdates: string[] = []
    const userParams: any[] = []

    if (body.role !== undefined) {
      userUpdates.push('role = ?')
      userParams.push(body.role)
      console.log('  → Update role:', body.role)
    }

    if (body.vacationDays !== undefined) {
      userUpdates.push('vacationDays = ?')
      userParams.push(body.vacationDays)
      console.log('  → Update vacationDays:', body.vacationDays)
    }

    if (body.isActive !== undefined) {
      userUpdates.push('isActive = ?')
      userParams.push(body.isActive ? 1 : 0)
      console.log('  → Update isActive:', body.isActive)
    }

    if (userUpdates.length > 0) {
      userUpdates.push("updatedAt = datetime('now')")
      userParams.push(username)

      const sql = `UPDATE users SET ${userUpdates.join(', ')} WHERE username = ?`
      console.log('SQL:', sql)
      console.log('Params:', userParams)

      execute(sql, userParams)
      console.log(icons.actions.approve + ' users table updated')
    }

    // UPDATE organization Tabelle (teamleadId)
    if (body.teamleadId !== undefined) {
      const teamleadId = body.teamleadId === '' ? null : body.teamleadId
      console.log('  → Update teamleadId:', teamleadId)
      
      const orgEntry = queryOne<any>('SELECT * FROM organization WHERE userId = ?', [username])
      
      if (orgEntry) {
        // Organization existiert → UPDATE
        execute(`
          UPDATE organization
          SET teamleadId = ?
          WHERE userId = ?
        `, [teamleadId, username])
        console.log(icons.actions.approve + ' organization table updated')
      } else {
        // Organization existiert nicht → INSERT
        execute(`
          INSERT INTO organization (userId, teamleadId)
          VALUES (?, ?)
        `, [username, teamleadId])
        console.log(icons.actions.approve + ' organization entry created')
      }
    }

    // Rolle geändert zu employee? → teamleadId automatisch setzen
    if (body.role === 'employee' && body.teamleadId !== undefined) {
      const teamleadId = body.teamleadId === '' ? null : body.teamleadId
      
      console.log('  → Employee role: set teamleadId:', teamleadId)
      
      const orgEntry = queryOne<any>('SELECT * FROM organization WHERE userId = ?', [username])
      
      if (orgEntry) {
        execute(`
          UPDATE organization
          SET teamleadId = ?
          WHERE userId = ?
        `, [teamleadId, username])
      } else {
        execute(`
          INSERT INTO organization (userId, teamleadId)
          VALUES (?, ?)
        `, [username, teamleadId])
      }
      
      console.log(icons.actions.approve + ' organization teamleadId updated for employee')
    }

    console.log(icons.actions.activate + ' Update completed successfully')
    return { success: true, message: 'Benutzer aktualisiert' }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error(icons.ui.error + ' Error updating user:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Aktualisieren des Benutzers'
    })
  }
})
