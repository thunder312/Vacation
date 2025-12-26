// server/api/vacation/on-date.get.ts
import { query } from '../../database/db'
import { icons } from '../../../app/config/icons'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const date = queryParams.date as string

  if (!date) {
    throw createError({
      statusCode: 400,
      message: 'Datum erforderlich'
    })
  }

  try {
    // Finde alle genehmigten Urlaubsanträge die dieses Datum enthalten
    const vacations = query<any>(`
      SELECT 
        vr.id,
        vr.userId,
        vr.displayName,
        vr.startDate,
        vr.endDate,
        vr.reason,
        u.username,
        u.firstName,
        u.lastName,
        julianday(vr.endDate) - julianday(vr.startDate) + 1 as totalDays
      FROM vacation_requests vr
      JOIN users u ON vr.userId = u.username
      WHERE vr.status IN ('approved', 'teamlead_approved')
        AND date(?) BETWEEN date(vr.startDate) AND date(vr.endDate)
      ORDER BY vr.displayName
    `, [date])

    console.log(icons.actions.activate + ' Found ${vacations.length} employees on vacation on ${date}')
    return vacations

  } catch (error: any) {
    console.error(icons.ui.error + ' ERROR in GET /api/vacation/on-date:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden: ' + error.message
    })
  }
})
