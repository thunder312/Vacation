// server/api/users/[username].patch.ts
import { execute, queryOne } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const username = getRouterParam(event, 'username')
    const body = await readBody(event)

    console.log('🔧 PATCH /api/users/' + username)
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

    console.log('✓ User gefunden:', user.username)

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
      console.log('📊 SQL:', sql)
      console.log('📊 Params:', userParams)

      execute(sql, userParams)
      console.log('✓ users table updated')
    }

    // UPDATE organization Tabelle (teamId)
    if (body.teamleadId !== undefined) {
      const teamId = body.teamleadId === '' ? null : body.teamleadId
      console.log('  → Update teamleadId:', teamId)
      
      const orgEntry = queryOne<any>('SELECT * FROM organization WHERE userId = ?', [username])
      
      if (orgEntry) {
        execute(`
          UPDATE organization 
          SET teamId = ?, managerId = ?
          WHERE userId = ?
        `, [teamId, teamId, username])
        console.log('✓ organization table updated')
      } else {
        execute(`
          INSERT INTO organization (userId, teamId, managerId)
          VALUES (?, ?, ?)
        `, [username, teamId, teamId])
        console.log('✓ organization entry created')
      }
    }

    // Rolle geändert? → Update organization.managerId
    if (body.role !== undefined) {
      const newRole = body.role
      let managerId = null
      
      if (newRole === 'employee' && body.teamleadId) {
        managerId = body.teamleadId === '' ? null : body.teamleadId
      } else if (newRole === 'teamlead' || newRole === 'office') {
        managerId = 'Schulz'
      }
      
      console.log('  → Update managerId:', managerId)
      
      execute(`
        UPDATE organization 
        SET managerId = ?
        WHERE userId = ?
      `, [managerId, username])
      console.log('✓ organization managerId updated')
    }

    console.log('✅ Update completed successfully')
    return { success: true, message: 'Benutzer aktualisiert' }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('❌ Error updating user:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Aktualisieren des Benutzers'
    })
  }
})
