# Datenbank-Migrationsleitfaden

## Übersicht

Das Urlaubsverwaltungssystem verwendet derzeit **SQLite** mit dem `better-sqlite3` Package als eingebettete Datenbank. Dieses Dokument beschreibt die notwendigen Schritte, um die Anwendung auf **Microsoft SQL Server** oder **Oracle Database** zu migrieren.

---

## Inhaltsverzeichnis

1. [Aktuelle Architektur](#aktuelle-architektur)
2. [Änderungen für Microsoft SQL Server](#änderungen-für-microsoft-sql-server)
3. [Änderungen für Oracle Database](#änderungen-für-oracle-database)
4. [Code-Anpassungen](#code-anpassungen)
5. [Migrations-Skripte](#migrations-skripte)
6. [Testplan](#testplan)

---

## Aktuelle Architektur

### Datenbank-Schema (SQLite)

Die Anwendung verwendet folgende Tabellen:

| Tabelle | Beschreibung |
|---------|-------------|
| `users` | Benutzerdaten und Authentifizierung |
| `vacation_requests` | Urlaubsanträge |
| `organization` | Organisationsstruktur (User-Teamleiter-Zuordnung) |
| `carryover` | Resturlaubs-Übertrag |
| `half_day_rules` | Halbtags-Regelungen (Feiertage etc.) |
| `vacation_exceptions` | Urlaubsrückbuchungen |

### Aktuelle Datenbankzugriffs-Schicht

```
server/
├── utils/
│   └── db.ts              # Haupt-Datenbankverbindung (better-sqlite3)
├── database/
│   ├── db.ts              # Kompatibilitäts-Wrapper
│   └── types.ts           # TypeScript-Interfaces
└── api/
    └── [endpoints]        # API-Endpunkte mit direkten SQL-Abfragen
```

---

## Änderungen für Microsoft SQL Server

### 1. Package-Installation

```bash
# SQLite-Package entfernen
npm uninstall better-sqlite3

# MS SQL Server Package installieren
npm install mssql
npm install --save-dev @types/mssql
```

### 2. Umgebungsvariablen

Erstellen Sie eine `.env`-Datei mit den Verbindungsdaten:

```env
# Microsoft SQL Server Konfiguration
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_DATABASE=vacation_db
MSSQL_USER=sa
MSSQL_PASSWORD=your_password
MSSQL_ENCRYPT=true
MSSQL_TRUST_SERVER_CERTIFICATE=true
```

### 3. Neue Datenbankverbindung (server/utils/db-mssql.ts)

```typescript
// server/utils/db-mssql.ts
import sql from 'mssql'

const config: sql.config = {
  server: process.env.MSSQL_HOST || 'localhost',
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: process.env.MSSQL_DATABASE || 'vacation_db',
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE === 'true'
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
}

let pool: sql.ConnectionPool | null = null

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config)
    console.log('✅ MS SQL Server Verbindung hergestellt')
  }
  return pool
}

// Query-Helper-Funktionen
export async function query<T = any>(sqlQuery: string, params: any[] = []): Promise<T[]> {
  const pool = await getPool()
  const request = pool.request()

  // Parameter binden
  params.forEach((param, index) => {
    request.input(`p${index}`, param)
  })

  // Platzhalter ersetzen (? -> @p0, @p1, ...)
  let convertedSql = sqlQuery
  let paramIndex = 0
  convertedSql = convertedSql.replace(/\?/g, () => `@p${paramIndex++}`)

  const result = await request.query(convertedSql)
  return result.recordset as T[]
}

export async function queryOne<T = any>(sqlQuery: string, params: any[] = []): Promise<T | null> {
  const results = await query<T>(sqlQuery, params)
  return results[0] || null
}

export async function run(sqlQuery: string, params: any[] = []): Promise<{ rowsAffected: number; insertId?: number }> {
  const pool = await getPool()
  const request = pool.request()

  params.forEach((param, index) => {
    request.input(`p${index}`, param)
  })

  let convertedSql = sqlQuery
  let paramIndex = 0
  convertedSql = convertedSql.replace(/\?/g, () => `@p${paramIndex++}`)

  // Für INSERT: SCOPE_IDENTITY() hinzufügen
  if (convertedSql.trim().toUpperCase().startsWith('INSERT')) {
    convertedSql += '; SELECT SCOPE_IDENTITY() AS insertId'
  }

  const result = await request.query(convertedSql)

  return {
    rowsAffected: result.rowsAffected[0] || 0,
    insertId: result.recordset?.[0]?.insertId
  }
}

export async function transaction<T>(fn: (request: sql.Request) => Promise<T>): Promise<T> {
  const pool = await getPool()
  const trans = new sql.Transaction(pool)

  try {
    await trans.begin()
    const request = new sql.Request(trans)
    const result = await fn(request)
    await trans.commit()
    return result
  } catch (error) {
    await trans.rollback()
    throw error
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close()
    pool = null
    console.log('🔒 MS SQL Server Verbindung geschlossen')
  }
}
```

### 4. SQL-Syntax-Unterschiede (SQLite → MS SQL)

| Feature | SQLite | MS SQL Server |
|---------|--------|---------------|
| Auto-Increment | `INTEGER PRIMARY KEY AUTOINCREMENT` | `INT IDENTITY(1,1) PRIMARY KEY` |
| Boolean | `INTEGER` (0/1) | `BIT` |
| String-Concat | `\|\|` | `+` oder `CONCAT()` |
| Aktuelles Datum | `CURRENT_TIMESTAMP` | `GETDATE()` |
| LIMIT | `LIMIT n` | `TOP n` oder `OFFSET...FETCH` |
| Substring | `substr(col, start, len)` | `SUBSTRING(col, start, len)` |
| UPSERT | `INSERT OR REPLACE` | `MERGE` Statement |
| Boolean-Literale | `1` / `0` | `1` / `0` |

### 5. Beispiel: API-Endpoint anpassen

**Vorher (SQLite):**
```typescript
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const users = db.prepare(`
    SELECT
      u.username,
      u.firstName || ' ' || u.lastName as displayName
    FROM users u
    ORDER BY displayName ASC
  `).all()

  return users
})
```

**Nachher (MS SQL):**
```typescript
import { query } from '../../utils/db-mssql'

export default defineEventHandler(async (event) => {
  const users = await query(`
    SELECT
      u.username,
      CONCAT(u.firstName, ' ', u.lastName) as displayName
    FROM users u
    ORDER BY displayName ASC
  `)

  return users
})
```

---

## Änderungen für Oracle Database

### 1. Package-Installation

```bash
# SQLite-Package entfernen
npm uninstall better-sqlite3

# Oracle Package installieren
npm install oracledb
```

**Hinweis:** Oracle erfordert zusätzlich den Oracle Instant Client:
- Download: https://www.oracle.com/database/technologies/instant-client.html
- Umgebungsvariable `ORACLE_CLIENT_LIB` auf den Installationspfad setzen

### 2. Umgebungsvariablen

```env
# Oracle Database Konfiguration
ORACLE_USER=vacation_user
ORACLE_PASSWORD=your_password
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
ORACLE_POOL_MIN=2
ORACLE_POOL_MAX=10
```

### 3. Neue Datenbankverbindung (server/utils/db-oracle.ts)

```typescript
// server/utils/db-oracle.ts
import oracledb from 'oracledb'

// Oracle Thick Mode aktivieren (falls Instant Client installiert)
try {
  oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_LIB })
} catch (e) {
  console.log('Oracle Thin Mode wird verwendet')
}

const poolConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECT_STRING,
  poolMin: parseInt(process.env.ORACLE_POOL_MIN || '2'),
  poolMax: parseInt(process.env.ORACLE_POOL_MAX || '10'),
  poolIncrement: 1
}

let pool: oracledb.Pool | null = null

export async function getPool(): Promise<oracledb.Pool> {
  if (!pool) {
    pool = await oracledb.createPool(poolConfig)
    console.log('✅ Oracle Verbindung hergestellt')
  }
  return pool
}

export async function query<T = any>(sqlQuery: string, params: any[] = []): Promise<T[]> {
  const pool = await getPool()
  const connection = await pool.getConnection()

  try {
    // Platzhalter ersetzen (? -> :0, :1, ...)
    let convertedSql = sqlQuery
    let paramIndex = 0
    convertedSql = convertedSql.replace(/\?/g, () => `:${paramIndex++}`)

    const result = await connection.execute(convertedSql, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    })

    return (result.rows || []) as T[]
  } finally {
    await connection.close()
  }
}

export async function queryOne<T = any>(sqlQuery: string, params: any[] = []): Promise<T | null> {
  const results = await query<T>(sqlQuery, params)
  return results[0] || null
}

export async function run(sqlQuery: string, params: any[] = []): Promise<{ rowsAffected: number; insertId?: number }> {
  const pool = await getPool()
  const connection = await pool.getConnection()

  try {
    let convertedSql = sqlQuery
    let paramIndex = 0
    convertedSql = convertedSql.replace(/\?/g, () => `:${paramIndex++}`)

    // Für INSERT: RETURNING id INTO :insertId
    let insertId: number | undefined
    const bindParams = [...params]

    if (convertedSql.trim().toUpperCase().startsWith('INSERT')) {
      convertedSql = convertedSql.replace(/\)$/,  '') + ') RETURNING id INTO :insertId'
      bindParams.push({ dir: oracledb.BIND_OUT, type: oracledb.NUMBER })
    }

    const result = await connection.execute(convertedSql, bindParams, {
      autoCommit: true
    })

    return {
      rowsAffected: result.rowsAffected || 0,
      insertId: (result.outBinds as any)?.insertId
    }
  } finally {
    await connection.close()
  }
}

export async function transaction<T>(fn: (connection: oracledb.Connection) => Promise<T>): Promise<T> {
  const pool = await getPool()
  const connection = await pool.getConnection()

  try {
    const result = await fn(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    await connection.close()
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close(0)
    pool = null
    console.log('🔒 Oracle Verbindung geschlossen')
  }
}
```

### 4. SQL-Syntax-Unterschiede (SQLite → Oracle)

| Feature | SQLite | Oracle |
|---------|--------|--------|
| Auto-Increment | `INTEGER PRIMARY KEY AUTOINCREMENT` | `NUMBER GENERATED BY DEFAULT AS IDENTITY` |
| Boolean | `INTEGER` (0/1) | `NUMBER(1)` (0/1) |
| String-Concat | `\|\|` | `\|\|` (identisch) |
| Aktuelles Datum | `CURRENT_TIMESTAMP` | `SYSTIMESTAMP` oder `SYSDATE` |
| LIMIT | `LIMIT n` | `FETCH FIRST n ROWS ONLY` (12c+) |
| Substring | `substr(col, start, len)` | `SUBSTR(col, start, len)` (identisch) |
| Text-Typ | `TEXT` | `VARCHAR2(4000)` oder `CLOB` |
| UPSERT | `INSERT OR REPLACE` | `MERGE` Statement |
| Tabellen-Alias | `table t` | `table t` (identisch) |

### 5. Oracle-spezifische Besonderheiten

**Sequenzen für IDs (vor Oracle 12c):**
```sql
CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;

-- Trigger für Auto-Increment
CREATE OR REPLACE TRIGGER users_bi
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  SELECT users_seq.NEXTVAL INTO :NEW.id FROM DUAL;
END;
```

**MERGE für Upsert:**
```sql
MERGE INTO carryover c
USING (SELECT :userId AS userId, :year AS year FROM DUAL) src
ON (c.userId = src.userId AND c.year = src.year)
WHEN MATCHED THEN
  UPDATE SET calculatedDays = :days, status = 'pending'
WHEN NOT MATCHED THEN
  INSERT (userId, year, calculatedDays, status)
  VALUES (:userId, :year, :days, 'pending');
```

---

## Code-Anpassungen

### Zentrale Änderungen

1. **Abstraktion der Datenbankschicht**

Erstellen Sie ein Interface für alle Datenbankoperationen:

```typescript
// server/utils/db-interface.ts
export interface DatabaseAdapter {
  query<T>(sql: string, params?: any[]): Promise<T[]>
  queryOne<T>(sql: string, params?: any[]): Promise<T | null>
  run(sql: string, params?: any[]): Promise<{ rowsAffected: number; insertId?: number }>
  transaction<T>(fn: (context: any) => Promise<T>): Promise<T>
  close(): Promise<void>
}

// Factory-Funktion
export function createDatabaseAdapter(type: 'sqlite' | 'mssql' | 'oracle'): DatabaseAdapter {
  switch (type) {
    case 'mssql':
      return require('./db-mssql').default
    case 'oracle':
      return require('./db-oracle').default
    default:
      return require('./db-sqlite').default
  }
}
```

2. **Konfiguration über Umgebungsvariable**

```env
# In .env
DATABASE_TYPE=sqlite  # oder 'mssql' oder 'oracle'
```

```typescript
// server/utils/db.ts
import { createDatabaseAdapter } from './db-interface'

const dbType = (process.env.DATABASE_TYPE || 'sqlite') as 'sqlite' | 'mssql' | 'oracle'
export const db = createDatabaseAdapter(dbType)
```

3. **SQL-Query-Transformation**

```typescript
// server/utils/sql-transformer.ts
export function transformSQL(sql: string, targetDB: 'sqlite' | 'mssql' | 'oracle'): string {
  let result = sql

  if (targetDB === 'mssql') {
    // || -> + für String-Concatenation
    result = result.replace(/\|\|/g, '+')
    // substr -> SUBSTRING
    result = result.replace(/substr\s*\(/gi, 'SUBSTRING(')
    // LIMIT -> TOP (einfache Fälle)
    result = result.replace(/LIMIT\s+(\d+)/gi, 'TOP $1')
  }

  if (targetDB === 'oracle') {
    // LIMIT -> FETCH FIRST
    result = result.replace(/LIMIT\s+(\d+)/gi, 'FETCH FIRST $1 ROWS ONLY')
    // TEXT -> VARCHAR2
    result = result.replace(/\bTEXT\b/gi, 'VARCHAR2(4000)')
  }

  return result
}
```

### Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `server/utils/db.ts` | Abstraktion hinzufügen |
| `server/api/**/*.ts` | `db.prepare().all()` → `await query()` |
| `server/database/db.ts` | Wrapper anpassen |
| Alle API-Endpoints | Synchron → Async umstellen |

---

## Migrations-Skripte

Die Migrations-Skripte finden Sie in separaten Dateien:

- **MS SQL Server:** `MIGRATION_SCRIPTS_MSSQL.sql`
- **Oracle Database:** `MIGRATION_SCRIPTS_ORACLE.sql`

### Daten-Migration

```typescript
// scripts/migrate-data.ts
import { db as sqliteDb } from '../server/utils/db-sqlite'
import { db as targetDb } from '../server/utils/db-target'

async function migrateData() {
  console.log('📦 Starte Datenmigration...')

  // 1. Users migrieren
  const users = sqliteDb.prepare('SELECT * FROM users').all()
  for (const user of users) {
    await targetDb.run(`
      INSERT INTO users (username, password, firstName, lastName, role, vacationDays, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [user.username, user.password, user.firstName, user.lastName, user.role, user.vacationDays, user.isActive, user.createdAt])
  }
  console.log(`✅ ${users.length} Users migriert`)

  // 2. Organization migrieren
  const org = sqliteDb.prepare('SELECT * FROM organization').all()
  for (const o of org) {
    await targetDb.run(`
      INSERT INTO organization (userId, teamleadId, createdAt)
      VALUES (?, ?, ?)
    `, [o.userId, o.teamleadId, o.createdAt])
  }
  console.log(`✅ ${org.length} Organization-Einträge migriert`)

  // 3. Vacation Requests migrieren
  const requests = sqliteDb.prepare('SELECT * FROM vacation_requests').all()
  for (const r of requests) {
    await targetDb.run(`
      INSERT INTO vacation_requests (userId, displayName, startDate, endDate, reason, status, cancelReason, createdAt, teamleadApprovalDate, managerApprovalDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [r.userId, r.displayName, r.startDate, r.endDate, r.reason, r.status, r.cancelReason, r.createdAt, r.teamleadApprovalDate, r.managerApprovalDate])
  }
  console.log(`✅ ${requests.length} Urlaubsanträge migriert`)

  // 4. Carryover migrieren
  const carryovers = sqliteDb.prepare('SELECT * FROM carryover').all()
  for (const c of carryovers) {
    await targetDb.run(`
      INSERT INTO carryover (userId, year, calculatedDays, approvedDays, reason, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [c.userId, c.year, c.calculatedDays, c.approvedDays, c.reason, c.status, c.createdAt])
  }
  console.log(`✅ ${carryovers.length} Carryover-Einträge migriert`)

  // 5. Half Day Rules migrieren
  const halfDays = sqliteDb.prepare('SELECT * FROM half_day_rules').all()
  for (const h of halfDays) {
    await targetDb.run(`
      INSERT INTO half_day_rules (date, description, createdAt)
      VALUES (?, ?, ?)
    `, [h.date, h.description, h.createdAt])
  }
  console.log(`✅ ${halfDays.length} Halbtags-Regeln migriert`)

  // 6. Vacation Exceptions migrieren
  const exceptions = sqliteDb.prepare('SELECT * FROM vacation_exceptions').all()
  for (const e of exceptions) {
    await targetDb.run(`
      INSERT INTO vacation_exceptions (vacationRequestId, userId, date, deduction, reason, createdBy, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [e.vacationRequestId, e.userId, e.date, e.deduction, e.reason, e.createdBy, e.createdAt])
  }
  console.log(`✅ ${exceptions.length} Vacation-Exceptions migriert`)

  console.log('🎉 Datenmigration abgeschlossen!')
}

migrateData().catch(console.error)
```

---

## Testplan

### 1. Unit-Tests für Datenbankschicht

```typescript
// tests/db-adapter.test.ts
describe('Database Adapter', () => {
  it('should insert and retrieve users', async () => {
    const result = await db.run('INSERT INTO users ...', params)
    expect(result.insertId).toBeDefined()

    const user = await db.queryOne('SELECT * FROM users WHERE id = ?', [result.insertId])
    expect(user).toBeDefined()
  })

  it('should handle transactions', async () => {
    await db.transaction(async (ctx) => {
      await ctx.run('INSERT INTO users ...')
      await ctx.run('INSERT INTO organization ...')
    })
  })
})
```

### 2. Integrationstests

- [ ] Login/Logout funktioniert
- [ ] Urlaubsantrag erstellen
- [ ] Urlaubsantrag genehmigen (Teamleiter)
- [ ] Urlaubsantrag genehmigen (Manager)
- [ ] Urlaubsantrag ablehnen
- [ ] Urlaubsantrag stornieren
- [ ] Benutzer erstellen/bearbeiten
- [ ] Jahreswechsel durchführen
- [ ] Resturlaub übertragen
- [ ] Berichte generieren

### 3. Performance-Tests

```bash
# Ladezeiten messen
npm run test:performance

# Erwartete Ergebnisse:
# - Seitenaufbau: < 500ms
# - API-Anfragen: < 200ms
# - PDF-Generierung: < 3s
```

---

## Checkliste für Migration

- [ ] Backup der SQLite-Datenbank erstellen
- [ ] Ziel-Datenbank installieren und konfigurieren
- [ ] Migrations-Skripte ausführen (Schema)
- [ ] Daten migrieren
- [ ] Umgebungsvariablen konfigurieren
- [ ] Code-Anpassungen durchführen
- [ ] Tests ausführen
- [ ] Performance validieren
- [ ] Rollback-Plan bereithalten

---

## Support

Bei Fragen oder Problemen wenden Sie sich an das Entwicklungsteam.

**Letzte Aktualisierung:** Januar 2026
