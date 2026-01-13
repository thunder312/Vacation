// server/api/carryover/index.get.ts
import { query } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    // Hole alle Carryover-Einträge und mappe auf das erwartete Format
    const carryovers = query<any>(`
      SELECT
        id,
        userId,
        year,
        COALESCE(approvedDays, calculatedDays) as carryoverDays,
        NULL as expiryDate
      FROM carryover
      WHERE status = 'approved'
    `)

    return carryovers || []
  } catch (error: any) {
    console.error('ERROR in GET /api/carryover:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Carryover-Daten: ' + error.message
    })
  }
})
