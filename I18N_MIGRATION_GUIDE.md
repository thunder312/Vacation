# i18n Migration Guide - Mehrsprachigkeit

Die Software ist jetzt vorbereitet für Mehrsprachigkeit (Deutsch & Englisch).

## 📂 Dateien erstellt:

### 1. Übersetzungsdateien
```
app/
  config/
    i18n/
      de.ts          ← Deutsche Übersetzungen
      en.ts          ← Englische Übersetzungen
```

### 2. Composable
```
app/
  composables/
    useI18n.ts       ← i18n Hook für Komponenten
```

### 3. Komponente
```
app/
  components/
    LanguageSwitcher.vue  ← Sprachwechsel-Button
```

---

## 🚀 Verwendung in Komponenten

### Vorher (Hardcoded):
```vue
<template>
  <h1>Urlaubsverwaltung</h1>
  <button>Speichern</button>
  <p>{{ user.vacationDays }} Tage</p>
</template>
```

### Nachher (Mehrsprachig):
```vue
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <h1>{{ t('vacation.title') }}</h1>
  <button>{{ t('common.save') }}</button>
  <p>{{ user.vacationDays }} {{ t('common.days') }}</p>
</template>
```

---

## 📋 Schritt-für-Schritt Migration

### Schritt 1: Dateien kopieren
```
de.ts              → app/config/i18n/de.ts
en.ts              → app/config/i18n/en.ts
useI18n.ts         → app/composables/useI18n.ts
LanguageSwitcher.vue → app/components/LanguageSwitcher.vue
```

### Schritt 2: Language Switcher einbinden
In `vacation-updated.vue` (oder Layout):
```vue
<template>
  <div class="header">
    <!-- Bestehende Header-Elemente -->
    <LanguageSwitcher />  <!-- NEU -->
  </div>
</template>
```

### Schritt 3: Texte in Komponenten ersetzen

#### Beispiel: login.vue
**Vorher:**
```vue
<template>
  <h1>Login</h1>
  <label>Benutzername</label>
  <input placeholder="Benutzername eingeben" />
  <button>Anmelden</button>
</template>
```

**Nachher:**
```vue
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <h1>{{ t('login.title') }}</h1>
  <label>{{ t('login.username') }}</label>
  <input :placeholder="t('login.usernamePlaceholder')" />
  <button>{{ t('login.loginButton') }}</button>
</template>
```

---

## 🔑 Übersetzungsschlüssel

### Häufig verwendete Schlüssel:

```typescript
// Allgemein
t('common.save')           // Speichern / Save
t('common.cancel')         // Abbrechen / Cancel
t('common.edit')           // Bearbeiten / Edit
t('common.delete')         // Löschen / Delete
t('common.days')           // Tage / Days

// Navigation
t('nav.vacation')          // Urlaub / Vacation
t('nav.organization')      // Organigramm / Organization Chart
t('nav.users')             // Benutzerverwaltung / User Management
t('nav.logout')            // Abmelden / Logout

// Login
t('login.title')           // Login / Login
t('login.username')        // Benutzername / Username
t('login.password')        // Passwort / Password

// Rollen
t('roles.employee')        // Mitarbeiter / Employee
t('roles.teamlead')        // Teamleiter / Team Lead
t('roles.manager')         // Manager / Manager
t('roles.office')          // Office / Office
t('roles.sysadmin')        // System-Admin / System Admin

// Status
t('status.active')         // Aktiv / Active
t('status.pending')        // Ausstehend / Pending
t('status.approved')       // Genehmigt / Approved
t('status.rejected')       // Abgelehnt / Rejected

// Urlaub
t('vacation.title')                // Urlaubsverwaltung / Vacation Management
t('vacation.requestVacation')      // Urlaub beantragen / Request Vacation
t('vacation.vacationDays')         // Urlaubstage / Vacation Days
t('vacation.approve')              // Genehmigen / Approve
t('vacation.reject')               // Ablehnen / Reject

// Benutzer
t('users.title')                   // Benutzerverwaltung / User Management
t('users.addUser')                 // Mitarbeiter hinzufügen / Add Employee
t('users.firstName')               // Vorname / First Name
t('users.lastName')                // Nachname / Last Name
```

---

## 🎨 Interpolation (Variablen in Übersetzungen)

```vue
<script setup>
const { t } = useI18n()
const userName = 'Max Mustermann'
</script>

<template>
  <!-- Mit Variablen -->
  <p>{{ t('pdf.totalPages', { current: 1, total: 5 }) }}</p>
  <!-- Ergebnis DE: "Seite 1/5" -->
  <!-- Ergebnis EN: "Page 1/5" -->
  
  <p>{{ t('confirm.resetPasswordMessage', { name: userName }) }}</p>
  <!-- Ergebnis DE: "Passwort für Max Mustermann zurücksetzen?" -->
  <!-- Ergebnis EN: "Reset password for Max Mustermann?" -->
</template>
```

---

## 🔄 Sprache programmatisch wechseln

```vue
<script setup>
const { setLocale } = useI18n()

const switchToEnglish = () => {
  setLocale('en')
}

const switchToGerman = () => {
  setLocale('de')
}
</script>
```

---

## 📝 Neue Übersetzungen hinzufügen

### In de.ts:
```typescript
export const de = {
  myNewSection: {
    title: 'Mein neuer Bereich',
    description: 'Dies ist eine Beschreibung'
  }
}
```

### In en.ts:
```typescript
export const en = {
  myNewSection: {
    title: 'My New Section',
    description: 'This is a description'
  }
}
```

### Verwendung:
```vue
<template>
  <h1>{{ t('myNewSection.title') }}</h1>
  <p>{{ t('myNewSection.description') }}</p>
</template>
```

---

## 🌍 Weitere Sprachen hinzufügen

### 1. Neue Übersetzungsdatei erstellen:
```typescript
// app/config/i18n/fr.ts
import type { Translation } from './de'

export const fr: Translation = {
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    // ...
  }
}
```

### 2. In useI18n.ts registrieren:
```typescript
import { fr } from '~/config/i18n/fr'

type Locale = 'de' | 'en' | 'fr'  // Erweitern

const translations = { de, en, fr }  // Hinzufügen

const availableLocales = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }  // NEU
]
```

---

## ✅ Migrations-Checkliste

Zu migrierende Dateien (Beispiele):

- [ ] login.vue
- [ ] vacation-updated.vue
- [ ] UserManagement.vue
- [ ] OrganizationChart.vue
- [ ] VacationApprovalCard.vue
- [ ] usePdfExport.ts (PDF-Texte)
- [ ] dateHelpers.ts (Status-Texte)

**Pro Datei:**
1. [ ] `import { useI18n } from '~/composables/useI18n'` hinzufügen
2. [ ] `const { t } = useI18n()` in script setup
3. [ ] Hardcoded deutsche Texte durch `t('key')` ersetzen
4. [ ] Testen mit beiden Sprachen

---

## 🧪 Testen

1. Language Switcher in Header einbinden
2. Zwischen DE/EN wechseln
3. Alle Bereiche durchklicken:
   - Login
   - Urlaubsverwaltung
   - Organigramm
   - Benutzerverwaltung
4. PDF-Export testen
5. Fehlermeldungen prüfen

---

## 💡 Best Practices

1. **Kurze, beschreibende Keys**: `login.title` statt `loginPageTitleText`
2. **Gruppierung**: Verwandte Übersetzungen zusammen (z.B. alle Login-Texte unter `login.*`)
3. **Konsistenz**: Gleiche Begriffe = gleicher Übersetzungsschlüssel
4. **Keine HTML in Übersetzungen**: HTML-Struktur in Templates, nicht in Übersetzungen
5. **Variablen nutzen**: Für dynamische Inhalte Interpolation verwenden

---

## 🎯 Prioritäten

**Phase 1 (Kritisch):**
- [ ] Login
- [ ] Navigation
- [ ] Haupt-Urlaubsverwaltung

**Phase 2 (Wichtig):**
- [ ] Benutzerverwaltung
- [ ] Organigramm
- [ ] Fehlermeldungen

**Phase 3 (Optional):**
- [ ] PDF-Exports
- [ ] Toast-Nachrichten
- [ ] Bestätigungsdialoge

---

## 🚨 Häufige Probleme

**Problem:** "Translation key not found: xyz"
**Lösung:** Key in de.ts und en.ts hinzufügen

**Problem:** Interpolation funktioniert nicht
**Lösung:** Parameter als Object übergeben: `t('key', { param: value })`

**Problem:** Sprache wechselt nicht
**Lösung:** Prüfen ob `locale` reactive ist (useState verwenden)

---

## 📚 Ressourcen

- Alle Übersetzungsschlüssel: Siehe `de.ts`
- Beispielkomponente: `LanguageSwitcher.vue`
- Composable Dokumentation: `useI18n.ts`
