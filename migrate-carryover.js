// migrate-carryover.js
// Dieses Script spielt die carryover_adjustments Migration ein

import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🔄 Starte Migration...')

try {
  const dbPath = join(__dirname, 'server', 'database', 'sqlite.db')
  const db = new Database(dbPath)

  console.log('📂 Datenbank geöffnet:', dbPath)

  // Migration SQL
  const migrationSQL = `
    -- Carryover Adjustments Tabelle erstellen
    CREATE TABLE IF NOT EXISTS carryover_adjustments (
      userId TEXT NOT NULL,
      year INTEGER NOT NULL,
      originalDays REAL NOT NULL,
      approvedDays REAL NOT NULL,
      status TEXT NOT NULL,
      adjustmentReason TEXT,
      adjustedBy TEXT,
      adjustedAt TEXT,
      approvedBy TEXT,
      approvedAt TEXT,
      PRIMARY KEY (userId, year),
      FOREIGN KEY (userId) REFERENCES users(userId)
    );

    -- Indices erstellen
    CREATE INDEX IF NOT EXISTS idx_carryover_year ON carryover_adjustments(year);
    CREATE INDEX IF NOT EXISTS idx_carryover_status ON carryover_adjustments(status);
  `

  // Migration ausführen
  db.exec(migrationSQL)

  // Prüfen ob Tabelle existiert
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='carryover_adjustments'
  `).get()

  if (tableExists) {
    console.log('✅ Tabelle "carryover_adjustments" erfolgreich erstellt!')
    
    // Zeige Struktur
    const schema = db.prepare(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='carryover_adjustments'
    `).get()
    
    console.log('\n📋 Tabellen-Schema:')
    console.log(schema.sql)
    
    // Zeige Indices
    const indices = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND tbl_name='carryover_adjustments'
    `).all()
    
    console.log('\n🔍 Indices:')
    indices.forEach(idx => console.log('  -', idx.name))
    
  } else {
    console.log('❌ Fehler: Tabelle wurde nicht erstellt!')
  }

  db.close()
  console.log('\n✅ Migration abgeschlossen!')

} catch (error) {
  console.error('❌ Fehler bei der Migration:', error)
  process.exit(1)
}
