// server/database/db.ts
import Database from 'better-sqlite3'
import { join } from 'path'

let db: Database.Database | null = null

/**
 * Initialisiert und gibt die SQLite-Datenbank zurück
 * Singleton-Pattern: Nur eine Verbindung wird erstellt
 */
export function getDb(): Database.Database {
  if (db) {
    return db
  }

  // Datenbank-Pfad: server/database/sqlite.db
  const dbPath = join(process.cwd(), 'server', 'database', 'sqlite.db')
  
  // Datenbank öffnen/erstellen
  db = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
  })

  // WAL-Modus für bessere Concurrency
  db.pragma('journal_mode = WAL')
  
  // Foreign Keys aktivieren
  db.pragma('foreign_keys = ON')

  console.log('✅ SQLite Datenbank verbunden:', dbPath)

  return db
}

/**
 * Schließt die Datenbank-Verbindung
 * (für graceful shutdown)
 */
export function closeDb(): void {
  if (db) {
    db.close()
    db = null
    console.log('🔒 SQLite Datenbank geschlossen')
  }
}

/**
 * Führt eine Query aus und gibt die Ergebnisse zurück
 */
export function query<T = any>(sql: string, params?: any[]): T[] {
  const database = getDb()
  const stmt = database.prepare(sql)
  return stmt.all(params) as T[]
}

/**
 * Führt eine Query aus und gibt das erste Ergebnis zurück
 */
export function queryOne<T = any>(sql: string, params?: any[]): T | undefined {
  const database = getDb()
  const stmt = database.prepare(sql)
  return stmt.get(params) as T | undefined
}

/**
 * Führt eine INSERT/UPDATE/DELETE Query aus
 */
export function execute(sql: string, params?: any[]): Database.RunResult {
  const database = getDb()
  const stmt = database.prepare(sql)
  return stmt.run(params)
}

/**
 * Führt mehrere Queries in einer Transaktion aus
 */
export function transaction<T>(fn: () => T): T {
  const database = getDb()
  const txn = database.transaction(fn)
  return txn()
}

// Graceful shutdown bei Prozess-Ende
process.on('exit', () => closeDb())
process.on('SIGINT', () => {
  closeDb()
  process.exit(0)
})
