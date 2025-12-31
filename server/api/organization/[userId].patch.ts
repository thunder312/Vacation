// server/api/organization/[userId].patch.ts
import { execute } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')
    const body = await readBody(event)
    const { teamleadId } = body

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'UserId erforderlich'
      })
    }

    // Update Organization
    execute(`
      UPDATE organization 
      SET teamleadId = ?
      WHERE userId = ?
    `, [teamleadId || null, userId])

    return { success: true }

  } catch (error: any) {
    console.error('Error updating organization:', error.message || error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Aktualisieren der Zuordnung'
    })
  }
})
