# Schritt 4: API Routes erstellt ✅

## 📁 Dateistruktur

```
server/api/
├── auth/
│   └── login.post.ts                    # Login mit bcrypt
├── vacation-requests/
│   ├── index.get.ts                     # GET alle Requests
│   ├── index.post.ts                    # POST neuer Request
│   └── [id].patch.ts                    # PATCH genehmigen/ablehnen
├── organization/
│   ├── index.get.ts                     # GET Organigramm
│   └── [userId].patch.ts                # PATCH Zuordnung ändern
├── half-day-rules/
│   ├── index.get.ts                     # GET alle Regeln
│   ├── index.post.ts                    # POST neue Regel
│   └── [id].delete.ts                   # DELETE Regel
└── carryover/
    ├── index.get.ts                     # GET alle Überträge
    ├── index.post.ts                    # POST/UPDATE Übertrag
    └── [id].delete.ts                   # DELETE Übertrag
```

## 📄 Erstellte Dateien (13 APIs)

### **Authentication**
1. **`/server/api/auth/login.post.ts`** - Login mit Passwort-Verifikation

### **Vacation Requests**
2. **`/server/api/vacation-requests/index.get.ts`** - Alle Anträge
3. **`/server/api/vacation-requests/index.post.ts`** - Neuer Antrag
4. **`/server/api/vacation-requests/[id].patch.ts`** - Genehmigen/Ablehnen

### **Organization**
5. **`/server/api/organization/index.get.ts`** - Organigramm laden
6. **`/server/api/organization/[userId].patch.ts`** - Zuordnung ändern

### **Half Day Rules**
7. **`/server/api/half-day-rules/index.get.ts`** - Alle Halbtage
8. **`/server/api/half-day-rules/index.post.ts`** - Halbtag hinzufügen
9. **`/server/api/half-day-rules/[id].delete.ts`** - Halbtag löschen

### **Carryover**
10. **`/server/api/carryover/index.get.ts`** - Alle Überträge
11. **`/server/api/carryover/index.post.ts`** - Übertrag erstellen/aktualisieren
12. **`/server/api/carryover/[id].delete.ts`** - Übertrag löschen

## 🔌 API Endpunkte

### **Auth**
```
POST   /api/auth/login
Body:  { username, password }
Return: { username, firstName, lastName, role, displayName }
```

### **Vacation Requests**
```
GET    /api/vacation-requests
Return: VacationRequest[]

POST   /api/vacation-requests
Body:  { userId, displayName, startDate, endDate, reason }
Return: VacationRequest

PATCH  /api/vacation-requests/:id
Body:  { action: 'approve'|'reject', level?: 'teamlead'|'manager' }
Return: { success: true, status }
```

### **Organization**
```
GET    /api/organization
Return: OrgNode[]

PATCH  /api/organization/:userId
Body:  { teamId?, managerId? }
Return: { success: true }
```

### **Half Day Rules**
```
GET    /api/half-day-rules
Return: HalfDayRule[]

POST   /api/half-day-rules
Body:  { date, description, createdBy }
Return: HalfDayRule

DELETE /api/half-day-rules/:id
Return: { success: true }
```

### **Carryover**
```
GET    /api/carryover
Return: Carryover[]

POST   /api/carryover
Body:  { userId, year, carryoverDays, expiryDate? }
Return: Carryover

DELETE /api/carryover/:id
Return: { success: true }
```

## ✨ Features

### **Sicherheit**
- ✅ Passwort-Hashing mit bcrypt
- ✅ Error-Handling mit try-catch
- ✅ HTTP Status Codes (400, 401, 404, 500)
- ✅ Input-Validierung

### **Datenbank**
- ✅ SQLite mit better-sqlite3
- ✅ Prepared Statements (SQL Injection sicher)
- ✅ Foreign Keys aktiviert
- ✅ Transaktionen möglich

### **API-Design**
- ✅ RESTful Conventions
- ✅ Konsistente Fehler-Responses
- ✅ Timestamp-Tracking (createdAt, updatedAt)

## 🧪 Testen

### Mit curl:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Mustermann","password":"password123"}'

# Vacation Requests abrufen
curl http://localhost:3000/api/vacation-requests

# Neuen Antrag erstellen
curl -X POST http://localhost:3000/api/vacation-requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"Mustermann",
    "displayName":"Max Mustermann",
    "startDate":"2025-08-01",
    "endDate":"2025-08-14",
    "reason":"Sommerurlaub"
  }'
```

## 🎯 Nächster Schritt

**Schritt 5:** Composables auf API umstellen!
- useVacationRequests → $fetch('/api/vacation-requests')
- useOrganization → $fetch('/api/organization')
- useHalfDayRules → $fetch('/api/half-day-rules')
- useCarryover → $fetch('/api/carryover')

**Bereit?** Sag Bescheid! 🚀
