// server/database/db.ts
// COMPATIBILITY WRAPPER - Leitet alte API auf neue DB um
import { db } from '../utils/db'
import type Database from 'better-sqlite3'

/**
 * Holt die Datenbank-Instanz (Singleton)
 * @deprecated Use `import { db } from '~/server/utils/db'` instead
 */
export function getDb(): Database.Database {
  return db
}

/**
 * Führt eine SELECT Query aus und gibt alle Zeilen zurück
 * @deprecated Use `db.prepare(sql).all(...params)` instead
 */
export function query<T = any>(sql: string, params: any[] = []): T[] {
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
 * @deprecated Use `db.prepare(sql).get(...params)` instead
 */
export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
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
 * @deprecated Use `db.prepare(sql).run(...params)` instead
 */
export function run(sql: string, params: any[] = []): Database.RunResult {
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
 * @deprecated Use `db.prepare(sql).run(...params)` instead
 */
export const execute = run

/**
 * Führt mehrere Statements in einer Transaktion aus
 * @deprecated Use `db.transaction(fn)` instead
 */
export function transaction(fn: () => void): void {
  const trans = db.transaction(fn)
  trans()
}

/**
 * Schließt die Datenbank-Verbindung
 * @deprecated Not needed - db is managed by server/utils/db.ts
 */
export function closeDb(): void {
  console.warn('⚠️ closeDb() is deprecated - database is managed centrally')
}
