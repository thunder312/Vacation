// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  // Wenn nicht eingeloggt, redirect zu Login
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
