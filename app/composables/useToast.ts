export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
    id: number
    message: string
    type: ToastType
}

const toasts = ref<Toast[]>([])

export const useToast = () => {
    const show = (message: string, type: ToastType = 'info') => {
        const id = Date.now()
        toasts.value.push({ id, message, type })

        // Toast nach 3 Sekunden automatisch entfernen
        setTimeout(() => {
            remove(id)
        }, 3000)
    }

    const remove = (id: number) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    const success = (message: string) => show(message, 'success')
    const error = (message: string) => show(message, 'error')
    const info = (message: string) => show(message, 'info')
    const warning = (message: string) => show(message, 'warning')

    return {
        toasts: readonly(toasts),
        show,
        remove,
        success,
        error,
        info,
        warning
    }
}