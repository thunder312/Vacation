// server/api/carryover/index.post.ts
import { execute, queryOne } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, year, carryoverDays, expiryDate } = body

    if (!userId || !year || carryoverDays === undefined) {
      throw createError({
        statusCode: 400,
        message: 'Fehlende Pflichtfelder'
      })
    }

    // Prüfen ob bereits vorhanden
    const existing = queryOne(
      'SELECT * FROM carryover WHERE userId = ? AND year = ?',
      [userId, year]
    )

    if (existing) {
      // Update
      execute(`
        UPDATE carryover 
        SET carryoverDays = ?, expiryDate = ?, updatedAt = datetime('now')
        WHERE userId = ? AND year = ?
      `, [carryoverDays, expiryDate || null, userId, year])

      return { id: (existing as any).id, userId, year, carryoverDays, expiryDate, updated: true }
    } else {
      // Insert
      const result = execute(`
        INSERT INTO carryover (userId, year, carryoverDays, expiryDate)
        VALUES (?, ?, ?, ?)
      `, [userId, year, carryoverDays, expiryDate || null])

      return { id: result.lastInsertRowid, userId, year, carryoverDays, expiryDate, updated: false }
    }

  } catch (error) {
    console.error('Error creating/updating carryover:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Speichern der Übertragstage'
    })
  }
})
