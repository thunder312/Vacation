// server/api/vacation-requests/index.post.ts
import { execute, queryOne } from '../../database/db'
import { icons } from '../../../app/config/icons'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log(icons.actions.search + ' POST /api/vacation-requests - Body:', body)
    
    const { userId, displayName, startDate, endDate, reason } = body
    
    console.log(icons.actions.search + ' Extracted values:', { userId, displayName, startDate, endDate, reason })

    // Validierung
    if (!userId || !displayName || !startDate || !endDate) {
      console.log(icons.ui.error + ' Validation failed:', {
        hasUserId: !!userId, 
        hasDisplayName: !!displayName, 
        hasStartDate: !!startDate, 
        hasEndDate: !!endDate 
      })
      throw createError({
        statusCode: 400,
        message: 'Fehlende Pflichtfelder'
      })
    }
    
    console.log(icons.actions.activate + ' Validation passed, checking user role...')
    
    // Prüfe Rolle des Users
    const user = queryOne<any>('SELECT role FROM users WHERE username = ?', [userId])
    const isManager = user?.role === 'manager'
    
    console.log(icons.actions.search + ' User role:', user?.role, 'isManager:', isManager)

    // Manager-Anträge sind automatisch genehmigt
    if (isManager) {
      const result = execute(`
        INSERT INTO vacation_requests (
          userId, displayName, startDate, endDate, reason, status,
          teamleadApprovalDate, managerApprovalDate
        )
        VALUES (?, ?, ?, ?, ?, 'approved', datetime('now'), datetime('now'))
      `, [userId, displayName, startDate, endDate, reason || null])
      
      console.log(icons.actions.activate + ' Manager request auto-approved, ID:', result.lastInsertRowid)

      return {
        id: result.lastInsertRowid,
        userId,
        displayName,
        startDate,
        endDate,
        reason,
        status: 'approved',
        teamleadApprovalDate: new Date().toISOString(),
        managerApprovalDate: new Date().toISOString()
      }
    }

    // Normale Anträge (Employee, Teamlead, Office)
    const result = execute(`
      INSERT INTO vacation_requests (userId, displayName, startDate, endDate, reason, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `, [userId, displayName, startDate, endDate, reason || null])
    
    console.log(icons.actions.activate + ' Insert successful, ID:', result.lastInsertRowid)

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
    console.error(icons.ui.error + ' Error creating vacation request:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Erstellen des Urlaubsantrags'
    })
  }
})
