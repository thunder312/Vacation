// scripts/restore-team-assignments.mjs
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '..', 'server', 'database', 'sqlite.db')

console.log('🔄 Restoring team assignments from vacation_requests...')
console.log('DB Path:', dbPath)

const db = new Database(dbPath)

try {
  console.log('\n1️⃣  Analyzing vacation_requests for team patterns...')
  
  // Hole alle Employees ohne Teamleiter
  const employees = db.prepare(`
    SELECT u.username, u.firstName, u.lastName 
    FROM users u
    JOIN organization o ON u.username = o.userId
    WHERE u.role = 'employee' AND o.teamId IS NULL
  `).all()
  
  console.log(`Found ${employees.length} employees without teamlead`)
  
  // Für jeden Employee: Finde wer ihre Anträge genehmigt hat
  const assignments = []
  
  for (const emp of employees) {
    // Suche nach approved requests und prüfe wer genehmigt hat
    const requests = db.prepare(`
      SELECT * FROM vacation_requests 
      WHERE userId = ? AND status IN ('approved', 'teamlead_approved')
      ORDER BY createdAt DESC
      LIMIT 5
    `).all(emp.username)
    
    if (requests.length > 0) {
      console.log(`\n  ${emp.firstName} ${emp.lastName} (${emp.username}):`)
      console.log(`    Found ${requests.length} approved requests`)
      
      // Hole alle Teamleiter
      const teamleads = db.prepare(`
        SELECT username, firstName, lastName 
        FROM users 
        WHERE role = 'teamlead'
      `).all()
      
      if (teamleads.length > 0) {
        // Nimm den ersten Teamleiter als Standard (kann manuell angepasst werden)
        const suggestedTeamlead = teamleads[0]
        console.log(`    💡 Suggested teamlead: ${suggestedTeamlead.firstName} ${suggestedTeamlead.lastName}`)
        
        assignments.push({
          employee: emp.username,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          teamlead: suggestedTeamlead.username,
          teamleadName: `${suggestedTeamlead.firstName} ${suggestedTeamlead.lastName}`
        })
      }
    }
  }
  
  console.log('\n\n2️⃣  Suggested assignments:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  assignments.forEach(a => {
    console.log(`${a.employeeName.padEnd(25)} → ${a.teamleadName}`)
  })
  
  console.log('\n\n❓ Do you want to apply these assignments? (yes/no)')
  console.log('   Or manually assign in the UI: Mitarbeiterverwaltung')
  
  // Hier könnten wir mit readline auf Benutzereingabe warten
  // Für jetzt: Zeige nur die Vorschläge an
  
  console.log('\n\n📋 SQL to apply assignments manually:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  assignments.forEach(a => {
    console.log(`UPDATE organization SET teamId = '${a.teamlead}', managerId = '${a.teamlead}' WHERE userId = '${a.employee}';`)
  })
  
  console.log('\n\n✅ Analysis complete!')
  console.log('\n💡 Next steps:')
  console.log('   Option 1: Copy the SQL above and run it manually')
  console.log('   Option 2: Go to Mitarbeiterverwaltung and assign manually')
  
} catch (error) {
  console.error('\n❌ Error:', error)
  process.exit(1)
} finally {
  db.close()
}
