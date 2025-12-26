// server/api/vacation/cancel-days.post.ts
import { query, run } from '../../database/db'
import { icons } from '../../../app/config/icons'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { date, userIds, daysToCancel, description } = body

  // Validierung
  if (!date || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Ungültige Parameter'
    })
  }

  if (!daysToCancel || daysToCancel <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Anzahl Tage muss größer als 0 sein'
    })
  }

  if (!description || description.trim() === '') {
    throw createError({
      statusCode: 400,
      message: 'Beschreibung ist erforderlich'
    })
  }

  try {
    let affectedRequests = 0

    for (const userId of userIds) {
      // Finde Urlaubsantrag der dieses Datum enthält
      const vacation = query<any>(`
        SELECT 
          id,
          userId,
          displayName,
          startDate,
          endDate,
          reason,
          status
        FROM vacation_requests
        WHERE userId = ?
          AND status IN ('approved', 'teamlead_approved')
          AND date(?) BETWEEN date(startDate) AND date(endDate)
        LIMIT 1
      `, [userId, date])

      if (!vacation || vacation.length === 0) {
        console.warn(`⚠️ Kein Urlaub gefunden für ${userId} am ${date}`)
        continue
      }

      const request = vacation[0]
      const startDate = new Date(request.startDate)
      const endDate = new Date(request.endDate)
      const cancelDate = new Date(date)

      // Berechne wie viele Tage der Urlaub insgesamt hat
      const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // Fall 1: Rückbuchung deckt den GESAMTEN Urlaub ab oder mehr
      if (daysToCancel >= totalDays) {
        // Markiere als "cancelled" mit Grund
        run(`
          UPDATE vacation_requests
          SET 
            status = 'cancelled',
            reason = ?
          WHERE id = ?
        `, [`[Admin-Rückbuchung] ${description}`, request.id])

        console.log(icons.actions.activate + ' Cancelled complete vacation for ${userId} (${totalDays} days)')
        affectedRequests++
        continue
      }

      // Fall 2: Rückbuchung am ERSTEN Tag
      if (cancelDate.getTime() === startDate.getTime()) {
        // Verschiebe Startdatum nach vorne
        const newStartDate = new Date(startDate)
        newStartDate.setDate(newStartDate.getDate() + Math.ceil(daysToCancel))

        run(`
          UPDATE vacation_requests
          SET 
            startDate = ?,
            reason = ?
          WHERE id = ?
        `, [
          newStartDate.toISOString().split('T')[0],
          `${request.reason || ''}\n[Manager: ${daysToCancel} Tag(e) gekürzt - ${description}]`,
          request.id
        ])

        console.log(icons.actions.activate + ' hortened vacation start for ${userId}')
        affectedRequests++
        continue
      }

      // Fall 3: Rückbuchung am LETZTEN Tag
      if (cancelDate.getTime() === endDate.getTime()) {
        // Verschiebe Enddatum nach hinten
        const newEndDate = new Date(endDate)
        newEndDate.setDate(newEndDate.getDate() - Math.ceil(daysToCancel))

        run(`
          UPDATE vacation_requests
          SET 
            endDate = ?,
            reason = ?
          WHERE id = ?
        `, [
          newEndDate.toISOString().split('T')[0],
          `${request.reason || ''}\n[Manager: ${daysToCancel} Tag(e) gekürzt - ${description}]`,
          request.id
        ])

        console.log(icons.actions.activate + ' Shortened vacation end for ${userId}')
        affectedRequests++
        continue
      }

      // Fall 4: Rückbuchung MITTENDRIN → Urlaub AUFTEILEN
      // Teil 1: Von Start bis Tag-vor-Rückbuchung
      const part1End = new Date(cancelDate)
      part1End.setDate(part1End.getDate() - 1)

      // Update existing request to be Part 1
      run(`
        UPDATE vacation_requests
        SET 
          endDate = ?,
          reason = ?
        WHERE id = ?
      `, [
        part1End.toISOString().split('T')[0],
        `${request.reason || ''}\n[Manager: Aufgeteilt - ${description}]`,
        request.id
      ])

      // Teil 2: Von Tag-nach-Rückbuchung bis Ende
      const part2Start = new Date(cancelDate)
      part2Start.setDate(part2Start.getDate() + Math.ceil(daysToCancel))

      // Nur Teil 2 erstellen wenn noch Tage übrig sind
      if (part2Start <= endDate) {
        run(`
          INSERT INTO vacation_requests 
            (userId, displayName, startDate, endDate, reason, status, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `, [
          request.userId,
          request.displayName,
          part2Start.toISOString().split('T')[0],
          request.endDate,
          `${request.reason || ''}\n[Manager: Aufgeteilt (Teil 2) - ${description}]`,
          request.status
        ])
      }

      console.log(icons.actions.activate + ' Split vacation for ${userId} into 2 parts')
      affectedRequests++
    }

    console.log(icons.actions.activate + ' Successfully cancelled days for ${affectedRequests}/${userIds.length} employees')

    return {
      success: true,
      affectedRequests,
      totalEmployees: userIds.length
    }

  } catch (error: any) {
    console.error(icons.ui.error + ' ERROR in POST /api/vacation/cancel-days:', error)
    console.error(icons.ui.error + ' Error message:', error.message)
    console.error(icons.ui.error + ' Error stack:', error.stack)
    console.error(icons.ui.error + ' Request data:', { date, userIds, daysToCancel, description })
    
    throw createError({
      statusCode: 500,
      message: 'Fehler bei der Rückbuchung: ' + error.message
    })
  }
})
