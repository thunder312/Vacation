// composables/useConfirm.ts
interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
}

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  type: 'warning' | 'danger' | 'info'
  resolve: ((value: boolean) => void) | null
}

const state = reactive<ConfirmState>({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: 'Abbrechen',
  type: 'warning',
  resolve: null
})

export const useConfirm = () => {
  const confirm = (options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof options === 'string') {
        state.message = options
        state.title = 'Bestätigung'
        state.confirmText = 'OK'
        state.cancelText = 'Abbrechen'
        state.type = 'warning'
      } else {
        state.message = options.message
        state.title = options.title || 'Bestätigung'
        state.confirmText = options.confirmText || 'OK'
        state.cancelText = options.cancelText || 'Abbrechen'
        state.type = options.type || 'warning'
      }
      state.resolve = resolve
      state.isOpen = true
    })
  }

  const handleConfirm = () => {
    state.isOpen = false
    if (state.resolve) {
      state.resolve(true)
      state.resolve = null
    }
  }

  const handleCancel = () => {
    state.isOpen = false
    if (state.resolve) {
      state.resolve(false)
      state.resolve = null
    }
  }

  return {
    state: readonly(state),
    confirm,
    handleConfirm,
    handleCancel
  }
}
