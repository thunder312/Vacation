// scripts/seed-admin.ts
import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'
import { join } from 'path'

const dbPath = join(process.cwd(), 'server', 'database', 'sqlite.db')
const db = new Database(dbPath)

async function seedAdmin() {
  console.log('🌱 Seeding admin user...')
  console.log('📍 Database path:', dbPath)
  
  // Prüfe ob admin schon existiert
  const existing = db.prepare('SELECT username FROM users WHERE username = ?').get('admin')
  
  if (existing) {
    console.log('⚠️  Admin user already exists')
    return
  }
  
  // Hash password
  const password = 'admin123' // ÄNDERN IN PRODUKTION!
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // Erstelle Admin User
  db.prepare(`
    INSERT INTO users (username, password, displayName, role, vacationDays, isActive)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run('admin', hashedPassword, 'Administrator', 'manager', 30)
  
  console.log('✅ Admin user created!')
  console.log('   Username: admin')
  console.log('   Password: admin123')
  console.log('   ⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!')
}

seedAdmin()
  .then(() => {
    db.close()
    console.log('✅ Done')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
