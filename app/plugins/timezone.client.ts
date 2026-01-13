// plugins/timezone.client.ts
export default defineNuxtPlugin(() => {
  // Setze Zeitzone für alle Date-Operationen
  process.env.TZ = 'Europe/Berlin'
  
  // Für Browser: Überschreibe toISOString um lokale Zeit zu verwenden
  const originalToISOString = Date.prototype.toISOString
  
  Date.prototype.toLocalISOString = function() {
    const offset = this.getTimezoneOffset()
    const localDate = new Date(this.getTime() - offset * 60 * 1000)
    return localDate.toISOString()
  }
  
  console.log('🌍 Timezone set to Europe/Berlin (CET/CEST)')
})
