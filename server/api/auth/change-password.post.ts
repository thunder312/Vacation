// server/api/auth/change-password.post.ts
import { db } from '../../utils/db'
import bcrypt from 'bcrypt'
import type { DbUser } from '../../database/types'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated'
    })
  }

  const body = await readBody(event)
  const { oldPassword, newPassword } = body

  if (!oldPassword || !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Old and new password are required'
    })
  }

  if (newPassword.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 8 characters'
    })
  }

  try {
    // Get current password
    const dbUser = db.prepare('SELECT password FROM users WHERE username = ?')
      .get(user.username) as Pick<DbUser, 'password'> | undefined

    if (!dbUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, dbUser.password)

    if (!isValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Old password is incorrect'
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    db.prepare('UPDATE users SET password = ? WHERE username = ?')
      .run(hashedPassword, user.username)

    return {
      success: true,
      message: 'Password changed successfully'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Change password error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error changing password'
    })
  }
})
