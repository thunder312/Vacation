// server/api/carryover/test.get.ts
import Database from 'better-sqlite3'
import { join } from 'path'

export default defineEventHandler((event) => {
  try {
    // Finde Projekt-Root
    const projectRoot = process.cwd().includes('.nuxt') 
      ? join(process.cwd(), '..', '..')
      : process.cwd()
    
    const dbPath = join(projectRoot, 'vacation.db')
    
    console.log('🔍 TEST: process.cwd():', process.cwd())
    console.log('🔍 TEST: projectRoot:', projectRoot)
    console.log('🔍 TEST: dbPath:', dbPath)
    
    // Prüfe ob Datei existiert
    const fs = require('fs')
    const exists = fs.existsSync(dbPath)
    console.log('🔍 TEST: DB exists?', exists)
    
    if (!exists) {
      return {
        error: 'DB nicht gefunden',
        cwd: process.cwd(),
        projectRoot,
        dbPath,
        exists: false
      }
    }
    
    const db = new Database(dbPath)
    
    // Teste einfache Query
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table'
    `).all()
    
    console.log('🔍 TEST: Tabellen gefunden:', tables.length)
    
    const userCount = db.prepare(`SELECT COUNT(*) as count FROM users`).get()
    
    db.close()
    
    return {
      success: true,
      cwd: process.cwd(),
      projectRoot,
      dbPath,
      exists: true,
      tables: tables.map((t: any) => t.name),
      userCount: (userCount as any).count
    }
    
  } catch (error) {
    const err = error as Error
    console.error('🔍 TEST ERROR:', err.message)
    console.error('🔍 TEST STACK:', err.stack)
    
    return {
      error: err.message,
      stack: err.stack,
      cwd: process.cwd()
    }
  }
})
