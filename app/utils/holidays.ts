// Berechnung der beweglichen Feiertage basierend auf Ostersonntag
const calculateEaster = (year: number): Date => {
    const a = year % 19
    const b = Math.floor(year / 100)
    const c = year % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const month = Math.floor((h + l - 7 * m + 114) / 31)
    const day = ((h + l - 7 * m + 114) % 31) + 1

    return new Date(year, month - 1, day)
}

// Gibt alle bayerischen Feiertage für ein bestimmtes Jahr zurück
export const getBavarianHolidays = (year: number): Date[] => {
    const holidays: Date[] = []

    // Feste Feiertage
    holidays.push(new Date(year, 0, 1))   // Neujahr
    holidays.push(new Date(year, 0, 6))   // Heilige Drei Könige
    holidays.push(new Date(year, 4, 1))   // Tag der Arbeit
    holidays.push(new Date(year, 7, 15))  // Mariä Himmelfahrt
    holidays.push(new Date(year, 9, 3))   // Tag der Deutschen Einheit
    holidays.push(new Date(year, 10, 1))  // Allerheiligen
    holidays.push(new Date(year, 11, 25)) // 1. Weihnachtsfeiertag
    holidays.push(new Date(year, 11, 26)) // 2. Weihnachtsfeiertag

    // Bewegliche Feiertage (abhängig von Ostern)
    const easter = calculateEaster(year)

    // Karfreitag (2 Tage vor Ostern)
    const goodFriday = new Date(easter)
    goodFriday.setDate(easter.getDate() - 2)
    holidays.push(goodFriday)

    // Ostermontag (1 Tag nach Ostern)
    const easterMonday = new Date(easter)
    easterMonday.setDate(easter.getDate() + 1)
    holidays.push(easterMonday)

    // Christi Himmelfahrt (39 Tage nach Ostern)
    const ascension = new Date(easter)
    ascension.setDate(easter.getDate() + 39)
    holidays.push(ascension)

    // Pfingstmontag (50 Tage nach Ostern)
    const whitMonday = new Date(easter)
    whitMonday.setDate(easter.getDate() + 50)
    holidays.push(whitMonday)

    // Fronleichnam (60 Tage nach Ostern)
    const corpusChristi = new Date(easter)
    corpusChristi.setDate(easter.getDate() + 60)
    holidays.push(corpusChristi)

    return holidays
}

// Prüft ob ein Datum ein Feiertag ist
export const isHoliday = (date: Date): boolean => {
    const year = date.getFullYear()
    const holidays = getBavarianHolidays(year)

    return holidays.some(holiday =>
        holiday.getDate() === date.getDate() &&
        holiday.getMonth() === date.getMonth() &&
        holiday.getFullYear() === date.getFullYear()
    )
}

// Prüft ob ein Datum ein Wochenende ist
export const isWeekend = (date: Date): boolean => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sonntag oder Samstag
}

// Prüft ob ein Datum ein Arbeitstag ist
export const isWorkday = (date: Date): boolean => {
    return !isWeekend(date) && !isHoliday(date)
}