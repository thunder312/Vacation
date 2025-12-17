// server/api/organization/[userId].patch.ts
import { execute } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')
    const body = await readBody(event)
    const { teamId, managerId } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'UserId erforderlich'
      })
    }

    // Update Organization
    execute(`
      UPDATE organization 
      SET teamId = ?, 
          managerId = ?,
          updatedAt = datetime('now')
      WHERE userId = ?
    `, [teamId || null, managerId || null, userId])

    return { success: true }

  } catch (error) {
    console.error('Error updating organization:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Aktualisieren der Zuordnung'
    })
  }
})
