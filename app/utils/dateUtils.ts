// utils/dateUtils.ts
/**
 * Gibt das heutige Datum im Format YYYY-MM-DD zurück (lokale Zeitzone)
 */
export const getTodayLocal = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Konvertiert Date zu YYYY-MM-DD String (lokale Zeitzone)
 */
export const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Erstellt Date-Objekt aus YYYY-MM-DD String (ohne Zeitzone-Probleme)
 */
export const fromLocalDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}
