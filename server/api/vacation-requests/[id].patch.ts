// server/api/vacation-requests/[id].patch.ts
import { execute, queryOne } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { action, level } = body

    if (!id || !action) {
      throw createError({
        statusCode: 400,
        message: 'ID und Action erforderlich'
      })
    }

    // Aktuellen Request holen
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

    if (action === 'approve') {
      if (level === 'teamlead') {
        // Teamleiter-Genehmigung
        execute(`
          UPDATE vacation_requests 
          SET status = 'teamlead_approved', 
              teamleadApprovalDate = datetime('now'),
              updatedAt = datetime('now')
          WHERE id = ?
        `, [id])

        return { success: true, status: 'teamlead_approved' }

      } else if (level === 'manager') {
        // Manager-Genehmigung (finale)
        // Wenn der Request noch 'pending' ist (z.B. Office-User), 
        // setze auch teamleadApprovalDate = managerApprovalDate
        if (request.status === 'pending') {
          execute(`
            UPDATE vacation_requests 
            SET status = 'approved', 
                teamleadApprovalDate = datetime('now'),
                managerApprovalDate = datetime('now'),
                updatedAt = datetime('now')
            WHERE id = ?
          `, [id])
        } else {
          // Normal: war schon teamlead_approved
          execute(`
            UPDATE vacation_requests 
            SET status = 'approved', 
                managerApprovalDate = datetime('now'),
                updatedAt = datetime('now')
            WHERE id = ?
          `, [id])
        }

        return { success: true, status: 'approved' }
      }

    } else if (action === 'reject') {
      // Ablehnen
      execute(`
        UPDATE vacation_requests 
        SET status = 'rejected',
            updatedAt = datetime('now')
        WHERE id = ?
      `, [id])

      return { success: true, status: 'rejected' }
    }

    throw createError({
      statusCode: 400,
      message: 'Ungültige Action'
    })

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error updating vacation request:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Aktualisieren des Urlaubsantrags'
    })
  }
})
