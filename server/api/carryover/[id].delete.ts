// server/api/carryover/[id].delete.ts
import { execute } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID erforderlich'
      })
    }

    execute('DELETE FROM carryover WHERE id = ?', [id])

    return { success: true }

  } catch (error) {
    console.error('Error deleting carryover:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Löschen der Übertragstage'
    })
  }
})
