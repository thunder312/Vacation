// scripts/check-and-fix-organization.mjs
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '..', 'server', 'database', 'sqlite.db')

console.log('🔍 Checking organization table...')
console.log('DB Path:', dbPath)

const db = new Database(dbPath)

try {
  console.log('\n1️⃣  Checking users table...')
  const users = db.prepare("SELECT username, firstName, lastName, role FROM users WHERE username != 'admin'").all()
  console.log(`Found ${users.length} users (excluding admin):`)
  users.forEach(u => console.log(`  - ${u.username} (${u.firstName} ${u.lastName}) - Role: ${u.role}`))
  
  console.log('\n2️⃣  Checking organization table...')
  const orgEntries = db.prepare('SELECT * FROM organization').all()
  console.log(`Found ${orgEntries.length} organization entries:`)
  orgEntries.forEach(o => console.log(`  - userId: ${o.userId}, teamId: ${o.teamId}, managerId: ${o.managerId}`))
  
  console.log('\n3️⃣  Checking for missing organization entries...')
  const missingEntries = users.filter(u => 
    !orgEntries.some(o => o.userId === u.username)
  )
  
  if (missingEntries.length > 0) {
    console.log(`⚠️  Found ${missingEntries.length} users without organization entry:`)
    missingEntries.forEach(u => console.log(`  - ${u.username}`))
    
    console.log('\n4️⃣  Creating missing organization entries...')
    for (const user of missingEntries) {
      let managerId = null
      let teamId = null
      
      if (user.role === 'employee') {
        // Employees need a teamlead - we'll leave null for now
        console.log(`  ⚠️  ${user.username} (employee) needs manual teamlead assignment`)
      } else if (user.role === 'teamlead' || user.role === 'office' || user.role === 'sysadmin') {
        managerId = 'Schulz'
        console.log(`  ✓ ${user.username} (${user.role}) → Manager: Schulz`)
      } else if (user.role === 'manager') {
        managerId = null
        console.log(`  ✓ ${user.username} (manager) → No manager`)
      }
      
      db.prepare(`
        INSERT INTO organization (userId, teamId, managerId, createdAt, updatedAt)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `).run(user.username, teamId, managerId)
    }
    console.log('✓ Missing entries created')
  } else {
    console.log('✓ All users have organization entries')
  }
  
  console.log('\n5️⃣  Checking for orphaned teamId references...')
  const invalidTeamIds = orgEntries.filter(o => 
    o.teamId && !users.some(u => u.username === o.teamId)
  )
  
  if (invalidTeamIds.length > 0) {
    console.log(`⚠️  Found ${invalidTeamIds.length} entries with invalid teamId:`)
    invalidTeamIds.forEach(o => console.log(`  - ${o.userId} → teamId: ${o.teamId} (doesn't exist)`))
    
    console.log('\n   Clearing invalid teamId references...')
    for (const entry of invalidTeamIds) {
      db.prepare(`
        UPDATE organization 
        SET teamId = NULL 
        WHERE userId = ?
      `).run(entry.userId)
      console.log(`  ✓ Cleared teamId for ${entry.userId}`)
    }
  } else {
    console.log('✓ All teamId references are valid')
  }
  
  console.log('\n6️⃣  Final organization state:')
  const finalOrg = db.prepare('SELECT * FROM organization').all()
  finalOrg.forEach(o => {
    const user = users.find(u => u.username === o.userId)
    console.log(`  ${o.userId} (${user?.role || '?'}) → Team: ${o.teamId || 'none'}, Manager: ${o.managerId || 'none'}`)
  })
  
  console.log('\n✅ Check complete!')
  console.log('\n💡 Next steps:')
  console.log('   1. Go to Mitarbeiterverwaltung')
  console.log('   2. Manually assign teamleads to employees')
  console.log('   3. Save changes')
  
} catch (error) {
  console.error('\n❌ Error:', error)
  process.exit(1)
} finally {
  db.close()
}
