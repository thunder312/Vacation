// server/utils/db.ts
import Database from 'better-sqlite3'
import { join } from 'path'

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
export const initializeDatabase = () => {
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
      cancelReason TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(username)
    )
  `)

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

  if (isDev) {
    console.log('✅ Datenbank-Tabellen initialisiert')
  }
}

// Datenbank beim Import initialisieren
initializeDatabase()
