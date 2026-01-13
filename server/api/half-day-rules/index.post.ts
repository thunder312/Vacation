// server/api/half-day-rules/index.post.ts
import { execute } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { date, description } = body

    if (!date || !description) {
      throw createError({
        statusCode: 400,
        message: 'Fehlende Pflichtfelder'
      })
    }

    const result = execute(`
      INSERT INTO half_day_rules (date, description)
      VALUES (?, ?)
    `, [date, description])

    return {
      id: result.lastInsertRowid,
      date,
      description
    }

  } catch (error: any) {
    // SQLite UNIQUE constraint Fehler
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw createError({
        statusCode: 409,
        message: 'Für dieses Datum existiert bereits eine Regelung'
      })
    }
    
    console.error('Error creating half day rule:', error.message || error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Erstellen der Halbtags-Regelung'
    })
  }
})
