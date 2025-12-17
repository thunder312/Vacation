// server/api/users/schema.get.ts
import { query } from '../../database/db'

export default defineEventHandler(async (event) => {
  try {
    // Prüfe Tabellenstruktur
    const schema = query<any>(`PRAGMA table_info(users)`)
    
    console.log('📋 Users table schema:')
    schema.forEach((col: any) => {
      console.log(`  - ${col.name} (${col.type})`)
    })
    
    // Hole einen Beispiel-User
    const sampleUser = query<any>(`SELECT * FROM users LIMIT 1`)
    
    console.log('👤 Sample user fields:', Object.keys(sampleUser[0] || {}))
    
    return {
      schema,
      sampleUser: sampleUser[0],
      fields: Object.keys(sampleUser[0] || {})
    }
  } catch (error: any) {
    console.error('Error:', error)
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
