// server/api/vacation-exceptions/index.post.ts
import { db } from '../../utils/db'

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
    // Prüfe ob vacation request existiert
    const vacation = db.prepare(`
      SELECT id FROM vacation_requests 
      WHERE id = ? AND userId = ? AND status = 'approved'
    `).get(vacationRequestId, userId)

    if (!vacation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Urlaubsantrag nicht gefunden oder nicht genehmigt'
      })
    }

    // Prüfe ob Exception bereits existiert
    const existing = db.prepare(`
      SELECT id FROM vacation_exceptions 
      WHERE vacationRequestId = ? AND date = ?
    `).get(vacationRequestId, date)

    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Exception für dieses Datum existiert bereits'
      })
    }

    // Erstelle Exception
    const result = db.prepare(`
      INSERT INTO vacation_exceptions 
      (vacationRequestId, userId, date, deduction, reason, createdBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(vacationRequestId, userId, date, deduction, reason, createdBy || 'admin')

    const newException = db.prepare(`
      SELECT * FROM vacation_exceptions WHERE id = ?
    `).get(result.lastInsertRowid)

    console.log(`✓ Exception created: ${userId} on ${date} (-${deduction} days)`)

    return newException

  } catch (error: any) {
    console.error('❌ ERROR in POST /api/vacation-exceptions:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Fehler beim Erstellen der Exception: ' + error.message
    })
  }
})
