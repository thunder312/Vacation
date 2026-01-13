// composables/useAuth-api.ts
import type { UserRole } from '~/types/vacation'

interface User {
  username: string
  firstName: string
  lastName: string
  displayName: string  // = lastName
  role: UserRole
  vacationDays?: number
}

export const useAuth = () => {
  const currentUser = useState<User | null>('currentUser', () => null)
  const isAuthenticated = computed(() => currentUser.value !== null)

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await $fetch<User>('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      })

      currentUser.value = response
      
      // In localStorage speichern für Persistenz
      if (process.client) {
        localStorage.setItem('currentUser', JSON.stringify(response))
      }
        // Additional as cookie for serverside
        const userCookie = useCookie('currentUser');
        userCookie.value = JSON.stringify(response);

        return true
    } catch (error: any) {
      console.error('Login failed:', error)
      currentUser.value = null
      
      if (process.client) {
        localStorage.removeItem('currentUser')
      }
      
      return false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Logout API error:', error)
    }
    
    currentUser.value = null
    
    if (process.client) {
      localStorage.removeItem('currentUser')
    }
  }

  const initAuth = () => {
    if (process.client) {
      const stored = localStorage.getItem('currentUser')
      if (stored) {
        try {
          currentUser.value = JSON.parse(stored)
        } catch (e) {
          console.error('Failed to parse stored user:', e)
          localStorage.removeItem('currentUser')
        }
      }
    }
  }

  return {
    currentUser: readonly(currentUser),
    isAuthenticated,
    login,
    logout,
    initAuth
  }
}
