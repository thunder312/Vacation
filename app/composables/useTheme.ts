export type ThemeMode = 'business' | 'summer'

const currentTheme = ref<ThemeMode>('business')

export const useTheme = () => {
    const setTheme = (theme: ThemeMode) => {
        currentTheme.value = theme

        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme)
            localStorage.setItem('theme', theme)
        }
    }

    const toggleTheme = () => {
        const newTheme = currentTheme.value === 'business' ? 'summer' : 'business'
        setTheme(newTheme)
    }

    const initTheme = () => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as ThemeMode
            if (savedTheme) {
                setTheme(savedTheme)
            }
        }
    }

    return {
        currentTheme: readonly(currentTheme),
        setTheme,
        toggleTheme,
        initTheme
    }
}