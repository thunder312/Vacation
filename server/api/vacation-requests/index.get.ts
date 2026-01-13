// server/api/vacation-requests/index.get.ts
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    // JOIN mit users Tabelle um firstName und lastName zu bekommen
    const requests = db.prepare(`
      SELECT 
        vr.*,
        u.firstName,
        u.lastName
      FROM vacation_requests vr
      LEFT JOIN users u ON vr.userId = u.username
      ORDER BY vr.createdAt DESC
    `).all()
    
    // Füge displayName hinzu (firstName + lastName)
    const requestsWithDisplayName = requests.map((r: any) => ({
      ...r,
      displayName: r.firstName && r.lastName 
        ? `${r.firstName} ${r.lastName}` 
        : r.userId
    }))
    
    return requestsWithDisplayName
  } catch (error) {
    console.error('Error fetching vacation requests:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Urlaubsanträge'
    })
  }
})
