// server/utils/db.ts
import Database from 'better-sqlite3'
import { join } from 'path'
import bcrypt from 'bcrypt'

// Datenbankpfad
const dbPath = join(process.cwd(), 'server', 'database', 'sqlite.db')

// Verbose mode nur in Development
const isDev = process.env.NODE_ENV !== 'production'

// Datenbank initialisieren
export const db = new Database(dbPath, { 
  verbose: isDev ? console.log : undefined  // Nur in Dev-Mode loggen
})

// WAL-Modus für bessere Performance
db.pragma('journal_mode = WAL')

// Tabellen erstellen falls sie nicht existieren
export const initializeDatabase = async () => {
  // Users Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      vacationDays INTEGER NOT NULL DEFAULT 30,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Vacation Requests Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS vacation_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      displayName TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      teamleadApprovalDate TEXT,
      managerApprovalDate TEXT,
      cancelReason TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(username)
    )
  `)

  // Migration: Fehlende Spalten hinzufügen für bestehende Datenbanken
  try {
    const columns = db.prepare("PRAGMA table_info(vacation_requests)").all() as { name: string }[]
    const columnNames = columns.map(c => c.name)

    if (!columnNames.includes('teamleadApprovalDate')) {
      db.exec('ALTER TABLE vacation_requests ADD COLUMN teamleadApprovalDate TEXT')
      console.log('📦 Migration: teamleadApprovalDate Spalte hinzugefügt')
    }

    if (!columnNames.includes('managerApprovalDate')) {
      db.exec('ALTER TABLE vacation_requests ADD COLUMN managerApprovalDate TEXT')
      console.log('📦 Migration: managerApprovalDate Spalte hinzugefügt')
    }
  } catch (error) {
    console.error('Migration Fehler:', error)
  }

  // Organization Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS organization (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      teamleadId TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(username),
      FOREIGN KEY (teamleadId) REFERENCES users(username)
    )
  `)

  // Carryover Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS carryover (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      year INTEGER NOT NULL,
      calculatedDays REAL NOT NULL,
      approvedDays REAL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(username),
      UNIQUE(userId, year)
    )
  `)

  // Half Day Rules Tabelle
  db.exec(`
    CREATE TABLE IF NOT EXISTS half_day_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Vacation Exceptions Tabelle (für personalisierte Rückbuchungen)
  db.exec(`
    CREATE TABLE IF NOT EXISTS vacation_exceptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vacationRequestId INTEGER NOT NULL,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      deduction REAL NOT NULL,
      reason TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vacationRequestId) REFERENCES vacation_requests(id),
      FOREIGN KEY (userId) REFERENCES users(username),
      UNIQUE(vacationRequestId, date)
    )
  `)

  if (isDev) {
    console.log('✅ Datenbank-Tabellen initialisiert')
  }

  // Admin User automatisch erstellen falls nicht vorhanden
  const adminExists = db.prepare(`
    SELECT COUNT(*) as count FROM users WHERE username = 'admin'
  `).get() as { count: number }

  if (adminExists.count === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    db.prepare(`
      INSERT INTO users (username, firstName, lastName, password, role, vacationDays, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('admin', 'Admin', 'User', hashedPassword, 'administrator', 30, 1)
    
    // Organization-Eintrag für Admin
    db.prepare(`
      INSERT INTO organization (userId, teamleadId)
      VALUES (?, ?)
    `).run('admin', null)
    
    console.log('✅ Admin User erstellt')
    console.log('   Username: admin')
    console.log('   Passwort: admin123')
  }
}

// Datenbank beim Import initialisieren
initializeDatabase()
