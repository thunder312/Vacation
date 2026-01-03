# Alle teamId/managerId → teamleadId Fixes

## Betroffene Dateien (5 Backend + 1 Frontend)

### 1. ✅ server/api/organization/index.get.ts (BEREITS GEFIXT)
**Download:** organization_index.get.ts

---

### 2. server/api/organization/[userId].patch.ts

**Zeile 8:**
```typescript
// VORHER:
const { teamId, managerId } = body

// NACHHER:
const { teamleadId } = body
```

**Zeile 20-24:**
```typescript
// VORHER:
SET teamId = ?, 
    managerId = ?,
    updatedAt = CURRENT_TIMESTAMP
WHERE userId = ?
`, [teamId || null, managerId || null, userId])

// NACHHER:
SET teamleadId = ?,
    updatedAt = CURRENT_TIMESTAMP
WHERE userId = ?
`, [teamleadId || null, userId])
```

---

### 3. server/api/admin/import-users.post.ts

**Zeile 139:**
```typescript
// VORHER:
INSERT INTO organization (userId, teamId)

// NACHHER:
INSERT INTO organization (userId, teamleadId)
```

---

### 4. ✅ server/api/users/index.post.ts (BEREITS GEFIXT)
**Download:** users_index.post_CORRECT.ts

---

### 5. server/api/users/index.get.ts

**Zeile 17:**
```typescript
// VORHER:
o.teamId as teamleadId,

// NACHHER:
o.teamleadId as teamleadId,
```

(Ja, das ist kurios - es mapt teamId auf teamleadId. Jetzt direkt teamleadId lesen!)

---

### 6. server/api/users/[username].patch.ts

**Zeile 67:**
```typescript
// VORHER:
const teamId = body.teamleadId === '' ? null : body.teamleadId

// NACHHER:
const teamleadId = body.teamleadId === '' ? null : body.teamleadId
```

**Zeile 68:**
```typescript
// VORHER:
console.log('  → Update teamleadId:', teamId)

// NACHHER:
console.log('  → Update teamleadId:', teamleadId)
```

**Danach (ca. Zeile 70-75):**
```typescript
// VORHER:
UPDATE organization
SET teamId = ?, updatedAt = CURRENT_TIMESTAMP
WHERE userId = ?
`, [teamId, username])

// NACHHER:
UPDATE organization
SET teamleadId = ?, updatedAt = CURRENT_TIMESTAMP
WHERE userId = ?
`, [teamleadId, username])
```

---

### 7. app/components/OrganizationChart.vue

**Zeile 192:**
```typescript
// VORHER:
unassignedEmployees: nodes.filter(n => n.role === 'employee' && !n.teamId),

// NACHHER:
unassignedEmployees: nodes.filter(n => n.role === 'employee' && !n.teamleadId),
```

**Zeile 219:**
```typescript
// VORHER:
teamMembers: (orgNodes.value || []).filter(n => (n.teamId === tl.userId && n.isActive === 1))

// NACHHER:
teamMembers: (orgNodes.value || []).filter(n => (n.teamleadId === tl.userId && n.isActive === 1))
```

---

## Zusammenfassung

**Suche & Ersetze in allen 7 Dateien:**
- `teamId` → `teamleadId`
- `managerId` → (entfernen, existiert nicht mehr)

**Ausnahmen:**
- `body.teamleadId` bleibt `body.teamleadId` (kommt vom Frontend)
- Variablen die bereits `teamleadId` heißen nicht anfassen

---

## Test nach Fixes:

1. Organigramm öffnen ✅
2. User im Organigramm bearbeiten ✅
3. User importieren ✅
4. User anlegen ✅
