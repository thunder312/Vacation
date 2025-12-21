// server/api/carryover/review.get.ts
import Database from 'better-sqlite3'
import { join } from 'path'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const year = parseInt(query.year as string) || new Date().getFullYear()

  try {
    // Finde Projekt-Root (2 Ebenen über .nuxt/dev)
    const projectRoot = process.cwd().includes('.nuxt') 
      ? join(process.cwd(), '..', '..')
      : process.cwd()
    
    const dbPath = join(projectRoot, 'sqlite.db')
    console.log('📂 Loading DB from:', dbPath)
    
    const db = new Database(dbPath)

    // Prüfe ob Tabelle existiert
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='carryover_adjustments'
    `).get()

    let carryovers: any[] = []

    if (!tableExists) {
      // Wenn Tabelle nicht existiert, nur berechnete Überträge zurückgeben
      console.warn('⚠️ Tabelle carryover_adjustments existiert nicht. Nur berechnete Überträge werden angezeigt.')
      
      carryovers = db.prepare(`
        SELECT 
          u.userId,
          u.displayName,
          u.vacationDaysPerYear,
          
          COALESCE(
            (u.vacationDaysPerYear + COALESCE(u.carryoverDays, 0)) - 
            (SELECT COALESCE(SUM(days), 0) 
             FROM vacation_requests 
             WHERE userId = u.userId 
               AND status = 'approved'
               AND strftime('%Y', startDate) = ?),
            0
          ) as originalDays
          
        FROM users u
        WHERE u.isActive = 1
          AND u.role IN ('employee', 'teamlead')
        ORDER BY u.displayName
      `).all((year - 1).toString()) as any[]

      // Alle als pending markieren
      carryovers = carryovers.map(c => ({
        ...c,
        approvedDays: c.originalDays,
        status: 'pending',
        adjustmentReason: null,
        adjustedBy: null,
        adjustedAt: null,
        approvedBy: null,
        approvedAt: null
      }))

    } else {
      // Normale Abfrage mit JOIN
      carryovers = db.prepare(`
        SELECT 
          u.userId,
          u.displayName,
          u.vacationDaysPerYear,
          
          COALESCE(
            (u.vacationDaysPerYear + COALESCE(u.carryoverDays, 0)) - 
            (SELECT COALESCE(SUM(days), 0) 
             FROM vacation_requests 
             WHERE userId = u.userId 
               AND status = 'approved'
               AND strftime('%Y', startDate) = ?),
            0
          ) as originalDays,
          
          ca.approvedDays,
          ca.status,
          ca.adjustmentReason,
          ca.adjustedBy,
          ca.adjustedAt,
          ca.approvedBy,
          ca.approvedAt
          
        FROM users u
        LEFT JOIN carryover_adjustments ca 
          ON u.userId = ca.userId AND ca.year = ?
        WHERE u.isActive = 1
          AND u.role IN ('employee', 'teamlead')
        ORDER BY u.displayName
      `).all((year - 1).toString(), year) as any[]

      // Wenn keine Adjustments existieren, Status = pending
      carryovers = carryovers.map(c => ({
        ...c,
        status: c.status || 'pending',
        approvedDays: c.approvedDays ?? c.originalDays
      }))
    }

    db.close()
    return carryovers

  } catch (error) {
    const err = error as Error
    console.error('❌ Fehler beim Laden der Carryovers:', err.message)
    console.error('Stack:', err.stack)
    console.error('Error Type:', err.constructor.name)
    
    // Bei DB-Fehlern detaillierte Info
    if (err.message.includes('no such table') || err.message.includes('no such column')) {
      console.error('💡 Tipp: Überprüfe ob vacation.db im richtigen Verzeichnis liegt')
      console.error('💡 Erwarteter Pfad:', join(process.cwd(), 'vacation.db'))
    }
    
    throw createError({
      statusCode: 500,
      message: `Carryover Load Error: ${err.message}`
    })
  }
})
