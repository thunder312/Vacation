// server/api/users/[username]/status.patch.ts - MIT DECODING
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  // Nur Manager und admin dürfen User aktivieren/deaktivieren
  if (!user || (user.role !== 'manager' && user.username !== 'admin')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Keine Berechtigung'
    })
  }
  
  // Username aus URL holen und decoden (für Umlaute)
  const rawUsername = getRouterParam(event, 'username')
  const username = rawUsername ? decodeURIComponent(rawUsername) : null
  
  const body = await readBody(event)
  const { isActive } = body
  
  console.log('Toggle Status für User:', username, '→', isActive)
  
  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username fehlt'
    })
  }
  
  if (typeof isActive !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'isActive muss boolean sein'
    })
  }
  
  // Admin kann nicht deaktiviert werden
  if (username === 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin kann nicht deaktiviert werden'
    })
  }
  
  try {
    // Update isActive Status
    const result = db.prepare(`
      UPDATE users 
      SET isActive = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE username = ?
    `).run(isActive ? 1 : 0, username)
    
    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User nicht gefunden'
      })
    }
    
    console.log(`✓ User ${username} ${isActive ? 'aktiviert' : 'deaktiviert'}`)
    
    return {
      success: true,
      message: `User ${isActive ? 'aktiviert' : 'deaktiviert'}`
    }
  } catch (error: any) {
    console.error('Status update error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Aktualisieren des Status: ' + error.message
    })
  }
})
