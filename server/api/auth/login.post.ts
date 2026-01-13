// server/api/auth/login.post.ts
import { db } from '../../utils/db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { DbUser } from '../../database/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required'
    })
  }

  try {
    // Find user
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as DbUser | undefined

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      throw createError({
        statusCode: 403,
        statusMessage: 'User account is deactivated'
      })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        username: user.username,
        role: user.role,
        displayName: user.lastName  // displayName = lastName
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set cookie
    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    // Response - displayName = lastName
    return {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.lastName,  // displayName = lastName
      role: user.role,
      vacationDays: user.vacationDays
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Login error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
