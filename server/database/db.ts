// server/database/db.ts
import Database from 'better-sqlite3'
import { join } from 'path'

let db: Database.Database | null = null

/**
 * Holt die Datenbank-Instanz (Singleton)
 */
export function getDb(): Database.Database {
  if (!db) {
    const dbPath = join(process.cwd(), 'server', 'database', 'sqlite.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL') // Write-Ahead Logging für bessere Concurrency
    db.pragma('foreign_keys = ON')  // Foreign Keys aktivieren
    console.log('✅ Datenbank verbunden:', dbPath)
  }
  return db
}

/**
 * Führt eine SELECT Query aus und gibt alle Zeilen zurück
 */
export function query<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb()
  try {
    const stmt = db.prepare(sql)
    return stmt.all(...params) as T[]
  } catch (error) {
    console.error('❌ Query Error:', error)
    console.error('SQL:', sql)
    console.error('Params:', params)
    throw error
  }
}

/**
 * Führt eine SELECT Query aus und gibt die erste Zeile zurück
 */
export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const db = getDb()
  try {
    const stmt = db.prepare(sql)
    return (stmt.get(...params) as T) || null
  } catch (error) {
    console.error('❌ QueryOne Error:', error)
    console.error('SQL:', sql)
    console.error('Params:', params)
    throw error
  }
}

/**
 * Führt eine INSERT/UPDATE/DELETE Query aus
 */
export function run(sql: string, params: any[] = []): Database.RunResult {
  const db = getDb()
  try {
    const stmt = db.prepare(sql)
    return stmt.run(...params)
  } catch (error) {
    console.error('❌ Run Error:', error)
    console.error('SQL:', sql)
    console.error('Params:', params)
    throw error
  }
}

/**
 * Alias für run() - für Kompatibilität
 */
export const execute = run

/**
 * Führt mehrere Statements in einer Transaktion aus
 */
export function transaction(fn: () => void): void {
  const db = getDb()
  const trans = db.transaction(fn)
  trans()
}

/**
 * Schließt die Datenbank-Verbindung
 */
export function closeDb(): void {
  if (db) {
    db.close()
    db = null
    console.log('✅ Datenbank geschlossen')
  }
}
