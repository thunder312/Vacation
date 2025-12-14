# 🗄️ Datenbank-Struktur erstellen - Komplette Anleitung

## 📋 Voraussetzungen

Stelle sicher, dass du folgende Packages installiert hast:

```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
npm install bcrypt @types/bcrypt
npm install -D tsx
```

## 📁 Schritt 1: Dateien erstellen

Erstelle folgende Dateien in deinem Projekt:

### **1. Datenbank-Verbindung**
**Datei:** `/server/database/db.ts`
- Inhalt: Siehe heruntergeladene `db.ts`

### **2. Schema-Definition**
**Datei:** `/server/database/schema.ts`
- Inhalt: Siehe heruntergeladene `schema.ts`

### **3. Seed-Daten**
**Datei:** `/server/database/seed.ts`
- Inhalt: Siehe heruntergeladene `seed.ts`

### **4. Nitro Plugin (Auto-Init)**
**Datei:** `/server/plugins/database.ts`
- Inhalt: Siehe heruntergeladene `database.ts`

### **5. Scripts**
**Ordner:** `/scripts/`
- `test-db.ts` - Zum Testen
- `seed-db.ts` - Zum Seeden
- `reset-db.ts` - Zum Reset

## 📝 Schritt 2: package.json erweitern

Füge in deine `package.json` unter `"scripts"` hinzu:

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "db:test": "tsx scripts/test-db.ts",
    "db:seed": "tsx scripts/seed-db.ts",
    "db:reset": "tsx scripts/reset-db.ts"
  }
}
```

## 🚀 Schritt 3: Datenbank initialisieren

### **Variante A: Automatisch beim Server-Start**

Die Datenbank wird automatisch initialisiert wenn du den Server startest:

```bash
npm run dev
```

✅ Das Nitro Plugin (`/server/plugins/database.ts`) erstellt die Tabellen automatisch!

**Ausgabe in der Konsole:**
```
🚀 Initialisiere Datenbank...
✅ SQLite Datenbank verbunden: /pfad/zum/projekt/server/database/sqlite.db
✅ Datenbank-Schema initialisiert
✅ Datenbank bereit
```

### **Variante B: Manuell mit Script**

Oder erstelle die Datenbank manuell:

```bash
npm run db:test
```

## 🌱 Schritt 4: Datenbank mit Seed-Daten füllen

### **Erste Initialisierung (empfohlen):**

```bash
npm run db:reset
```

**Was passiert:**
1. ✅ Löscht alle bestehenden Tabellen
2. ✅ Erstellt alle Tabellen neu
3. ✅ Füllt Datenbank mit Seed-Daten (16 User, 5 Anträge, etc.)

**Ausgabe:**
```
🔄 Setze Datenbank zurück...
🗑️ Alle Tabellen gelöscht
✅ Datenbank-Schema initialisiert
🌱 Starte Seed-Prozess...
👥 Erstelle Benutzer...
   ✅ 16 Benutzer erstellt
🏢 Erstelle Organigramm-Zuordnungen...
   ✅ 16 Zuordnungen erstellt
🏖️ Erstelle Urlaubsanträge...
   ✅ 5 Urlaubsanträge erstellt
⏰ Erstelle Halbtags-Regelungen...
   ✅ 2 Halbtags-Regelungen erstellt
📊 Erstelle Übertragstage...
   ✅ 2 Übertragstage erstellt
✅ Seed-Prozess abgeschlossen!
```

### **Nur Seeden (wenn DB bereits existiert):**

```bash
npm run db:seed
```

⚠️ Überspringt automatisch wenn bereits Daten vorhanden sind!

## 🧪 Schritt 5: Testen

Teste die Datenbank-Verbindung:

```bash
npm run db:test
```

**Erwartete Ausgabe:**
```
🧪 Teste Datenbank-Verbindung...
✅ Datenbank-Verbindung erfolgreich
✅ Schema initialisiert

📋 Vorhandene Tabellen:
  - carryover
  - half_day_rules
  - organization
  - users
  - vacation_requests

📊 Datenbank-Statistiken:
  Benutzer: 16
  Urlaubsanträge: 5
  Halbtags-Regelungen: 2
  Überträge: 2
  Org-Zuordnungen: 16

✅ Datenbank-Test erfolgreich!
```

## 📊 Schritt 6: Datenbank prüfen

Die SQLite-Datei wird erstellt unter:
```
/server/database/sqlite.db
```

### **Mit SQLite Browser öffnen (optional):**

1. Download: https://sqlitebrowser.org/
2. Öffne: `server/database/sqlite.db`
3. Sieh dir Tabellen und Daten an

### **Oder mit Command Line:**

```bash
# In das Verzeichnis wechseln
cd server/database

# SQLite öffnen
sqlite3 sqlite.db

# Tabellen anzeigen
.tables

# User anzeigen
SELECT * FROM users;

# Beenden
.quit
```

## 🎯 Schnell-Setup (Alles auf einmal)

```bash
# 1. Packages installieren
npm install better-sqlite3 bcrypt
npm install -D @types/better-sqlite3 @types/bcrypt tsx

# 2. Alle Dateien erstellen (siehe Schritt 1)

# 3. Scripts in package.json hinzufügen

# 4. Datenbank initialisieren & seeden
npm run db:reset

# 5. Server starten
npm run dev

# 6. Fertig! 🎉
```

## ✅ Checkliste

- [ ] Packages installiert (`better-sqlite3`, `bcrypt`, `tsx`)
- [ ] Dateien erstellt:
  - [ ] `/server/database/db.ts`
  - [ ] `/server/database/schema.ts`
  - [ ] `/server/database/seed.ts`
  - [ ] `/server/plugins/database.ts`
  - [ ] `/scripts/test-db.ts`
  - [ ] `/scripts/seed-db.ts`
  - [ ] `/scripts/reset-db.ts`
- [ ] Scripts in `package.json` hinzugefügt
- [ ] `npm run db:reset` ausgeführt
- [ ] `npm run db:test` erfolgreich
- [ ] Server läuft: `npm run dev`
- [ ] Login funktioniert: http://localhost:3000/login

## 🗄️ Ergebnis

Nach diesen Schritten hast du:

✅ **5 Tabellen:**
- `users` (16 Benutzer mit gehashten Passwörtern)
- `vacation_requests` (5 Urlaubsanträge)
- `organization` (16 Team-Zuordnungen)
- `half_day_rules` (2 Halbtage)
- `carryover` (2 Überträge)

✅ **Datenbank-Datei:**
- `/server/database/sqlite.db`

✅ **Funktioniert:**
- Login mit `Mustermann` / `password123`
- Alle Features nutzen die Datenbank

## 🔧 Troubleshooting

### **Problem: "Cannot find module 'better-sqlite3'"**
```bash
npm install better-sqlite3
```

### **Problem: "Cannot find module 'bcrypt'"**
```bash
npm install bcrypt
```

### **Problem: "Command 'tsx' not found"**
```bash
npm install -D tsx
```

### **Problem: Datenbank ist leer**
```bash
npm run db:reset
```

### **Problem: "Database is locked"**
```bash
# Server stoppen
# Dann:
rm server/database/sqlite.db
npm run db:reset
```

## 🎉 Fertig!

Deine Datenbank ist jetzt einsatzbereit! 🚀

**Test Login:**
- URL: http://localhost:3000/login
- User: `Mustermann`
- Passwort: `password123`
