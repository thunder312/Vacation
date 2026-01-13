import type { User, UserRole } from '~/types/vacation'

const currentUser = ref<User | null>(null)

export const useAuth = () => {
    const toast = useToast()

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const { data, error } = await useFetch('/api/login', {
                method: 'POST',
                body: {
                    username,
                    password
                }
            })

            if (error.value || !data.value?.success) {
                toast.error('Ungültige Anmeldedaten')
                return false
            }

            const user = data.value.user
            currentUser.value = user
            
            // In localStorage speichern (in Produktion: JWT verwenden)
            if (typeof window !== 'undefined') {
                localStorage.setItem('currentUser', JSON.stringify(user))
            }
            
            toast.success(`Willkommen, ${user.displayName}!`)
            return true

        } catch (err) {
            console.error('Login error:', err)
            toast.error('Fehler beim Login')
            return false
        }
    }

    const logout = () => {
        currentUser.value = null
        if (typeof window !== 'undefined') {
            localStorage.removeItem('currentUser')
        }
        toast.info('Erfolgreich abgemeldet')
    }

    const initAuth = () => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('currentUser')
            if (stored) {
                try {
                    currentUser.value = JSON.parse(stored)
                } catch (error) {
                    console.error('Fehler beim Laden des Users:', error)
                    localStorage.removeItem('currentUser')
                }
            }
        }
    }

    const isAuthenticated = computed(() => currentUser.value !== null)
    
    const hasRole = (role: UserRole | UserRole[]) => {
        if (!currentUser.value) return false
        const roles = Array.isArray(role) ? role : [role]
        return roles.includes(currentUser.value.role)
    }

    return {
        currentUser: readonly(currentUser),
        login,
        logout,
        initAuth,
        isAuthenticated,
        hasRole
    }
}
