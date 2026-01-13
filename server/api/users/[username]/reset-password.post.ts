// server/api/users/[username]/reset-password.post.ts
import { execute, queryOne } from '../../../database/db'
import bcrypt from 'bcrypt'
import { icons } from '../../../../app/config/icons'

export default defineEventHandler(async (event) => {
  try {
    const username = getRouterParam(event, 'username')
    const body = await readBody(event)

    console.log('🔑 Password reset for:', username)

    if (!username) {
      throw createError({
        statusCode: 400,
        message: 'Username erforderlich'
      })
    }

    if (!body.password || body.password.length < 8) {
      throw createError({
        statusCode: 400,
        message: 'Passwort muss mindestens 8 Zeichen lang sein'
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

    console.log(icons.actions.approve + ' User found:', user.username)

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Passwort in DB aktualisieren
    execute(`
      UPDATE users 
      SET password = ?, updatedAt = datetime('now')
      WHERE username = ?
    `, [hashedPassword, username])

    console.log(icons.actions.approve + ' Password updated')

    return { 
      success: true, 
      message: `Passwort für ${user.firstName} ${user.lastName} zurückgesetzt` 
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error(icons.ui.error + 'Error resetting password:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Zurücksetzen des Passworts'
    })
  }
})
