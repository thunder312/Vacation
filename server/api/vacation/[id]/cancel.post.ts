// server/api/vacation/[id]/cancel.post.ts
import { execute, queryOne } from '../../../database/db'
import { icons } from '../../../../app/config/icons'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { cancellationReason } = body

    console.log('🚫 Cancel vacation request:', id)

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Request ID erforderlich'
      })
    }

    // Hole den Urlaubsantrag
    const request = queryOne<any>(
      'SELECT * FROM vacation_requests WHERE id = ?',
      [id]
    )

    if (!request) {
      throw createError({
        statusCode: 404,
        message: 'Urlaubsantrag nicht gefunden'
      })
    }

    // Nur genehmigte Urlaube können abgesagt werden
    if (request.status !== 'approved') {
      throw createError({
        statusCode: 400,
        message: 'Nur genehmigte Urlaube können abgesagt werden'
      })
    }

    console.log(icons.actions.approve + ' Request found:', request.userId, request.startDate, '-', request.endDate)

    // Berechne Urlaubstage (Arbeitstage zwischen Start und Ende)
    const calculateWorkdays = (start: string, end: string): number => {
      const startDate = new Date(start)
      const endDate = new Date(end)
      let workdays = 0
      
      const current = new Date(startDate)
      while (current <= endDate) {
        const day = current.getDay()
        // Montag (1) bis Freitag (5)
        if (day >= 1 && day <= 5) {
          workdays++
        }
        current.setDate(current.getDate() + 1)
      }
      
      return workdays
    }

    const daysToRefund = calculateWorkdays(request.startDate, request.endDate)
    console.log(`Days to refund: ${daysToRefund}`)

    // Grund für Absage hinzufügen (an bestehenden Grund anhängen)
    const updatedReason = cancellationReason 
      ? `${request.reason}\n\n[ABGESAGT] ${cancellationReason}`
      : `${request.reason}\n\n[ABGESAGT]`

    // Status auf 'cancelled' setzen und Grund aktualisieren
    execute(`
      UPDATE vacation_requests 
      SET status = 'cancelled',
          reason = ?,
          updatedAt = datetime('now')
      WHERE id = ?
    `, [updatedReason, id])

    console.log(icons.actions.approve + ' Request cancelled')

    // Urlaubstage zurückbuchen
    // Hole aktuelles Guthaben
    const user = queryOne<any>(
      'SELECT vacationDays FROM users WHERE username = ?',
      [request.userId]
    )

    if (user) {
      // Prüfe ob es einen Carryover für dieses Jahr gibt
      const currentYear = new Date().getFullYear()
      const carryover = queryOne<any>(
        'SELECT * FROM carryover WHERE userId = ? AND year = ?',
        [request.userId, currentYear]
      )

      if (carryover) {
        // Update Carryover
        execute(`
          UPDATE carryover
          SET carryoverDays = carryoverDays + ?
          WHERE userId = ? AND year = ?
        `, [daysToRefund, request.userId, currentYear])
        console.log(icons.actions.approve + ` Carryover updated: +${daysToRefund} days`)
      }
      // Wenn kein Carryover existiert, werden die Tage automatisch im nächsten Jahr verfügbar
    }

    console.log(icons.actions.activate + ' acation cancelled successfully')

    return {
      success: true,
      message: ` t('vacation.requestCancelled'). ${daysToRefund} Tage zurückgebucht.`,
      daysRefunded: daysToRefund
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error(icons.ui.error + ' Error cancelling vacation:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Absagen des Urlaubs'
    })
  }
})
