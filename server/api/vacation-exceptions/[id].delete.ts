// server/api/vacation-exceptions/[id].delete.ts
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID ist erforderlich'
    })
  }

  try {
    // Prüfe ob Exception existiert
    const exception = db.prepare(`
      SELECT * FROM vacation_exceptions WHERE id = ?
    `).get(id)

    if (!exception) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Exception nicht gefunden'
      })
    }

    // Lösche Exception
    db.prepare(`
      DELETE FROM vacation_exceptions WHERE id = ?
    `).run(id)

    console.log(`✓ Exception deleted: ID ${id}`)

    return { success: true, id }

  } catch (error: any) {
    console.error('❌ ERROR in DELETE /api/vacation-exceptions/[id]:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Fehler beim Löschen der Exception: ' + error.message
    })
  }
})
