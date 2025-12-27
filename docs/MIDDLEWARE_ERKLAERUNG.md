# Middleware in Nuxt 3

## app/middleware/ (Frontend/Client-Side)
**Zweck:** Route Guards - schützt Seiten vor unbefugtem Zugriff

**Beispiel: app/middleware/auth.ts**
```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()
  
  // Wenn nicht eingeloggt → redirect zu /login
  if (!isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login')
  }
  
  // Wenn eingeloggt und auf /login → redirect zu /vacation
  if (isAuthenticated.value && to.path === '/login') {
    return navigateTo('/vacation')
  }
})
```

**Verwendung in Seiten:**
```typescript
// pages/vacation.vue
definePageMeta({
  middleware: 'auth'
})
```

---

## server/middleware/ (Backend/Server-Side)
**Zweck:** Server-Request-Handler - läuft bei JEDEM API-Call

**Beispiel: server/middleware/auth.ts**
```typescript
export default defineEventHandler(async (event) => {
  // Setzt event.context.user basierend auf JWT-Token
  const token = getCookie(event, 'auth-token')
  if (token) {
    const decoded = jwt.verify(token, JWT_SECRET)
    event.context.user = decoded
  }
})
```

**Läuft automatisch bei jedem Request an /api/***

---

## Zusammenfassung

| Wo? | Wofür? | Wann? |
|-----|--------|-------|
| `app/middleware/auth.ts` | Frontend Route Guard | Bei jedem Seitenwechsel |
| `server/middleware/auth.ts` | Backend Auth Check | Bei jedem API-Call |

## Du brauchst BEIDE!

✅ **app/middleware/auth.ts** - Verhindert, dass User ohne Login /vacation sehen
✅ **server/middleware/auth.ts** - Setzt user-Objekt für API-Endpoints
