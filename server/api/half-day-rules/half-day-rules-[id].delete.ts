// server/api/half-day-rules/[id].delete.ts
import { execute } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID erforderlich'
      })
    }

    execute('DELETE FROM half_day_rules WHERE id = ?', [id])

    return { success: true }

  } catch (error) {
    console.error('Error deleting half day rule:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Löschen der Halbtags-Regelung'
    })
  }
})
