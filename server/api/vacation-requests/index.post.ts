// server/api/vacation-requests/index.post.ts
import { execute } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, displayName, startDate, endDate, reason } = body

    // Validierung
    if (!userId || !displayName || !startDate || !endDate) {
      throw createError({
        statusCode: 400,
        message: 'Fehlende Pflichtfelder'
      })
    }

    // Antrag erstellen
    const result = execute(`
      INSERT INTO vacation_requests (userId, displayName, startDate, endDate, reason, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `, [userId, displayName, startDate, endDate, reason || null])

    return {
      id: result.lastInsertRowid,
      userId,
      displayName,
      startDate,
      endDate,
      reason,
      status: 'pending',
      teamleadApprovalDate: null,
      managerApprovalDate: null
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error creating vacation request:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Erstellen des Urlaubsantrags'
    })
  }
})
