// scripts/migrate-users-table.mjs
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Pfad zur Datenbank
const dbPath = join(__dirname, '../server/database/sqlite.db')

console.log('🔄 Starting users table migration...')
console.log('📁 Database path:', dbPath)

try {
  const db = new Database(dbPath)
  
  // Prüfe aktuelle Struktur
  console.log('\n📋 Current table structure:')
  const tableInfo = db.prepare('PRAGMA table_info(users)').all()
  tableInfo.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`)
  })
  
  const existingColumns = tableInfo.map(col => col.name)
  
  console.log('\n🔧 Adding missing columns...')
  
  // Füge fehlende Spalten hinzu
  if (!existingColumns.includes('vacationDays')) {
    console.log('  ➕ Adding: vacationDays (INTEGER DEFAULT 30)')
    db.prepare('ALTER TABLE users ADD COLUMN vacationDays INTEGER DEFAULT 30').run()
  } else {
    console.log('  ✓ vacationDays already exists')
  }
  
  if (!existingColumns.includes('teamleadId')) {
    console.log('  ➕ Adding: teamleadId (TEXT)')
    db.prepare('ALTER TABLE users ADD COLUMN teamleadId TEXT').run()
  } else {
    console.log('  ✓ teamleadId already exists')
  }
  
  if (!existingColumns.includes('isActive')) {
    console.log('  ➕ Adding: isActive (INTEGER DEFAULT 1)')
    db.prepare('ALTER TABLE users ADD COLUMN isActive INTEGER DEFAULT 1').run()
  } else {
    console.log('  ✓ isActive already exists')
  }
  
  // Zeige neue Struktur
  console.log('\n📋 New table structure:')
  const newTableInfo = db.prepare('PRAGMA table_info(users)').all()
  newTableInfo.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`)
  })
  
  db.close()
  
  console.log('\n✅ Migration completed successfully!')
  console.log('🎉 You can now use the user management features!')
  
} catch (error) {
  console.error('\n❌ Migration failed:', error)
  process.exit(1)
}
