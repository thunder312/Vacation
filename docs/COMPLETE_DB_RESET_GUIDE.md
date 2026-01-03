# Komplette DB Reset Anleitung

## Problem
Es gibt 2 verschiedene DB-Systeme im Projekt:
1. `/server/database/` (alt - teamId, managerId)
2. `/server/utils/db.ts` (neu - teamleadId)

## Lösung: DB neu erstellen mit Admin

### Schritt 1: App stoppen
```bash
Ctrl+C
```

### Schritt 2: Datenbank löschen
```bash
rm server/database/sqlite.db
rm server/database/sqlite.db-shm
rm server/database/sqlite.db-wal
```

### Schritt 3: App starten
```bash
npm run dev
```

### Schritt 4: Admin wird NICHT automatisch angelegt!

**Du musst den Admin manuell anlegen:**

**Option A: Über SQL (empfohlen)**

Öffne die SQLite DB mit einem Tool (z.B. DB Browser for SQLite) und führe aus:

```sql
INSERT INTO users (username, firstName, lastName, password, role, vacationDays, isActive)
VALUES (
  'admin',
  'Admin',
  'User',
  '$2b$10$rKJ5JzKzKzKzKzKzKzKzKuGQ4oKvZPFYX2l4GxKzKzKzKzKzKzKzK',
  'sysadmin',
  30,
  1
);
```

**Passwort:** `admin123` (gehashed)

**Option B: Seed-Script verwenden**

Das Seed-Script erstellt Test-Daten inkl. Admin mit Passwort `password123`:

```typescript
// In irgendeiner Server-Datei oder als Script:
import { seedDatabase } from '~/server/database/seed'
await seedDatabase()
```

Aber das erstellt auch viele Test-User!

---

## Bessere Lösung: Admin-Init in db.ts

**Füge Admin-Init zu `/server/utils/db.ts` hinzu:**

```typescript
// Am Ende von initializeDatabase() Funktion:

// Prüfe ob Admin existiert
const adminExists = db.prepare(`
  SELECT COUNT(*) as count FROM users WHERE username = 'admin'
`).get() as { count: number }

if (adminExists.count === 0) {
  // Admin erstellen
  const bcrypt = require('bcrypt')
  const hashedPassword = bcrypt.hashSync('admin123', 10)
  
  db.prepare(`
    INSERT INTO users (username, firstName, lastName, password, role, vacationDays, isActive)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('admin', 'Admin', 'User', hashedPassword, 'sysadmin', 30, 1)
  
  console.log('✅ Admin User erstellt (admin / admin123)')
}
```

---

## Nach dem Reset

**Login:**
- Username: `admin`
- Passwort: `admin123` (oder `password123` wenn du Seed verwendest)

**Erste Schritte:**
1. Als admin einloggen ✅
2. Manager anlegen (beliebiger Name)
3. Teamleiter anlegen
4. Mitarbeiter anlegen

---

## Welches System wird verwendet?

Prüfe in deinem Code welches Import-Statement verwendet wird:

**ALT (nicht mehr verwenden):**
```typescript
import { execute } from '~/server/database/db'
```

**NEU (verwenden):**
```typescript
import { db } from '~/server/utils/db'
```

Alle Dateien sollten das NEUE System verwenden!
