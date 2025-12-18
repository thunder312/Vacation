// scripts/migrate-add-sysadmin-role.mjs
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '..', 'server', 'database', 'sqlite.db')

console.log('📊 Migration: Add sysadmin role to users')
console.log('DB Path:', dbPath)

const db = new Database(dbPath)

try {
  console.log('\n1️⃣  Checking current schema...')
  
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get()
  console.log('Current schema:', tableInfo?.sql)
  
  if (!tableInfo?.sql.includes("'sysadmin'")) {
    console.log('\n2️⃣  Creating new table with sysadmin role...')
    
    db.exec(`
      CREATE TABLE users_new (
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
    
    console.log('✓ New table created')
    
    console.log('\n3️⃣  Copying data...')
    db.exec(`
      INSERT INTO users_new 
      SELECT * FROM users
    `)
    
    console.log('✓ Data copied')
    
    console.log('\n4️⃣  Swapping tables...')
    db.exec('DROP TABLE users')
    db.exec('ALTER TABLE users_new RENAME TO users')
    
    console.log('✓ Tables swapped')
    
    console.log('\n5️⃣  Recreating indexes...')
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)')
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)')
    
    console.log('✓ Indexes recreated')
    
    console.log('\n✅ Migration completed successfully!')
    console.log('   Role values now allowed: employee, teamlead, manager, office, sysadmin')
  } else {
    console.log('\n✓ Schema already includes sysadmin role - no migration needed')
  }
  
} catch (error) {
  console.error('\n❌ Migration failed:', error)
  process.exit(1)
} finally {
  db.close()
}
