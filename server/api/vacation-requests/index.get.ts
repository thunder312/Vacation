// server/api/vacation-requests/index.get.ts
import { query } from '../../database/db'

interface VacationRequest {
  id: number
  userId: string
  displayName: string
  startDate: string
  endDate: string
  reason: string | null
  status: string
  teamleadApprovalDate: string | null
  managerApprovalDate: string | null
  createdAt: string
}

export default defineEventHandler(async (event) => {
  try {
    const requests = query<VacationRequest>('SELECT * FROM vacation_requests ORDER BY createdAt DESC')
    
    return requests
  } catch (error) {
    console.error('Error fetching vacation requests:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Urlaubsanträge'
    })
  }
})
