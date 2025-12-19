# Icon-Inventar und Anpassungsanleitung

Alle Icons und Symbole in der Urlaubsverwaltung Software.

## 📂 Übersicht der verwendeten Icons

### 1. **Rollen-Icons (Organigramm)**

| Icon | Verwendung | Datei | Zeile | Beschreibung |
|------|-----------|-------|-------|--------------|
| 👔 | Manager | OrganizationChart.vue | ~14 | Manager-Rolle |
| 👥 | Teamleiter | OrganizationChart.vue | ~43 | Teamleiter-Rolle |
| 📋 | Office | OrganizationChart.vue | ~31 | Office-Rolle |
| 🔧 | System-Admin | OrganizationChart.vue | ~46 | SysAdmin-Rolle |
| 👤 | Mitarbeiter | OrgNode.vue | ~5 | Standard Mitarbeiter |

### 2. **Aktions-Icons (Buttons)**

| Icon | Verwendung | Datei | Zeile | Beschreibung |
|------|-----------|-------|-------|--------------|
| ✏️ | Bearbeiten | UserManagement.vue | ~157 | Benutzer editieren |
| 🔑 | Passwort | UserManagement.vue | ~164 | Passwort zurücksetzen |
| 🚫 | Deaktivieren/Absagen | UserManagement.vue, VacationApprovalCard.vue | ~172, ~38 | Benutzer deaktivieren / Urlaub absagen |
| ✅ | Aktivieren | UserManagement.vue | ~182 | Benutzer aktivieren |
| 🔄 | Neu generieren | UserManagement.vue | ~60 | Passwort neu generieren |
| 📄 | PDF Export | vacation-updated.vue, OrganizationChart.vue | ~142, ~11 | PDF erstellen |
| 🚪 | Abmelden | vacation-updated.vue | ~40 | Logout |

### 3. **UI-Navigation Icons**

| Icon | Verwendung | Datei | Zeile | Beschreibung |
|------|-----------|-------|-------|--------------|
| ▼ | Ausgeklappt | UserManagement.vue | ~76 | Sektion ist offen |
| ▶ | Eingeklappt | UserManagement.vue | ~76 | Sektion ist geschlossen |
| ▲ | Sortierung aufsteigend | UserManagement.vue | ~96 | Spalte aufsteigend sortiert |
| ▼ | Sortierung absteigend | UserManagement.vue | ~96 | Spalte absteigend sortiert |
| 🔍 | Suche | UserManagement.vue | ~87 | Suchfeld |

### 4. **Status-Icons**

| Icon | Verwendung | Datei | Zeile | Beschreibung |
|------|-----------|-------|-------|--------------|
| ✓ | Genehmigt | dateHelpers.ts | ~58-59 | Urlaubsantrag genehmigt |
| ✗ | Abgelehnt | VacationApprovalCard.vue | ~32 | Ablehnen Button |
| ○ | Inaktiv | UserManagement.vue | ~195 | Benutzer inaktiv |

### 5. **Logo**

| Datei | Pfad | Verwendung |
|-------|------|-----------|
| Logo_TecKonzept_noBg_blue.png | /public/ | PDF Header, Organigramm |

---

## 🎨 Anpassungsmöglichkeiten

### Option 1: Icons durch Bilder ersetzen

**Struktur erstellen:**
```
public/
  icons/
    roles/
      manager.svg
      teamlead.svg
      office.svg
      sysadmin.svg
      employee.svg
    actions/
      edit.svg
      password.svg
      deactivate.svg
      activate.svg
      pdf.svg
      logout.svg
    ui/
      expand.svg
      collapse.svg
      sort-up.svg
      sort-down.svg
      search.svg
```

**Code-Änderung Beispiel:**
```vue
<!-- Vorher (Emoji): -->
<div class="node-icon">👔</div>

<!-- Nachher (Bild): -->
<div class="node-icon">
  <img src="/icons/roles/manager.svg" alt="Manager" />
</div>
```

**CSS anpassen:**
```css
.node-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
```

---

### Option 2: Icon-Font verwenden (z.B. Font Awesome)

**Installation:**
```bash
npm install @fortawesome/fontawesome-free
```

**In nuxt.config.ts:**
```typescript
export default defineNuxtConfig({
  css: [
    '@fortawesome/fontawesome-free/css/all.css'
  ]
})
```

**Code-Änderung Beispiel:**
```vue
<!-- Vorher (Emoji): -->
<div class="node-icon">👔</div>

<!-- Nachher (Font Awesome): -->
<div class="node-icon">
  <i class="fas fa-user-tie"></i>
</div>
```

---

### Option 3: Icon-Komponente mit Lucide Vue

**Installation:**
```bash
npm install lucide-vue-next
```

**Code-Änderung Beispiel:**
```vue
<script setup>
import { UserTie, Users, FileText, Wrench } from 'lucide-vue-next'
</script>

<template>
  <!-- Vorher (Emoji): -->
  <div class="node-icon">👔</div>
  
  <!-- Nachher (Lucide): -->
  <div class="node-icon">
    <UserTie :size="24" />
  </div>
</template>
```

---

## 📋 Empfohlene Icon-Mappings

Wenn du Icons ersetzen möchtest, hier sind gute Alternativen:

### Rollen
- 👔 Manager → `user-tie`, `briefcase`, `crown`
- 👥 Teamleiter → `users`, `user-check`, `users-round`
- 📋 Office → `clipboard`, `file-text`, `folder`
- 🔧 System-Admin → `wrench`, `settings`, `tool`
- 👤 Mitarbeiter → `user`, `circle-user`, `user-round`

### Aktionen
- ✏️ Bearbeiten → `edit`, `pencil`, `edit-3`
- 🔑 Passwort → `key`, `lock`, `lock-keyhole`
- 🚫 Deaktivieren → `x-circle`, `ban`, `slash`
- ✅ Aktivieren → `check-circle`, `check`, `circle-check`
- 📄 PDF → `file-text`, `download`, `printer`
- 🚪 Abmelden → `log-out`, `arrow-right-from-bracket`

### UI
- ▼ Ausgeklappt → `chevron-down`, `arrow-down`
- ▶ Eingeklappt → `chevron-right`, `arrow-right`
- ▲ Sort Up → `arrow-up`, `chevron-up`
- 🔍 Suche → `search`, `magnifying-glass`

---

## 🔄 Globale Icon-Konfiguration (Empfohlen)

Erstelle eine zentrale Icon-Konfiguration:

**`/config/icons.ts`:**
```typescript
export const icons = {
  roles: {
    manager: '👔',      // oder '/icons/manager.svg'
    teamlead: '👥',
    office: '📋',
    sysadmin: '🔧',
    employee: '👤'
  },
  actions: {
    edit: '✏️',
    password: '🔑',
    deactivate: '🚫',
    activate: '✅',
    pdf: '📄',
    logout: '🚪'
  },
  ui: {
    expand: '▼',
    collapse: '▶',
    sortUp: '▲',
    sortDown: '▼',
    search: '🔍'
  }
}
```

**Verwendung in Komponenten:**
```vue
<script setup>
import { icons } from '~/config/icons'
</script>

<template>
  <div class="node-icon">{{ icons.roles.manager }}</div>
</template>
```

---

## 🎯 Nächste Schritte

1. **Entscheidung treffen:** Emojis behalten oder durch SVG/Icon-Font ersetzen?
2. **Icons auswählen:** Konsistenten Icon-Set wählen (z.B. Lucide, Font Awesome, eigene SVGs)
3. **Zentrale Konfiguration:** `config/icons.ts` erstellen
4. **Schrittweise ersetzen:** Icons nach und nach in Komponenten ersetzen
5. **Testen:** Sicherstellen dass alle Icons überall korrekt angezeigt werden

---

## 💡 Vorteile der Icon-Verwaltung

✅ **Konsistenz:** Alle Icons aus einer Quelle
✅ **Wartbarkeit:** Änderungen an einer Stelle
✅ **Flexibilität:** Einfacher Wechsel des Icon-Sets
✅ **Barrierefreiheit:** SVGs können besser beschriftet werden
✅ **Performance:** SVGs sind kleiner als Emojis bei gleichbleibender Qualität
