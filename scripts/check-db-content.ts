// scripts/check-db-content.ts
import { getDb } from '../server/database/db'
import { icons } from '../app/config/icons'

const db = getDb()

console.log('\n DATENBANK-INHALT:\n')

// Users
const users = db.prepare('SELECT username, role FROM users').all()
console.log( icons.roles.teamlead + ' USERS:', users.length)
users.forEach(u => console.log(`  - ${u.username} (${u.role})`))

// Vacation Requests
const requests = db.prepare('SELECT id, userId, status FROM vacation_requests').all()
console.log('\n🏖️ VACATION REQUESTS:', requests.length)
requests.forEach(r => console.log(`  - #${r.id}: ${r.userId} - ${r.status}`))

// Organization
const org = db.prepare('SELECT userId, teamId, managerId FROM organization').all()
console.log('\n🏢 ORGANIZATION:', org.length)
org.forEach(o => console.log(`  - ${o.userId} → Team: ${o.teamId || 'none'}, Manager: ${o.managerId || 'none'}`))

// Half Day Rules
const halfDays = db.prepare('SELECT id, date, description FROM half_day_rules').all()
console.log('\n⏰ HALF DAY RULES:', halfDays.length)
halfDays.forEach(h => console.log(`  - ${h.date}: ${h.description}`))

// Carryover
const carryover = db.prepare('SELECT userId, year, carryoverDays FROM carryover').all()
console.log('\n CARRYOVER:', carryover.length)
carryover.forEach(c => console.log(`  - ${c.userId} (${c.year}): ${c.carryoverDays} {{ t('common.days') }}`))

console.log('\n' + icons.actions.activate + ' Fertig!\n')
