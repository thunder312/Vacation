// server/api/carryover/test.get.ts
import { query } from '../../database/db'
import { icons } from '~/config/icons'

export default defineEventHandler(async (event) => {
  try {
    // Zeige ALLE Tabellen die existieren
    const tables = query<any>(`
      SELECT name FROM sqlite_master WHERE type='table'
    `)
    
    console.log(icons.actions.search + ' TEST: Tabellen gefunden:', tables.length)
    tables.forEach((t: any) => console.log(icons.roles.office , t.name))
    
    // Prüfe ob users Tabelle existiert
    const hasUsers = tables.some((t: any) => t.name === 'users')
    
    if (!hasUsers) {
      return {
        error: 'Tabelle "users" existiert nicht!',
        tables: tables.map((t: any) => t.name),
        hint: 'Die sqlite.db Datei ist leer oder hat die falschen Tabellen.'
      }
    }
    
    // Nur wenn users existiert, count machen
    const userCount = query<any>(`SELECT COUNT(*) as count FROM users`)
    
    return {
      success: true,
      tables: tables.map((t: any) => t.name),
      userCount: userCount[0].count
    }
    
  } catch (error: any) {
    console.error(icons.actions.search + ' TEST ERROR:', error.message)
    console.error(icons.actions.search + ' TEST STACK:', error.stack)
    
    return {
      error: error.message,
      stack: error.stack
    }
  }
})
