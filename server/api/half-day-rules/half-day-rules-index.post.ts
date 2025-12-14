// server/api/half-day-rules/index.post.ts
import { execute } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { date, description, createdBy } = body

    if (!date || !description || !createdBy) {
      throw createError({
        statusCode: 400,
        message: 'Fehlende Pflichtfelder'
      })
    }

    const result = execute(`
      INSERT INTO half_day_rules (date, description, createdBy)
      VALUES (?, ?, ?)
    `, [date, description, createdBy])

    return {
      id: result.lastInsertRowid,
      date,
      description,
      createdBy
    }

  } catch (error: any) {
    // SQLite UNIQUE constraint Fehler
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw createError({
        statusCode: 409,
        message: 'Für dieses Datum existiert bereits eine Regelung'
      })
    }
    
    console.error('Error creating half day rule:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Erstellen der Halbtags-Regelung'
    })
  }
})
