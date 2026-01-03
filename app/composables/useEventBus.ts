// Simple event bus for component communication
// No external dependencies needed

const listeners = new Map<string, Set<Function>>()

export function useEventBus() {
  const emit = (event: string, data?: any) => {
    const eventListeners = listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
    console.log(`📢 Event emitted: ${event}`, data)
  }

  const on = (event: string, callback: Function) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set())
    }
    listeners.get(event)!.add(callback)
    console.log(`👂 Listener added for: ${event}`)
  }

  const off = (event: string, callback: Function) => {
    const eventListeners = listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  return { emit, on, off }
}
