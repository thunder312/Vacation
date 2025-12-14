# Schritt 3: Seed-Daten erstellen ✅

## 📦 Zusätzliches Package installieren

```bash
npm install -D tsx
```

**tsx** = TypeScript-Runner für Scripts

## 📄 Erstellte Dateien

1. **`/server/database/seed.ts`** - Seed-Logik
2. **`/scripts/seed-db.ts`** - Seed ausführen
3. **`/scripts/reset-db.ts`** - DB zurücksetzen + neu seeden
4. **`/package-scripts.json`** - NPM Scripts (in package.json einfügen)

## 🌱 Was wird geseeded?

### 1. **16 Benutzer** (Passwörter gehashed!)
- 2 Manager (admin, Schulz)
- 1 Office (Meyer)
- 3 Teamleads (Mueller, Weber, Fischer)
- 10 Employees

### 2. **16 Org-Zuordnungen**
- Team Mueller: Mustermann, Schmidt, Schneider
- Team Weber: Becker, Hoffmann, Koch
- Team Fischer: Bauer, Richter, Klein, Wolf

### 3. **5 Urlaubsanträge**
- Mustermann: 3 genehmigte + 1 pending
- Schmidt: 1 teamlead_approved

### 4. **2 Halbtags-Regelungen**
- Heiligabend (24.12.2025)
- Silvester (31.12.2025)

### 5. **2 Übertragstage**
- Mustermann: 8 Tage (kein Ablauf)
- Schmidt: 3 Tage (Ablauf 31.03.2025)

## 🚀 Verwendung

### Scripts in package.json einfügen:

Öffne deine `package.json` und füge unter `"scripts"` hinzu:

```json
"db:test": "tsx scripts/test-db.ts",
"db:seed": "tsx scripts/seed-db.ts",
"db:reset": "tsx scripts/reset-db.ts"
```

### Datenbank initialisieren & seeden:

```bash
# 1. Datenbank komplett neu aufsetzen
npm run db:reset

# Oder: Nur seeden (falls DB schon existiert)
npm run db:seed

# Testen
npm run db:test
```

## 📊 Erwartete Ausgabe

```
🌱 Starte Seed-Prozess...
👥 Erstelle Benutzer...
   ✅ 16 Benutzer erstellt
🏢 Erstelle Organigramm-Zuordnungen...
   ✅ 16 Zuordnungen erstellt
🏖️  Erstelle Urlaubsanträge...
   ✅ 5 Urlaubsanträge erstellt
⏰ Erstelle Halbtags-Regelungen...
   ✅ 2 Halbtags-Regelungen erstellt
📊 Erstelle Übertragstage...
   ✅ 2 Übertragstage erstellt

✅ Seed-Prozess abgeschlossen!
📊 Datenbank-Zusammenfassung:
   - 16 Benutzer
   - 16 Org-Zuordnungen
   - 5 Urlaubsanträge
   - 2 Halbtags-Regelungen
   - 2 Übertragstage
```

## 🔐 Sicherheit

**Wichtig:** Alle Passwörter werden mit **bcrypt** gehashed gespeichert!

**Original-Passwörter** (nur für Development):
- admin: `geheim123`
- Schulz: `manager123`
- Meyer: `office123`
- Mueller: `teamleiter1`
- Mustermann: `password123`
- etc.

**In der DB:** `$2b$10$...` (gehashed)

## ⚠️ Wichtige Hinweise

1. **db:seed** überspringt automatisch wenn Daten vorhanden
2. **db:reset** löscht ALLE Daten und erstellt neu
3. Passwörter werden automatisch gehashed
4. Foreign Keys sind aktiviert (Konsistenz garantiert)

## 🎯 Nächster Schritt

Nach erfolgreichem Seeding:
- ✅ Datenbank läuft
- ✅ Tabellen erstellt
- ✅ Daten importiert

**Weiter zu Schritt 4:** API-Routes erstellen! 🔌
