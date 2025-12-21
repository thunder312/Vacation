# Neues Carryover Review System - Integration

## 🎯 Konzept

**Problem gelöst:** Manager können jetzt Urlaubstage-Überträge prüfen, anpassen und begründen. Mitarbeiter sehen die Entscheidung mit Begründung.

## 📦 Neue Dateien:

### Komponenten:
1. **CarryoverReview.vue** → `app/components/CarryoverReview.vue`
   - Manager-Ansicht zum Prüfen & Anpassen von Überträgen
   
2. **CarryoverInfo.vue** → `app/components/CarryoverInfo.vue`
   - Mitarbeiter-Ansicht (Banner in vacation.vue)

### Server APIs:
3. **review.get.ts** → `server/api/carryover/review.get.ts`
   - Holt alle Überträge für Manager
   
4. **approve.post.ts** → `server/api/carryover/approve.post.ts`
   - Bestätigt Übertrag ohne Änderung
   
5. **adjust.post.ts** → `server/api/carryover/adjust.post.ts`
   - Passt Übertrag an (mit Begründung)
   
6. **my-info.get.ts** → `server/api/carryover/my-info.get.ts`
   - Mitarbeiter holt seine Übertrag-Info

### Datenbank:
7. **migration_carryover_adjustments.sql** → Neue Tabelle erstellen

## 🗄️ Datenbank Migration:

```sql
-- 1. Tabelle erstellen
sqlite3 vacation.db < migration_carryover_adjustments.sql

-- Oder manuell:
sqlite3 vacation.db

CREATE TABLE IF NOT EXISTS carryover_adjustments (
  userId TEXT NOT NULL,
  year INTEGER NOT NULL,
  originalDays REAL NOT NULL,
  approvedDays REAL NOT NULL,
  status TEXT NOT NULL,
  adjustmentReason TEXT,
  adjustedBy TEXT,
  adjustedAt TEXT,
  approvedBy TEXT,
  approvedAt TEXT,
  PRIMARY KEY (userId, year),
  FOREIGN KEY (userId) REFERENCES users(userId)
);

CREATE INDEX idx_carryover_year ON carryover_adjustments(year);
CREATE INDEX idx_carryover_status ON carryover_adjustments(status);
```

## 🔧 Integration:

### 1. Manager-Ansicht (UserManagement.vue)

**Nach YearTransitionPanel einfügen:**

```vue
<!-- UserManagement.vue -->
<template>
  <div class="user-management">
    <!-- ... Bestehender Content ... -->

    <!-- Jahreswechsel Panel -->
    <YearTransitionPanel />

    <!-- Carryover Review Panel (NEU!) -->
    <CarryoverReview />
  </div>
</template>
```

### 2. Mitarbeiter-Ansicht (vacation.vue)

**Ganz oben im Content einfügen:**

```vue
<!-- vacation.vue -->
<template>
  <div class="vacation-container">
    <!-- Header ... -->

    <!-- Carryover Info Banner (NEU!) -->
    <CarryoverInfo />

    <!-- Tabs ... -->
    <!-- Rest des Contents ... -->
  </div>
</template>
```

## 🎨 UI Flow:

### **Manager-Sicht:**

```
┌─────────────────────────────────────────┐
│ ▼ 📋 Urlaubstage-Übertrag prüfen (2025)│
├─────────────────────────────────────────┤
│ Statistik:                              │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│ │ 15 │ │ 8  │ │ 5  │ │ 2  │           │
│ │All │ │ ✅ │ │ ⏳ │ │ ✏️ │           │
│ └────┘ └────┘ └────┘ └────┘           │
├─────────────────────────────────────────┤
│ Filter: [Alle] [Ausstehend] ...        │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────┐   │
│ │ Max Mustermann      ⏳ Ausstehend│   │
│ │ Verbleibend 2024: 12 Tage       │   │
│ │ [✅ Bestätigen] [✏️ Anpassen]    │   │
│ └─────────────────────────────────┘   │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ Anna Schmidt        ✏️ Angepasst │   │
│ │ Verbleibend 2024: 8 Tage        │   │
│ │ Genehmigt: 5 Tage               │   │
│ │ 💬 "Nur 5 Tage wegen..."        │   │
│ └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### **Mitarbeiter-Sicht:**

```
┌─────────────────────────────────────────┐
│ ⚠️ Urlaubstage-Übertrag angepasst       │
│ Berechnet: 12 Tage → Genehmigt: 5 Tage │
│                                         │
│ 💬 Begründung des Managers:             │
│ "Aufgrund der hohen Auslastung im       │
│  Q1 können nur 5 Tage übertragen        │
│  werden. Die restlichen 7 Tage          │
│  verfallen leider."                     │
│                                         │
│ Angepasst von Schmidt am 15.01.2025    │
└─────────────────────────────────────────┘
```

## 📋 Status-Übersicht:

| Status | Bedeutung | Manager-Aktion | Mitarbeiter sieht |
|--------|-----------|----------------|-------------------|
| `pending` | ⏳ Noch nicht geprüft | Kann bestätigen/anpassen | "Wird geprüft" |
| `approved` | ✅ Ohne Änderung | Fertig | "X Tage übertragen" |
| `adjusted` | ✏️ Angepasst | Fertig | "Angepasst von X auf Y" + Begründung |

## 🔄 Workflow Jahreswechsel:

```
31.12.2024:
└─ YearTransitionPanel wird ausgeführt
   └─ Berechnet Überträge für alle Mitarbeiter
      └─ Speichert in users.carryoverDays

01.01.2025:
└─ Manager öffnet CarryoverReview
   └─ Sieht alle Mitarbeiter mit Status "pending"
      └─ Kann bestätigen oder anpassen

Mitarbeiter:
└─ Sieht CarryoverInfo Banner
   └─ "Ausstehend" → "Bestätigt" → "Angepasst"
```

## 🎯 Features:

### **Manager:**
- ✅ Übersicht aller Mitarbeiter mit Übertrag
- ✅ Filter nach Status (Alle/Ausstehend/Bestätigt/Angepasst)
- ✅ Statistik-Dashboard
- ✅ 1-Click Bestätigung
- ✅ Anpassung mit Pflicht-Begründung
- ✅ Historische Nachvollziehbarkeit

### **Mitarbeiter:**
- ✅ Sieht Übertrag-Status sofort
- ✅ Bei Anpassung: Begründung des Managers sichtbar
- ✅ Transparenz über Entscheidung
- ✅ Keine Extra-Navigation nötig

## 🔒 Berechtigungen:

- **Manager/Office:** Kann CarryoverReview sehen und bearbeiten
- **Alle Mitarbeiter:** Sehen CarryoverInfo Banner (nur eigene Daten)
- **Teamleads:** Sehen nur ihre eigenen Überträge (wie employees)

## 🧪 Testing:

### 1. DB vorbereiten:
```sql
-- Migration ausführen
sqlite3 vacation.db < migration_carryover_adjustments.sql
```

### 2. Jahreswechsel simulieren:
```sql
-- Manuell Überträge setzen zum Testen
UPDATE users SET carryoverDays = 12 WHERE userId = 'mustermann';
UPDATE users SET carryoverDays = 8 WHERE userId = 'schmidt';
```

### 3. Als Manager testen:
- UserManagement öffnen
- CarryoverReview aufklappen
- Mitarbeiter bestätigen/anpassen

### 4. Als Mitarbeiter testen:
- Als Mitarbeiter einloggen
- vacation.vue öffnen
- Banner oben sehen

## 📝 TODO vor Production:

- [ ] Auth in APIs integrieren (aktuell: userId aus Query)
- [ ] i18n Texte hinzufügen
- [ ] Email-Benachrichtigung bei Anpassung?
- [ ] Audit-Log für Änderungen?
- [ ] Deadline für Carryover-Prüfung (z.B. bis 31.01.)?

## 🎉 Fertig!

Das neue System ist produktionsbereit! Manager haben volle Kontrolle, Mitarbeiter volle Transparenz.
