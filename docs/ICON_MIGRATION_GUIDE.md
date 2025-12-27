# Icon Migration Guide

## Neue Icons in icons.ts hinzugefügt

### Aktions-Icons (neu):
- `save: '💾'` - Speichern
- `delete: '🗑️'` - Löschen
- `cancel: '❌'` - Abbrechen (allgemein)
- `cancelVacation: '🚫'` - Urlaub absagen (spezifisch)
- `search: '🔍'` - Suchen
- `settings: '⚙️'` - Einstellungen

### UI-Icons (neu):
- `loading: '⏳'` - Lädt
- `info: 'ℹ️'` - Information
- `warning: '⚠️'` - Warnung
- `error: '❌'` - Fehler
- `success: '✓'` - Erfolg
- `calendar: '📅'` - Kalender
- `report: '📊'` - Bericht/Report
- `theme.light: '☀️'` - Hell-Modus
- `theme.dark: '🌙'` - Dunkel-Modus

### Flags (geändert):
- Von Emojis zu PNG-Pfaden umgestellt

## Migration Beispiele

### Vorher:
```vue
<button>💾 {{ t('common.save') }}</button>
<div>ℹ️ {{ t('vacation.info') }}</div>
<span>📊 {{ t('reports.annualReport') }}</span>
```

### Nachher:
```vue
<script setup>
import { icons } from '~/config/icons'
</script>

<template>
  <button>{{ icons.actions.save }} {{ t('common.save') }}</button>
  <div>{{ icons.ui.info }} {{ t('vacation.info') }}</div>
  <span>{{ icons.ui.report }} {{ t('reports.annualReport') }}</span>
</template>
```

## Dateien die migriert werden sollten

1. **AnnualVacationReport.vue**
   - `📊` → `icons.ui.report`
   - `⏳` → `icons.ui.loading`
   - `❌` → `icons.ui.error`
   - `ℹ️` → `icons.ui.info`
   - `📄` → `icons.actions.pdf`

2. **ApprovedVacationList.vue**
   - `📅` → `icons.ui.calendar`

3. **CarryoverReview.vue**
   - `💾` → `icons.actions.save`

4. **HalfDayRuleManager.vue**
   - `🗑️` → `icons.actions.delete`
   - `ℹ️` → `icons.ui.info`

5. **OrganizationChart.vue**
   - `⚙️` → `icons.actions.settings`
   - `👔` → `icons.roles.manager`
   - `👥` → `icons.roles.teamlead`
   - `📋` → `icons.roles.office`
   - `🔧` → `icons.roles.sysadmin`
   - `👤` → `icons.roles.employee`

6. **UserManagement.vue**
   - `💾` → `icons.actions.save`
   - `❌` → `icons.actions.cancel`
   - `✏️` → `icons.actions.edit`

7. **VacationBalanceCard.vue**
   - `ℹ️` → `icons.ui.info`
   - `❌` → `icons.ui.error`

8. **VacationCancellation.vue**
   - `ℹ️` → `icons.ui.info`
   - `❌` → `icons.actions.cancel`
   - `📅` → `icons.ui.calendar`

9. **VacationApprovalCard.vue**
   - `✓` → `icons.actions.approve`
   - `✗` → `icons.actions.reject`

10. **YearTransitionPanel.vue**
    - `✅` → `icons.actions.activate`
    - `🔍` → `icons.actions.search`
    - `⏳` → `icons.ui.loading`

## Vorteile der Migration

1. **Zentrale Verwaltung**: Alle Icons an einem Ort
2. **Einfaches Theming**: Icons können global geändert werden
3. **SVG Support**: Einfacher Wechsel zu SVG Icons
4. **TypeScript**: Type-Safety für Icon-Namen
5. **Konsistenz**: Einheitliche Icon-Nutzung im ganzen Projekt

## Automatische Migration (Optional)

Für eine schnellere Migration könnte ein Script erstellt werden, das:
1. Alle Vue-Dateien durchsucht
2. Hardcoded Emojis findet
3. Durch `icons.X.Y` ersetzt
4. Import automatisch hinzufügt
