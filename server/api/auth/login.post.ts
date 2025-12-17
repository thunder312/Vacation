// server/api/auth/login.post.ts
import bcrypt from 'bcrypt'
import { queryOne } from '../../database/db'

interface User {
  id: number
  username: string
  firstName: string | null
  lastName: string | null
  password: string
  role: string
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        message: 'Username und Passwort erforderlich'
      })
    }

    // User aus Datenbank holen
    const user = queryOne<User>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Ungültige Anmeldedaten'
      })
    }

    // Passwort verifizieren
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: 'Ungültige Anmeldedaten'
      })
    }

    // Displayname generieren
    let displayName = user.username
    if (user.firstName && user.lastName) {
      displayName = `${user.firstName} ${user.lastName}`
    }

    // User ohne Passwort zurückgeben
    return {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      displayName
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Login error:', error)
    throw createError({
      statusCode: 500,
      message: 'Interner Server-Fehler'
    })
  }
})
