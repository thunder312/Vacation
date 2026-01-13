// server/database/seed.ts
import { getDb } from './db'
import bcrypt from 'bcrypt'
import {icons} from "~/config/icons";

/**
 * Fügt Test-Daten in die Datenbank ein
 */
export async function seedDatabase(): Promise<void> {
  const db = getDb()

  console.log('🌱 Starte Database Seeding...')

  // Check if users already exist
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  if (existingUsers.count > 0) {
    console.log('⚠️ Datenbank enthält bereits Benutzer. Seeding übersprungen.')
    return
  }

  // Hash für Passwort "password123"
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Users einfügen
  const insertUser = db.prepare(`
    INSERT INTO users (username, firstName, lastName, password, role, vacationDays, isActive)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const users = [
    { username: 'admin', firstName: null, lastName: null, role: 'administrator', days: 30 },
    { username: 'Schulz', firstName: 'Stefan', lastName: 'Schulz', role: 'manager', days: 30 },
    { username: 'Meyer', firstName: 'Sandra', lastName: 'Meyer', role: 'office', days: 30 },
    { username: 'Mueller', firstName: 'Thomas', lastName: 'Mueller', role: 'teamlead', days: 28 },
    { username: 'Weber', firstName: 'Sarah', lastName: 'Weber', role: 'teamlead', days: 28 },
    { username: 'Mustermann', firstName: 'Max', lastName: 'Mustermann', role: 'employee', days: 26 },
    { username: 'Schmidt', firstName: 'Anna', lastName: 'Schmidt', role: 'employee', days: 26 },
    { username: 'Fischer', firstName: 'Peter', lastName: 'Fischer', role: 'employee', days: 26 },
    { username: 'Wagner', firstName: 'Lisa', lastName: 'Wagner', role: 'employee', days: 26 },
    { username: 'Becker', firstName: 'Michael', lastName: 'Becker', role: 'employee', days: 26 },
  ]

  for (const user of users) {
    insertUser.run(
      user.username,
      user.firstName,
      user.lastName,
      hashedPassword,
      user.role,
      user.days,
      1 // isActive
    )
  }

  console.log(icons.actions.activate +  '${users.length} Benutzer erstellt')

  // Organization Struktur
  const insertOrg = db.prepare(`
    INSERT INTO organization (userId, teamId, managerId)
    VALUES (?, ?, ?)
  `)

  const orgStructure = [
    { userId: 'Mustermann', teamId: 'Mueller', managerId: 'Schulz' },
    { userId: 'Schmidt', teamId: 'Mueller', managerId: 'Schulz' },
    { userId: 'Fischer', teamId: 'Weber', managerId: 'Schulz' },
    { userId: 'Wagner', teamId: 'Weber', managerId: 'Schulz' },
    { userId: 'Becker', teamId: 'Weber', managerId: 'Schulz' },
    { userId: 'Mueller', teamId: null, managerId: 'Schulz' },
    { userId: 'Weber', teamId: null, managerId: 'Schulz' },
  ]

  for (const org of orgStructure) {
    insertOrg.run(org.userId, org.teamId, org.managerId)
  }

  console.log(icons.actions.activate + '  Organization-Struktur erstellt')

  // Beispiel Carryover Daten
  const insertCarryover = db.prepare(`
    INSERT INTO carryover (userId, year, carryoverDays)
    VALUES (?, ?, ?)
  `)

  const currentYear = new Date().getFullYear()
  const carryovers = [
    { userId: 'Mustermann', year: currentYear, days: 1.0 },
    { userId: 'Schmidt', year: currentYear, days: 5.0 },
  ]

  for (const co of carryovers) {
    insertCarryover.run(co.userId, co.year, co.days)
  }

  console.log(icons.actions.activate + '  ${carryovers.length} Carryover-Einträge erstellt')

  // Beispiel Vacation Requests
  const insertVacation = db.prepare(`
    INSERT INTO vacation_requests (userId, displayName, startDate, endDate, reason, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)
  
  const vacations = [
    {
      userId: 'Mustermann',
      displayName: 'Max Mustermann',
      startDate: formatDate(today),
      endDate: formatDate(nextWeek),
      reason: 'Urlaub',
      status: 'approved'
    },
    {
      userId: 'Schmidt',
      displayName: 'Anna Schmidt',
      startDate: '2025-12-23',
      endDate: '2025-12-27',
      reason: 'Weihnachten',
      status: 'pending'
    },
  ]

  for (const vac of vacations) {
    insertVacation.run(
      vac.userId,
      vac.displayName,
      vac.startDate,
      vac.endDate,
      vac.reason,
      vac.status
    )
  }

  console.log(icons.actions.activate + ' ${vacations.length} Vacation Requests erstellt')

  console.log(icons.status.seeding + ' Seeding abgeschlossen!')
  console.log(icons.status.input + ' Test-Login: admin / password123')
}

/**
 * Hilfsfunktion: Formatiert Datum zu YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
