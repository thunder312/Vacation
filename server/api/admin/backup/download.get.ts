// server/api/admin/backup/download.get.ts
import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  if (!user || user.role !== 'administrator') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Nur Administrator darf Backups herunterladen'
    })
  }
  
  try {
    const timestamp = new Date().toISOString()
    let sql = `-- Vacation System Database Backup
-- Created: ${timestamp}
-- 
-- RESTORE INSTRUCTIONS:
-- 1. Stop the application
-- 2. Delete or rename the old sqlite.db
-- 3. Run: sqlite3 server/database/sqlite.db < backup.sql
-- 4. Start the application
--

-- Disable foreign keys during restore
PRAGMA foreign_keys=OFF;

BEGIN TRANSACTION;

`

    // Users
    const users = db.prepare('SELECT * FROM users').all()
    if (users.length > 0) {
      sql += `\n-- Users Table\n`
      sql += `DELETE FROM users;\n`
      for (const user of users as any[]) {
        const values = [
          user.id,
          escapeSQL(user.username),
          escapeSQL(user.password),
          escapeSQL(user.firstName),
          escapeSQL(user.lastName),
          escapeSQL(user.role),
          user.vacationDays,
          user.isActive,
          escapeSQL(user.createdAt),
          user.updatedAt ? escapeSQL(user.updatedAt) : 'NULL'
        ]
        sql += `INSERT INTO users (id, username, password, firstName, lastName, role, vacationDays, isActive, createdAt, updatedAt) VALUES (${values.join(', ')});\n`
      }
    }

    // Vacation Requests
    const requests = db.prepare('SELECT * FROM vacation_requests').all()
    if (requests.length > 0) {
      sql += `\n-- Vacation Requests Table\n`
      sql += `DELETE FROM vacation_requests;\n`
      for (const req of requests as any[]) {
        const values = [
          req.id,
          escapeSQL(req.userId),
          escapeSQL(req.displayName),
          escapeSQL(req.startDate),
          escapeSQL(req.endDate),
          req.reason ? escapeSQL(req.reason) : 'NULL',
          escapeSQL(req.status),
          req.cancelReason ? escapeSQL(req.cancelReason) : 'NULL',
          escapeSQL(req.createdAt)
        ]
        sql += `INSERT INTO vacation_requests (id, userId, displayName, startDate, endDate, reason, status, cancelReason, createdAt) VALUES (${values.join(', ')});\n`
      }
    }

    // Organization
    const org = db.prepare('SELECT * FROM organization').all()
    if (org.length > 0) {
      sql += `\n-- Organization Table\n`
      sql += `DELETE FROM organization;\n`
      for (const o of org as any[]) {
        const values = [
          o.id,
          escapeSQL(o.userId),
          o.teamleadId ? escapeSQL(o.teamleadId) : 'NULL',
          escapeSQL(o.createdAt)
        ]
        sql += `INSERT INTO organization (id, userId, teamleadId, createdAt) VALUES (${values.join(', ')});\n`
      }
    }

    // Carryover
    const carryover = db.prepare('SELECT * FROM carryover').all()
    if (carryover.length > 0) {
      sql += `\n-- Carryover Table\n`
      sql += `DELETE FROM carryover;\n`
      for (const c of carryover as any[]) {
        const values = [
          c.id,
          escapeSQL(c.userId),
          c.year,
          c.calculatedDays,
          c.approvedDays !== null ? c.approvedDays : 'NULL',
          c.reason ? escapeSQL(c.reason) : 'NULL',
          escapeSQL(c.status),
          escapeSQL(c.createdAt)
        ]
        sql += `INSERT INTO carryover (id, userId, year, calculatedDays, approvedDays, reason, status, createdAt) VALUES (${values.join(', ')});\n`
      }
    }

    // Half Day Rules
    const rules = db.prepare('SELECT * FROM half_day_rules').all()
    if (rules.length > 0) {
      sql += `\n-- Half Day Rules Table\n`
      sql += `DELETE FROM half_day_rules;\n`
      for (const r of rules as any[]) {
        const values = [
          r.id,
          escapeSQL(r.date),
          escapeSQL(r.description),
          escapeSQL(r.createdAt)
        ]
        sql += `INSERT INTO half_day_rules (id, date, description, createdAt) VALUES (${values.join(', ')});\n`
      }
    }

    sql += `\nCOMMIT;

-- Re-enable foreign keys
PRAGMA foreign_keys=ON;

-- Vacuum to optimize database
VACUUM;
`

    setHeader(event, 'Content-Type', 'application/sql')
    setHeader(event, 'Content-Disposition', `attachment; filename="vacation-backup-${new Date().toISOString().split('T')[0]}.sql"`)
    
    return sql
  } catch (error: any) {
    console.error('Download Fehler:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Download des Backups'
    })
  }
})

// Helper function to escape SQL strings
function escapeSQL(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  if (typeof value === 'number') {
    return value.toString()
  }
  // Escape single quotes by doubling them
  return `'${String(value).replace(/'/g, "''")}'`
}
