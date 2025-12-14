// server/api/carryover/index.get.ts
import { query } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  try {
    const carryovers = query('SELECT * FROM carryover ORDER BY userId, year DESC')
    return carryovers
  } catch (error) {
    console.error('Error fetching carryover:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Übertragstage'
    })
  }
})
