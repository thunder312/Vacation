// server/middleware/auth.ts
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export default defineEventHandler(async (event) => {
  // Skip für nicht-API Routen
  if (!event.path.startsWith('/api')) {
    return
  }

  // Skip für Login
  if (event.path === '/api/auth/login') {
    return
  }

  try {
    // Get token from cookie
    const token = getCookie(event, 'auth-token')
    
    if (!token) {
      event.context.user = null
      return
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    event.context.user = {
      username: decoded.username,
      role: decoded.role,
      displayName: decoded.displayName
    }
  } catch (error: any) {
    // Token ungültig - einfach user auf null setzen
    event.context.user = null
  }
})
