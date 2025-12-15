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

    // Baue UPDATE Query dynamisch
    const updates: string[] = []
    const params: any[] = []

    if (body.role !== undefined) {
      updates.push('role = ?')
      params.push(body.role)
    }

    if (body.vacationDays !== undefined) {
      updates.push('vacationDays = ?')
      params.push(body.vacationDays)
    }

    if (body.teamleadId !== undefined) {
      updates.push('teamleadId = ?')
      params.push(body.teamleadId)
    }

    if (body.isActive !== undefined) {
      updates.push('isActive = ?')
      params.push(body.isActive ? 1 : 0)
    }

    if (updates.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Keine Änderungen angegeben'
      })
    }

    updates.push('updatedAt = datetime("now")')
    params.push(username)

    execute(`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE username = ?
    `, params)

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
