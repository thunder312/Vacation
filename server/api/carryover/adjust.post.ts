// server/api/carryover/adjust.post.ts
import Database from 'better-sqlite3'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, year, originalDays, approvedDays, reason, adjustedBy } = body

  if (!reason || reason.trim() === '') {
    throw createError({
      statusCode: 400,
      message: 'Begründung ist erforderlich'
    })
  }

  try {
    const projectRoot = process.cwd().includes('.nuxt') 
      ? join(process.cwd(), '..', '..')
      : process.cwd()
    const dbPath = join(projectRoot, 'sqlite.db')
    const db = new Database(dbPath)

    // Erstelle oder update Carryover Adjustment
    db.prepare(`
      INSERT INTO carryover_adjustments 
        (userId, year, originalDays, approvedDays, status, adjustmentReason, adjustedBy, adjustedAt)
      VALUES (?, ?, ?, ?, 'adjusted', ?, ?, datetime('now'))
      ON CONFLICT(userId, year) 
      DO UPDATE SET 
        originalDays = ?,
        approvedDays = ?,
        status = 'adjusted',
        adjustmentReason = ?,
        adjustedBy = ?,
        adjustedAt = datetime('now')
    `).run(
      userId, year, originalDays, approvedDays, reason, adjustedBy,
      originalDays, approvedDays, reason, adjustedBy
    )

    // Update User carryoverDays
    db.prepare(`
      UPDATE users 
      SET carryoverDays = ?
      WHERE userId = ?
    `).run(approvedDays, userId)

    db.close()

    return { 
      success: true,
      userId,
      originalDays,
      approvedDays,
      reduction: originalDays - approvedDays
    }

  } catch (error) {
    console.error('Fehler beim Anpassen:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Anpassen des Übertrags'
    })
  }
})
