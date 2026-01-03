# useOrganization-api.ts - Alle Änderungen

## Zusammenfassung:
**12 Vorkommen** von `teamId` und `managerId` durch `teamleadId` ersetzt.

---

## Detaillierte Änderungen:

### 1. **getTeams - Zeile 34**
```typescript
// VORHER:
.filter(n => n.teamId?.toLowerCase() === tl.userId.toLowerCase())

// NACHHER:
.filter(n => n.teamleadId?.toLowerCase() === tl.userId.toLowerCase())
```

---

### 2. **assignToTeam - Zeile 44**
```typescript
// VORHER:
body: { teamId: teamleadId, managerId: teamleadId }

// NACHHER:
body: { teamleadId: teamleadId }
```

---

### 3. **assignToTeam - Zeilen 50-51**
```typescript
// VORHER:
node.teamId = teamleadId
node.managerId = teamleadId

// NACHHER:
node.teamleadId = teamleadId
```

---

### 4. **removeFromTeam - Zeile 73**
```typescript
// VORHER:
body: { teamId: null, managerId: null }

// NACHHER:
body: { teamleadId: null }
```

---

### 5. **removeFromTeam - Zeilen 79-80**
```typescript
// VORHER:
node.teamId = undefined
node.managerId = undefined

// NACHHER:
node.teamleadId = undefined
```

---

### 6. **getUnassignedEmployees - Zeile 99**
```typescript
// VORHER:
.filter(n => n.role === 'employee' && !n.teamId)

// NACHHER:
.filter(n => n.role === 'employee' && !n.teamleadId)
```

---

### 7. **getTeamMembers - Zeile 106**
```typescript
// VORHER:
n.teamId?.toLowerCase() === teamleadId.toLowerCase()

// NACHHER:
n.teamleadId?.toLowerCase() === teamleadId.toLowerCase()
```

---

### 8. **getDirectReports - Zeile 130**
```typescript
// VORHER:
n.managerId?.toLowerCase() === userId.toLowerCase()

// NACHHER:
n.teamleadId?.toLowerCase() === userId.toLowerCase()
```

---

### 9. **getLevel - Zeile 139**
```typescript
// VORHER:
if (!node.managerId) return 0

// NACHHER:
if (!node.teamleadId) return 0
```

---

### 10. **getLevel - Zeile 140**
```typescript
// VORHER:
return 1 + getLevel(node.managerId)

// NACHHER:
return 1 + getLevel(node.teamleadId)
```

---

### 11. **getOrgTree buildTree - Zeile 147**
```typescript
// VORHER:
.filter(n => n.managerId?.toLowerCase() === parentId?.toLowerCase())

// NACHHER:
.filter(n => n.teamleadId?.toLowerCase() === parentId?.toLowerCase())
```

---

### 12. **getOrgTree root - Zeile 155**
```typescript
// VORHER:
.filter(n => !n.managerId)

// NACHHER:
.filter(n => !n.teamleadId)
```

---

## Wichtig:

Diese Datei muss mit der entsprechenden API übereinstimmen:
- `server/api/organization/[userId].patch.ts` muss `teamleadId` akzeptieren (nicht `teamId`/`managerId`)

## Testing nach Fix:

1. Team-Zuordnung funktioniert
2. Team-Entfernung funktioniert
3. Unassigned Employees werden korrekt angezeigt
4. Organigramm wird korrekt aufgebaut
