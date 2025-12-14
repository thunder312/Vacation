// server/api/half-day-rules/index.get.ts
import { query } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const rules = query('SELECT * FROM half_day_rules ORDER BY date')
    return rules
  } catch (error) {
    console.error('Error fetching half day rules:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Halbtags-Regelungen'
    })
  }
})
