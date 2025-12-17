// server/database/seed.ts
import bcrypt from 'bcrypt'
import { getDb } from './db'

const SALT_ROUNDS = 10

/**
 * Hasht ein Passwort mit bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Seed-Funktion: Füllt die Datenbank mit initialen Daten
 */
export async function seedDatabase(): Promise<void> {
  const db = getDb()
  
  console.log('🌱 Starte Seed-Prozess...')

  // Prüfen ob bereits Daten vorhanden sind
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  
  if (userCount.count > 0) {
    console.log('⚠️  Datenbank enthält bereits Daten. Seed wird übersprungen.')
    console.log('   Zum Neu-Seeden: Führe `npm run db:reset` aus')
    return
  }

  try {
    // === 1. USERS ===
    console.log('👥 Erstelle Benutzer...')
    
    const users = [
      // Manager
      { username: 'admin', firstName: null, lastName: null, password: 'geheim123', role: 'manager' },
      { username: 'Schulz', firstName: 'Stefan', lastName: 'Schulz', password: 'manager123', role: 'manager' },
      
      // Office
      { username: 'Meyer', firstName: 'Sandra', lastName: 'Meyer', password: 'office123', role: 'office' },
      
      // Teamleads
      { username: 'Mueller', firstName: 'Thomas', lastName: 'Mueller', password: 'teamleiter1', role: 'teamlead' },
      { username: 'Weber', firstName: 'Sarah', lastName: 'Weber', password: 'teamleiter2', role: 'teamlead' },
      { username: 'Fischer', firstName: 'Michael', lastName: 'Fischer', password: 'teamleiter3', role: 'teamlead' },
      
      // Employees
      { username: 'Mustermann', firstName: 'Max', lastName: 'Mustermann', password: 'password123', role: 'employee' },
      { username: 'Schmidt', firstName: 'Anna', lastName: 'Schmidt', password: 'password456', role: 'employee' },
      { username: 'Schneider', firstName: 'Lisa', lastName: 'Schneider', password: 'password789', role: 'employee' },
      { username: 'Becker', firstName: 'Jonas', lastName: 'Becker', password: 'password321', role: 'employee' },
      { username: 'Hoffmann', firstName: 'Julia', lastName: 'Hoffmann', password: 'password654', role: 'employee' },
      { username: 'Koch', firstName: 'Daniel', lastName: 'Koch', password: 'password987', role: 'employee' },
      { username: 'Bauer', firstName: 'Laura', lastName: 'Bauer', password: 'password147', role: 'employee' },
      { username: 'Richter', firstName: 'Sebastian', lastName: 'Richter', password: 'password258', role: 'employee' },
      { username: 'Klein', firstName: 'Nina', lastName: 'Klein', password: 'password369', role: 'employee' },
      { username: 'Wolf', firstName: 'Tim', lastName: 'Wolf', password: 'password741', role: 'employee' }
    ]

    const insertUser = db.prepare(`
      INSERT INTO users (username, firstName, lastName, password, role, vacationDays, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    for (const user of users) {
      const hashedPassword = await hashPassword(user.password)
      // admin braucht keine Urlaubstage
      const vacationDays = user.username === 'admin' ? null : 30
      insertUser.run(
        user.username, 
        user.firstName, 
        user.lastName, 
        hashedPassword, 
        user.role,
        vacationDays,
        1    // isActive default
      )
    }
    
    console.log(`   ✅ ${users.length} Benutzer erstellt`)

    // === 2. ORGANIZATION ===
    console.log('🏢 Erstelle Organigramm-Zuordnungen...')
    
    const orgData = [
      // Manager (kein Team)
      { userId: 'admin', teamId: null, managerId: null },
      { userId: 'Schulz', teamId: null, managerId: null },
      
      // Office (unter Manager)
      { userId: 'Meyer', teamId: null, managerId: 'Schulz' },
      
      // Teamleads (unter Manager)
      { userId: 'Mueller', teamId: null, managerId: 'Schulz' },
      { userId: 'Weber', teamId: null, managerId: 'Schulz' },
      { userId: 'Fischer', teamId: null, managerId: 'Schulz' },
      
      // Team Mueller
      { userId: 'Mustermann', teamId: 'Mueller', managerId: 'Mueller' },
      { userId: 'Schmidt', teamId: 'Mueller', managerId: 'Mueller' },
      { userId: 'Schneider', teamId: 'Mueller', managerId: 'Mueller' },
      
      // Team Weber
      { userId: 'Becker', teamId: 'Weber', managerId: 'Weber' },
      { userId: 'Hoffmann', teamId: 'Weber', managerId: 'Weber' },
      { userId: 'Koch', teamId: 'Weber', managerId: 'Weber' },
      
      // Team Fischer
      { userId: 'Bauer', teamId: 'Fischer', managerId: 'Fischer' },
      { userId: 'Richter', teamId: 'Fischer', managerId: 'Fischer' },
      { userId: 'Klein', teamId: 'Fischer', managerId: 'Fischer' },
      { userId: 'Wolf', teamId: 'Fischer', managerId: 'Fischer' }
    ]

    const insertOrg = db.prepare(`
      INSERT INTO organization (userId, teamId, managerId)
      VALUES (?, ?, ?)
    `)

    for (const org of orgData) {
      insertOrg.run(org.userId, org.teamId, org.managerId)
    }
    
    console.log(`   ✅ ${orgData.length} Zuordnungen erstellt`)

    // === 3. VACATION REQUESTS ===
    console.log('🏖️  Erstelle Urlaubsanträge...')
    
    const vacations = [
      {
        userId: 'Mustermann',
        displayName: 'Max Mustermann',
        startDate: '2025-12-15',
        endDate: '2025-12-20',
        reason: 'Weihnachtsurlaub',
        status: 'pending',
        teamleadApprovalDate: null,
        managerApprovalDate: null
      },
      {
        userId: 'Schmidt',
        displayName: 'Anna Schmidt',
        startDate: '2026-01-10',
        endDate: '2026-01-15',
        reason: 'Familienbesuch',
        status: 'teamlead_approved',
        teamleadApprovalDate: '2025-11-25',
        managerApprovalDate: null
      },
      {
        userId: 'Mustermann',
        displayName: 'Max Mustermann',
        startDate: '2025-07-01',
        endDate: '2025-07-14',
        reason: 'Sommerurlaub',
        status: 'approved',
        teamleadApprovalDate: '2025-06-15',
        managerApprovalDate: '2025-06-16'
      },
      {
        userId: 'Mustermann',
        displayName: 'Max Mustermann',
        startDate: '2025-03-24',
        endDate: '2025-03-28',
        reason: 'Osterurlaub',
        status: 'approved',
        teamleadApprovalDate: '2025-03-10',
        managerApprovalDate: '2025-03-11'
      },
      {
        userId: 'Mustermann',
        displayName: 'Max Mustermann',
        startDate: '2025-05-02',
        endDate: '2025-05-02',
        reason: 'Brückentag',
        status: 'approved',
        teamleadApprovalDate: '2025-04-20',
        managerApprovalDate: '2025-04-21'
      }
    ]

    const insertVacation = db.prepare(`
      INSERT INTO vacation_requests (userId, displayName, startDate, endDate, reason, status, teamleadApprovalDate, managerApprovalDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const vacation of vacations) {
      insertVacation.run(
        vacation.userId,
        vacation.displayName,
        vacation.startDate,
        vacation.endDate,
        vacation.reason,
        vacation.status,
        vacation.teamleadApprovalDate,
        vacation.managerApprovalDate
      )
    }
    
    console.log(`   ✅ ${vacations.length} Urlaubsanträge erstellt`)

    // === 4. HALF DAY RULES ===
    console.log('⏰ Erstelle Halbtags-Regelungen...')
    
    const halfDays = [
      { date: '2025-12-24', description: 'Heiligabend', createdBy: 'admin' },
      { date: '2025-12-31', description: 'Silvester', createdBy: 'admin' }
    ]

    const insertHalfDay = db.prepare(`
      INSERT INTO half_day_rules (date, description, createdBy)
      VALUES (?, ?, ?)
    `)

    for (const halfDay of halfDays) {
      insertHalfDay.run(halfDay.date, halfDay.description, halfDay.createdBy)
    }
    
    console.log(`   ✅ ${halfDays.length} Halbtags-Regelungen erstellt`)

    // === 5. CARRYOVER ===
    console.log('📊 Erstelle Übertragstage...')
    
    const carryovers = [
      { userId: 'Mustermann', year: 2025, carryoverDays: 8, expiryDate: null },
      { userId: 'Schmidt', year: 2025, carryoverDays: 3, expiryDate: '2025-03-31' }
    ]

    const insertCarryover = db.prepare(`
      INSERT INTO carryover (userId, year, carryoverDays, expiryDate)
      VALUES (?, ?, ?, ?)
    `)

    for (const carryover of carryovers) {
      insertCarryover.run(carryover.userId, carryover.year, carryover.carryoverDays, carryover.expiryDate)
    }
    
    console.log(`   ✅ ${carryovers.length} Übertragstage erstellt`)

    console.log('\n✅ Seed-Prozess abgeschlossen!')
    console.log('📊 Datenbank-Zusammenfassung:')
    console.log(`   - ${users.length} Benutzer`)
    console.log(`   - ${orgData.length} Org-Zuordnungen`)
    console.log(`   - ${vacations.length} Urlaubsanträge`)
    console.log(`   - ${halfDays.length} Halbtags-Regelungen`)
    console.log(`   - ${carryovers.length} Übertragstage`)

  } catch (error) {
    console.error('❌ Fehler beim Seeden der Datenbank:', error)
    throw error
  }
}

/**
 * Löscht alle Daten aus allen Tabellen
 */
export function clearAllData(): void {
  const db = getDb()
  
  db.prepare('DELETE FROM organization').run()
  db.prepare('DELETE FROM carryover').run()
  db.prepare('DELETE FROM half_day_rules').run()
  db.prepare('DELETE FROM vacation_requests').run()
  db.prepare('DELETE FROM users').run()
  
  console.log('🗑️  Alle Daten gelöscht')
}
