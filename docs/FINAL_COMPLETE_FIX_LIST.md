# 🎯 KOMPLETTE FIX-LISTE - Alle Dateien

## ✅ ALLE VERFÜGBAREN FIX-DATEIEN:

---

### **KATEGORIE 1: KRITISCH - Approval funktioniert** 

#### 1. vacation-requests_PATCH_FINAL.ts
**Ersetze:** `server/api/vacation-requests/[id].patch.ts`
**Problem:** Verwendet nicht-existierende `updatedAt` Spalte
**Fix:** Entfernt alle `updatedAt = datetime('now')`

#### 2. cancel_post_FIXED.ts
**Ersetze:** `server/api/vacation/[id]/cancel.post.ts`
**Problem:** Verwendet nicht-existierende `updatedAt` Spalte
**Fix:** Entfernt `updatedAt = datetime('now')`

---

### **KATEGORIE 2: KRITISCH - teamId Migration**

#### 3. useOrganization-api_FIXED.ts ⭐ NEU
**Ersetze:** `app/composables/useOrganization-api.ts`
**Problem:** 12x `teamId` und `managerId` verwendet
**Fix:** Alle durch `teamleadId` ersetzt
**Details:** Siehe USEORGANIZATION_CHANGES.md

#### 4. organization_userId_patch_FIXED.ts ⭐ NEU
**Ersetze:** `server/api/organization/[userId].patch.ts`
**Problem:** Verwendet `teamId`, `managerId`, `updatedAt`
**Fix:** Nur noch `teamleadId`, kein `updatedAt`

#### 5. QUICK_FIX_vacation_exceptions_GET.ts
**Ersetze:** `server/api/vacation-exceptions/index.get.ts`
**Problem:** SQL Parameter Mismatch (year + month)
**Fix:** if/else statt verschachtelter Conditions

---

### **KATEGORIE 3: WICHTIG - UI Fixes**

#### 6. vacation.vue - MANUELL EDITIEREN
**Datei:** `pages/vacation.vue`
**Zeile 515-516:** 
```typescript
// VORHER:
const myTeamMembers = orgNodes.value
    .filter(n => n.teamleadId?.toLowerCase() === currentUser.value.username?.toLowerCase())

// NACHHER - FÜGE .map() HINZU:
const myTeamMembers = orgNodes.value
    .filter(n => n.teamleadId?.toLowerCase() === currentUser.value.username?.toLowerCase())
    .map(n => n.userId)  // ← DIESE ZEILE HINZUFÜGEN!
```

#### 7. OrganizationChart.vue - MANUELL EDITIEREN
**Datei:** `app/components/OrganizationChart.vue`
**Zeile 28:** 
```vue
<!-- VORHER: -->
<div v-for="team in teamsFiltered || []" :key="team.teamleadId" class="team-card">

<!-- NACHHER: -->
<div v-for="teamlead in teamleads || []" :key="teamlead._key" class="team-card">
```
**Zeile 30-47:** Alle `team.` durch `teamlead.` ersetzen, `team.members` → `teamlead.teamMembers`

---

### **KATEGORIE 4: OPTIONAL - Kalender/Exceptions**

#### 8. VacationCalendar_CLEAN.vue
**Ersetze:** `app/components/VacationCalendar.vue`
**Fix:** Exceptions laden und anzeigen

#### 9. MAIN_CSS_ADDITIONS.css
**Füge ein in:** `app/assets/css/main.css` nach Zeile 4203
**Fix:** CSS für gestreifte halbe Urlaubstage

---

## 📋 INSTALLATIONS-REIHENFOLGE:

### Phase 1: Server-Side (KRITISCH)
1. ✅ vacation-requests_PATCH_FINAL.ts
2. ✅ cancel_post_FIXED.ts
3. ✅ organization_userId_patch_FIXED.ts
4. ✅ QUICK_FIX_vacation_exceptions_GET.ts

**Test:** Teamleiter kann Antrag genehmigen ohne Fehler

---

### Phase 2: Client-Side (KRITISCH)
5. ✅ useOrganization-api_FIXED.ts
6. ✅ vacation.vue (Zeile 516 editieren)
7. ✅ OrganizationChart.vue (Zeile 28+ editieren)

**Test:** 
- Teamleiter sieht Anträge in Liste
- Team-Verwaltung zeigt Mitarbeiter
- Team-Zuordnung funktioniert

---

### Phase 3: Optional (FEATURES)
8. ✅ VacationCalendar_CLEAN.vue
9. ✅ MAIN_CSS_ADDITIONS.css

**Test:** Kalender zeigt Exceptions als gestreifte Tage

---

## ⚠️ WICHTIGE HINWEISE:

1. **Server neu starten** nach API-Änderungen (optional, Hot Reload sollte funktionieren)
2. **Browser Cache löschen** (Ctrl+Shift+R)
3. **Teste nach JEDER Phase** ob alles funktioniert
4. Bei Fehlern: Terminal Logs prüfen

---

## 🧪 KOMPLETTER TEST-PLAN:

### Nach Phase 1+2:
- [ ] Employee kann Urlaub beantragen
- [ ] Teamleiter sieht Antrag in "Teamleiter" Tab
- [ ] Teamleiter kann genehmigen → Status: teamlead_approved
- [ ] Manager sieht Antrag in "Manager" Tab
- [ ] Manager kann final genehmigen → Status: approved
- [ ] Employee sieht genehmigten Antrag

### Nach Phase 3:
- [ ] Kalender zeigt genehmigten Urlaub (grün)
- [ ] Exception kann erstellt werden (0.5 Tage)
- [ ] Kalender zeigt Exception (gestreift)
- [ ] Balance wird korrekt berechnet (z.B. 15 - 0.5 = 14.5 Tage)

---

## 📊 STATISTIK:

- **Dateien zum Ersetzen:** 4 APIs + 1 Composable + 1 Vue-Komponente = 6
- **Dateien zum Editieren:** 2 (vacation.vue, OrganizationChart.vue)
- **Optionale Dateien:** 2 (Calendar + CSS)
- **Zeilen Code geändert:** ~150 Zeilen
- **teamId/managerId → teamleadId:** 30+ Vorkommen gefixt

---

## ✅ FERTIG!

Nach allen Fixes sollte das System vollständig funktionieren ohne Fehler!
