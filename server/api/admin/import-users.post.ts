// server/api/admin/import-users.post.ts - Zwei-Phasen Import
import { db } from '../../utils/db'
import bcrypt from 'bcrypt'

interface ImportUser {
  username: string
  firstName: string
  lastName: string
  role?: 'employee' | 'teamlead' | 'manager' | 'office' | 'sysadmin' | 'administrator'
  teamleadUsername?: string
  vacationDays?: number
}

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user || user.role !== 'administrator') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Nur Administrator darf Benutzer importieren'
    })
  }
  
  const body = await readBody(event)
  const { users } = body as { users: ImportUser[] }
  
  console.log('Import gestartet - Anzahl User:', users?.length)
  
  if (!Array.isArray(users) || users.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Keine Benutzerdaten zum Importieren'
    })
  }
  
  const results = {
    imported: 0,
    skipped: 0,
    errors: [] as string[],
    details: [] as string[]
  }
  
  try {
    // PHASE 1: Alle User erstellen (ohne Team-Zuordnung)
    console.log('\n=== PHASE 1: User erstellen ===')
    
    for (const userData of users) {
      try {
        console.log('\nVerarbeite User:', userData.username)
        
        // Validierung
        if (!userData.username || !userData.firstName || !userData.lastName) {
          results.skipped++
          results.errors.push(`${userData.username || 'Unknown'}: Username, FirstName oder LastName fehlt`)
          console.log('  └─ Übersprungen: Fehlende Daten')
          continue
        }
        
        // Prüfe ob User existiert
        const existing = db.prepare('SELECT username FROM users WHERE username = ?')
          .get(userData.username) as { username: string } | undefined
        
        if (existing) {
          results.skipped++
          results.details.push(`${userData.username}: Übersprungen (existiert bereits)`)
          console.log('  └─ Übersprungen: Existiert bereits')
          continue
        }
        
        // Generiere Passwort
        const password = Math.random().toString(36).slice(-8)
        const hashedPassword = await bcrypt.hash(password, 10)
        
        console.log('  └─ Passwort generiert:', password)
        
        // Erstelle User
        db.prepare(`
          INSERT INTO users (username, password, firstName, lastName, role, vacationDays, isActive)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `).run(
          userData.username,
          hashedPassword,
          userData.firstName,
          userData.lastName,
          userData.role || 'employee',
          userData.vacationDays || 30
        )
        
        console.log('  └─ User erstellt')
        
        results.imported++
        results.details.push(`${userData.username}: Importiert (Passwort: ${password})`)
        
      } catch (err: any) {
        results.skipped++
        results.errors.push(`${userData.username}: ${err.message}`)
        console.error('✗ Fehler bei', userData.username, ':', err.message)
      }
    }
    
    // PHASE 2: Team-Zuordnungen erstellen
    console.log('\n=== PHASE 2: Team-Zuordnungen ===')
    
    for (const userData of users) {
      if (!userData.teamleadUsername) continue
      
      try {
        console.log(`\nZuordnung: ${userData.username} → ${userData.teamleadUsername}`)
        
        // Prüfe ob beide User existieren
        const userExists = db.prepare('SELECT username FROM users WHERE username = ?')
          .get(userData.username)
        
        const teamleadExists = db.prepare('SELECT username FROM users WHERE username = ?')
          .get(userData.teamleadUsername)
        
        if (!userExists) {
          console.log('  └─ Warnung: User existiert nicht')
          continue
        }
        
        if (!teamleadExists) {
          console.log('  └─ Warnung: Teamleiter existiert nicht')
          results.errors.push(`${userData.username}: Teamleiter ${userData.teamleadUsername} existiert nicht`)
          continue
        }
        
        // Prüfe ob Zuordnung bereits existiert
        const orgExists = db.prepare('SELECT userId FROM organization WHERE userId = ?')
          .get(userData.username)
        
        if (orgExists) {
          console.log('  └─ Übersprungen: Zuordnung existiert bereits')
          continue
        }
        
        // Erstelle Zuordnung
        db.prepare(`
            INSERT INTO organization (userId, teamleadId)
          VALUES (?, ?)
        `).run(userData.username, userData.teamleadUsername)
        
        console.log('  └─ ✓ Zugeordnet')
        
      } catch (err: any) {
        console.error('✗ Zuordnungs-Fehler:', err.message)
        results.errors.push(`${userData.username}: Zuordnungs-Fehler: ${err.message}`)
      }
    }
    
    console.log(`\n✅ Import abgeschlossen: ${results.imported} importiert, ${results.skipped} übersprungen`)
    
    return {
      success: true,
      imported: results.imported,
      skipped: results.skipped,
      details: results.details,
      errors: results.errors
    }
  } catch (error: any) {
    console.error('❌ Import Fehler:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Importieren: ' + error.message
    })
  }
})
