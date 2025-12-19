// server/api/auth/change-password.post.ts
import { execute, queryOne } from '../../database/db'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { oldPassword, newPassword } = body

    // Session-Cookie prüfen (username aus Session)
    const authCookie = getCookie(event, 'auth')
    if (!authCookie) {
      throw createError({
        statusCode: 401,
        message: 'Nicht angemeldet'
      })
    }

    let username: string
    try {
      const parsed = JSON.parse(authCookie)
      username = parsed.username
    } catch {
      throw createError({
        statusCode: 401,
        message: 'Ungültige Session'
      })
    }

    console.log('🔑 Change password for:', username)

    // Validierung
    if (!oldPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        message: 'Altes und neues Passwort erforderlich'
      })
    }

    if (newPassword.length < 8) {
      throw createError({
        statusCode: 400,
        message: 'Neues Passwort muss mindestens 8 Zeichen lang sein'
      })
    }

    // User aus DB holen
    const user = queryOne<any>('SELECT * FROM users WHERE username = ?', [username])
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Benutzer nicht gefunden'
      })
    }

    // Altes Passwort prüfen
    const isValidPassword = await bcrypt.compare(oldPassword, user.password)
    if (!isValidPassword) {
      console.log('❌ Old password incorrect')
      throw createError({
        statusCode: 401,
        message: 'Altes Passwort ist falsch'
      })
    }

    console.log('✓ Old password correct')

    // Neues Passwort hashen
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Passwort in DB aktualisieren
    execute(`
      UPDATE users 
      SET password = ?, updatedAt = datetime('now')
      WHERE username = ?
    `, [hashedPassword, username])

    console.log('✓ Password updated')

    return { 
      success: true, 
      message: 'Passwort erfolgreich geändert' 
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('❌ Error changing password:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Ändern des Passworts'
    })
  }
})
