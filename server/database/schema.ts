// server/database/schema.ts
import { getDb } from './db'
import { icons } from '~/config/icons'

/**
 * Erstellt alle Datenbank-Tabellen
 */
export function initSchema(): void {
  const db = getDb()

  // 1. Users Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      firstName TEXT,
      lastName TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('employee', 'teamlead', 'manager', 'office', 'sysadmin')),
      vacationDays INTEGER DEFAULT 30,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `)

  // Indices für users
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`)

  // 2. Vacation Requests Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS vacation_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      displayName TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      reason TEXT,
      status TEXT NOT NULL CHECK(status IN ('pending', 'teamlead_approved', 'approved', 'rejected', 'cancelled')),
      teamleadApprovalDate TEXT,
      managerApprovalDate TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(username) ON DELETE CASCADE
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_vacation_userId ON vacation_requests(userId)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_vacation_status ON vacation_requests(status)`)

  // 3. Half Day Rules Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS half_day_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (createdBy) REFERENCES users(username)
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_halfday_date ON half_day_rules(date)`)

  // 4. Carryover Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS carryover (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      year INTEGER NOT NULL,
      carryoverDays REAL NOT NULL,
      expiryDate TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(userId, year),
      FOREIGN KEY (userId) REFERENCES users(username) ON DELETE CASCADE
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_carryover_userId ON carryover(userId)`)

  // 5. Organization Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS organization (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      teamId TEXT,
      managerId TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(username) ON DELETE CASCADE,
      FOREIGN KEY (teamId) REFERENCES users(username) ON DELETE SET NULL,
      FOREIGN KEY (managerId) REFERENCES users(username) ON DELETE SET NULL
    )
  `)

  console.log(icons.actions.activate + ' Datenbank-Schema initialisiert')
}

/**
 * Löscht alle Tabellen (nur für Development!)
 */
export function dropAllTables(): void {
  const db = getDb()
  
  db.exec(`DROP TABLE IF EXISTS organization`)
  db.exec(`DROP TABLE IF EXISTS carryover`)
  db.exec(`DROP TABLE IF EXISTS half_day_rules`)
  db.exec(`DROP TABLE IF EXISTS vacation_requests`)
  db.exec(`DROP TABLE IF EXISTS users`)
  
  console.log('🗑️ Alle Tabellen gelöscht')
}

/**
 * Reset: Löscht und erstellt alle Tabellen neu
 */
export function resetDatabase(): void {
  dropAllTables()
  initSchema()
  console.log('🔄 Datenbank zurückgesetzt')
}
