// server/api/carryover/adjust.post.ts
import { query } from '../../database/db'
import { icons } from '../../../app/config/icons'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, year, originalDays, approvedDays, reason, adjustedBy } = body

  if (!reason || reason.trim() === '') {
    throw createError({
      statusCode: 400,
      message: 'Begründung ist erforderlich'
    })
  }

  try {
    // Speichere angepassten Übertrag in carryover Tabelle
    query(`
      INSERT INTO carryover 
        (userId, year, carryoverDays, createdAt, updatedAt)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(userId, year) 
      DO UPDATE SET 
        carryoverDays = ?,
        updatedAt = datetime('now')
    `, [userId, year, approvedDays, approvedDays])

    // WICHTIG: Begründung kann nicht in DB gespeichert werden!
    // Das aktuelle Schema hat keine Felder für: adjustmentReason, adjustedBy, status
    console.warn(`⚠️ Carryover angepasst für ${userId}: ${originalDays} → ${approvedDays} Tage`)
    console.warn(`   Begründung (NUR GELOGGT): ${reason}`)
    console.warn(`   Angepasst von: ${adjustedBy}`)
    console.warn(`   ⚠️ Schema-Limitation: Begründung wird nicht in DB gespeichert!`)

    return { 
      success: true,
      userId,
      year,
      originalDays,
      approvedDays,
      reduction: originalDays - approvedDays,
      warning: 'Begründung wurde geloggt, aber nicht in DB gespeichert (Schema hat kein adjustmentReason Feld)'
    }

  } catch (error: any) {
    console.error(icons.ui.error + ' ERROR in POST /api/carryover/adjust:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Anpassen des Übertrags: ' + error.message
    })
  }
})
