// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()
  
  // Wenn nicht eingeloggt und versucht auf geschützte Seite zu gehen
  if (!isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login')
  }
  
  // Wenn eingeloggt und versucht auf Login-Seite zu gehen
  if (isAuthenticated.value && to.path === '/login') {
    return navigateTo('/vacation')
  }
})
