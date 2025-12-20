# Jahreswechsel-Feature - Integration

## 📦 Dateien erstellt:

1. **useYearTransition.ts** → `app/composables/useYearTransition.ts`
2. **YearTransitionPanel.vue** → `app/components/YearTransitionPanel.vue`

## 🔧 Integration:

### Option 1: In UserManagement.vue einbauen (EMPFOHLEN)

**In UserManagement.vue ganz oben nach dem Titel:**

```vue
<template>
  <div class="user-management">
    <h2>Mitarbeiterverwaltung</h2>

    <!-- Jahreswechsel Panel (NEU) -->
    <YearTransitionPanel v-if="currentUser?.role === 'sysadmin'" />

    <!-- Bestehender Content -->
    <div class="add-user-section">
      <!-- ... -->
    </div>
  </div>
</template>
```

### Option 2: Eigene Admin-Seite erstellen

```vue
<!-- pages/admin.vue -->
<template>
  <div class="admin-page">
    <h1>System-Administration</h1>
    <YearTransitionPanel />
  </div>
</template>

<script setup lang="ts">
const { currentUser } = useAuth()

// Nur SysAdmin darf zugreifen
if (currentUser.value?.role !== 'sysadmin') {
  navigateTo('/')
}
</script>
```

## ✨ Features:

### 1. Status-Anzeige
```
✅ Jahreswechsel durchgeführt
   Jahreswechsel für 2024 bereits abgeschlossen.

⚠️ Jahreswechsel ausstehend!
   Letzter Jahreswechsel: 2023
   Aktuelles Jahr: 2024
```

### 2. Preview-Tabelle
```
┌─────────────┬──────────────────┬──────────────────┐
│ Mitarbeiter │ Aktuell (2023)   │ Neu (2024)       │
├─────────────┼──────────────────┼──────────────────┤
│             │ Std │ Über │ Verbl│ Std │ Über │ Ges │
├─────────────┼─────┼──────┼──────┼─────┼──────┼─────┤
│ Max Muster  │ 30  │  2   │  8   │ 30  │  5   │ 35  │
│ Anna Test   │ 30  │  0   │ -2   │ 30  │  0   │ 30  │
│ John Doe    │ 30  │  3   │ 12   │ 30  │  5   │ 35  │
└─────────────┴─────┴──────┴──────┴─────┴──────┴─────┘
                                           ↑
                                    Max 5 Tage Übertrag
```

### 3. Sicherheits-Features
- ✅ Preview vor Ausführung
- ✅ Bestätigungs-Dialog
- ✅ Nur SysAdmin kann durchführen
- ✅ Kann nur einmal pro Jahr ausgeführt werden
- ✅ Speichert letzten Durchführungszeitpunkt

## 🎯 Ablauf beim Jahreswechsel:

**Für jeden Mitarbeiter:**

1. **Berechne verbleibende Tage (2023):**
   ```
   Gesamt = 30 (Standard) + 2 (Übertrag) = 32 Tage
   Genommen = 24 Tage
   Verbleibend = 32 - 24 = 8 Tage
   ```

2. **Berechne Übertrag für 2024:**
   ```
   Übertrag = Min(8, 5) = 5 Tage
   (Maximal 5 Tage werden übertragen)
   ```

3. **Setze neue Werte:**
   ```sql
   UPDATE users 
   SET carryoverDays = 5
   WHERE userId = 'max.muster'
   ```

4. **Ergebnis 2024:**
   ```
   Standard: 30 Tage
   Übertrag: 5 Tage
   Gesamt: 35 Tage
   ```

## ⚙️ Konfiguration:

### Maximaler Übertrag ändern:

In `useYearTransition.ts` Zeile 82 und 140:

```typescript
const MAX_CARRYOVER = 5  // ← Hier anpassen (z.B. 10 Tage)
```

### Datenbank-Schema:

Neue Tabelle wird automatisch erstellt:

```sql
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
)
```

## 🧪 Testen:

### 1. Preview testen:
```
1. Als SysAdmin einloggen
2. Zu Benutzerverwaltung gehen
3. "Jahreswechsel-Preview anzeigen" klicken
4. Prüfen ob Berechnungen korrekt sind
5. "Abbrechen" klicken (nichts wird geändert)
```

### 2. Ausführung testen (Vorsicht!):
```
1. Backup der Datenbank erstellen!
2. Preview öffnen
3. "Jahreswechsel durchführen" klicken
4. Bestätigen
5. Prüfen ob Werte korrekt aktualisiert wurden
```

## 📅 Wann durchführen?

**Empfohlener Zeitpunkt:** 01.01. oder kurz davor

**Checkliste vor Durchführung:**
- [ ] Backup der Datenbank erstellt
- [ ] Alle Urlaubsanträge für altes Jahr genehmigt/abgelehnt
- [ ] Preview geprüft
- [ ] Mitarbeiter informiert

## 🔒 Sicherheit:

- **Nur SysAdmin:** Nur Rolle 'sysadmin' sieht die Komponente
- **Einmal pro Jahr:** System verhindert mehrfache Ausführung
- **Transaction:** Alle Updates in einer DB-Transaction (Rollback bei Fehler)
- **Bestätigung:** Doppelte Bestätigung erforderlich

## 🐛 Troubleshooting:

**Problem:** "Tabelle system_settings existiert nicht"
**Lösung:** Wird beim ersten Jahreswechsel automatisch erstellt

**Problem:** "Jahreswechsel bereits durchgeführt"
**Lösung:** Manuell in DB zurücksetzen (nur für Tests):
```sql
DELETE FROM system_settings WHERE key = 'last_year_transition';
```

**Problem:** "Falsche Berechnungen"
**Lösung:** Prüfe vacation_requests Status und Datumsformat

## 📝 Beispiel-Workflow:

```
31.12.2024 - Vorbereitung:
└─ SysAdmin öffnet Preview
   └─ Prüft alle Mitarbeiter
      └─ Alles OK? → Wartet bis 01.01.

01.01.2025 - Durchführung:
└─ SysAdmin führt Jahreswechsel durch
   └─ System aktualisiert alle Mitarbeiter
      └─ Mitarbeiter haben neue Urlaubstage
         └─ Alte Daten bleiben erhalten (Historie)

02.01.2025 - Normal:
└─ Mitarbeiter sehen aktualisierte Kontingente
   └─ Neue Urlaubsanträge für 2025 möglich
```

## 🎉 Fertig!

Der Jahreswechsel ist jetzt implementiert und einsatzbereit!
