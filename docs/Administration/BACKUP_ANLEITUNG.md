# Datenbank Backup & Restore

## Backup erstellen
1. Im Admin-Panel auf "Backup erstellen" klicken
2. SQL-Datei wird heruntergeladen (z.B. `vacation-backup-2025-12-27.sql`)

## Backup wiederherstellen

### Option 1: Über SQLite CLI
```bash
# 1. Application stoppen
npm stop

# 2. Alte Datenbank sichern (optional)
cp server/database/sqlite.db server/database/sqlite.db.old

# 3. Neue leere Datenbank erstellen
rm server/database/sqlite.db
sqlite3 server/database/sqlite.db < vacation-backup-2025-12-27.sql

# 4. Application starten
npm run dev
```

### Option 2: Über DB Browser
1. DB Browser for SQLite öffnen
2. Neue Datenbank erstellen
3. File → Import → SQL ausführen
4. Backup-SQL-Datei auswählen
5. Als `sqlite.db` speichern

## Was enthält das Backup?
- ✅ Alle User (mit Passwörtern)
- ✅ Alle Urlaubsanträge
- ✅ Organization (Team-Zuordnungen)
- ✅ Carryover (Übertragene Urlaubstage)
- ✅ Half Day Rules (Halbtags-Regelungen)

## Format
Das Backup ist eine ausführbare SQL-Datei mit:
- CREATE TABLE Statements
- INSERT Statements für alle Daten
- PRAGMA Anweisungen
- Transaktionen für Sicherheit
