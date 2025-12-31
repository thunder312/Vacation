// server/api/users/index.get.ts
import { query } from '../../database/db'
import { icons } from '../../../app/config/icons'

export default defineEventHandler(async (event) => {
  try {
    const users = query<any>(`
      SELECT 
        u.username,
        CASE 
          WHEN u.firstName IS NOT NULL AND u.lastName IS NOT NULL 
          THEN u.firstName || ' ' || u.lastName
          ELSE u.username
        END as displayName,
        u.role,
        u.vacationDays,
        o.teamleadId as teamleadId,
        u.isActive,
        u.createdAt
      FROM users u
      LEFT JOIN organization o ON u.username = o.userId
      ORDER BY u.isActive DESC, displayName ASC
    `)

    return users
    
  } catch (error: any) {
    console.error(icons.ui.error + ' ERROR in GET /api/users:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Benutzer: ' + error.message
    })
  }
})
