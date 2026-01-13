// server/api/organization/index.get.ts
import { query } from '../../database/db'

interface OrgNode {
  userId: string
  displayName: string
  role: string
  teamleadId: string | null  // ← Geändert von teamId
  isActive: number
}

export default defineEventHandler(async (event) => {
  try {
    // Hole alle Org-Daten mit User-Infos per JOIN
    const orgNodes = query<OrgNode>(`
      SELECT 
        u.username as userId,
        u.firstName,
        u.lastName,
        CASE 
          WHEN u.firstName IS NOT NULL AND u.lastName IS NOT NULL 
          THEN u.firstName || ' ' || u.lastName
          ELSE u.username
        END as displayName,
        u.role,
        o.teamleadId,
        u.isActive
      FROM users u
      LEFT JOIN organization o ON u.username = o.userId
      ORDER BY
        CASE u.role
          WHEN 'manager' THEN 1
          WHEN 'office' THEN 2
          WHEN 'sysadmin' THEN 2
          WHEN 'teamlead' THEN 3
          WHEN 'employee' THEN 4
        END,
        u.username
    `)

    return orgNodes

  } catch (error) {
    console.error('Error fetching organization:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden des Organigramms'
    })
  }
})
