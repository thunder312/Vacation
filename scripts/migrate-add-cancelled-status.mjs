// scripts/migrate-add-cancelled-status.mjs
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '..', 'server', 'database', 'sqlite.db')

console.log('📊 Migration: Add cancelled status to vacation_requests')
console.log('DB Path:', dbPath)

const db = new Database(dbPath)

try {
  console.log('\n1️⃣  Checking current schema...')
  
  // Prüfe aktuelle Tabelle
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='vacation_requests'").get()
  console.log('Current schema:', tableInfo?.sql)
  
  if (!tableInfo?.sql.includes("'cancelled'")) {
    console.log('\n2️⃣  Creating new table with cancelled status...')
    
    // Erstelle neue Tabelle mit erweitertem CHECK constraint
    db.exec(`
      CREATE TABLE vacation_requests_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        displayName TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        reason TEXT,
        status TEXT NOT NULL CHECK(status IN ('pending', 'teamlead_approved', 'approved', 'rejected', 'cancelled')),
        teamleadApprovalDate TEXT,
        managerApprovalDate TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(username) ON DELETE CASCADE
      )
    `)
    
    console.log('✓ New table created')
    
    console.log('\n3️⃣  Copying data...')
    db.exec(`
      INSERT INTO vacation_requests_new 
      SELECT * FROM vacation_requests
    `)
    
    console.log('✓ Data copied')
    
    console.log('\n4️⃣  Swapping tables...')
    db.exec('DROP TABLE vacation_requests')
    db.exec('ALTER TABLE vacation_requests_new RENAME TO vacation_requests')
    
    console.log('✓ Tables swapped')
    
    console.log('\n5️⃣  Recreating indexes...')
    db.exec('CREATE INDEX IF NOT EXISTS idx_vacation_userId ON vacation_requests(userId)')
    db.exec('CREATE INDEX IF NOT EXISTS idx_vacation_status ON vacation_requests(status)')
    
    console.log('✓ Indexes recreated')
    
    console.log('\n✅ Migration completed successfully!')
    console.log('   Status values now allowed: pending, teamlead_approved, approved, rejected, cancelled')
  } else {
    console.log('\n✓ Schema already includes cancelled status - no migration needed')
  }
  
} catch (error) {
  console.error('\n❌ Migration failed:', error)
  process.exit(1)
} finally {
  db.close()
}
