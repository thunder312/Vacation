// server/api/vacation-exceptions/index.post.ts
import { db } from '../../utils/db'

/**
 * Creates exception records for consecutive days
 * For deduction >= 1, splits into multiple single-day records
 * For deduction 0.5-1, creates single record
 */
function createMultiDayException(
  vacationRequestId: number,
  userId: string,
  startDate: string,
  totalDeduction: number,
  reason: string,
  createdBy: string
) {
  const records = []
  const date = new Date(startDate)
  let remainingDeduction = totalDeduction

  while (remainingDeduction > 0) {
    const currentDeduction = Math.min(remainingDeduction, 1)
    const dateStr = date.toISOString().split('T')[0]

    // Check if exception already exists
    const existing = db.prepare(`
      SELECT id FROM vacation_exceptions
      WHERE vacationRequestId = ? AND date = ?
    `).get(vacationRequestId, dateStr)

    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: `Exception für ${dateStr} existiert bereits`
      })
    }

    // Create record
    const result = db.prepare(`
      INSERT INTO vacation_exceptions
      (vacationRequestId, userId, date, deduction, reason, createdBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(vacationRequestId, userId, dateStr, currentDeduction, reason, createdBy)

    records.push({
      id: result.lastInsertRowid,
      date: dateStr,
      deduction: currentDeduction
    })

    remainingDeduction -= currentDeduction

    // Move to next day
    date.setDate(date.getDate() + 1)
  }

  return records
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { vacationRequestId, userId, date, deduction, reason, createdBy } = body

  // Validierung
  if (!vacationRequestId || !userId || !date || deduction === undefined || !reason) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Fehlende Pflichtfelder'
    })
  }

  if (deduction <= 0 || deduction > 3) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Deduction muss zwischen 0 und 3 liegen'
    })
  }

  try {
    // Prüfe ob vacation request existiert (FIXED: accept both statuses)
    const vacation = db.prepare(`
      SELECT id FROM vacation_requests
      WHERE id = ? AND userId = ? AND status IN ('approved', 'teamlead_approved')
    `).get(vacationRequestId, userId)

    if (!vacation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Urlaubsantrag nicht gefunden oder nicht genehmigt'
      })
    }

    // Use transaction for multi-day creation (ensures atomicity)
    const createExceptions = db.transaction(() => {
      return createMultiDayException(
        vacationRequestId,
        userId,
        date,
        deduction,
        reason,
        createdBy || 'admin'
      )
    })

    const records = createExceptions()

    console.log(`✓ Created ${records.length} exception(s) for ${userId}:`,
                records.map(r => `${r.date}(-${r.deduction})`).join(', '))

    return {
      success: true,
      records: records,
      totalRecords: records.length,
      message: `${records.length} Exception(s) erfolgreich erstellt`
    }

  } catch (error: any) {
    console.error('❌ ERROR in POST /api/vacation-exceptions:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Fehler beim Erstellen der Exception: ' + error.message
    })
  }
})
