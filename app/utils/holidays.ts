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

// Typ für Feiertag mit Name
export interface Holiday {
    date: Date
    name: string
}

// Gibt alle bayerischen Feiertage für ein bestimmtes Jahr zurück (mit Namen)
export const getBavarianHolidaysWithNames = (year: number): Holiday[] => {
    const holidays: Holiday[] = []

    // Feste Feiertage
    holidays.push({ date: new Date(year, 0, 1), name: 'Neujahr' })
    holidays.push({ date: new Date(year, 0, 6), name: 'Heilige Drei Könige' })
    holidays.push({ date: new Date(year, 4, 1), name: 'Tag der Arbeit' })
    holidays.push({ date: new Date(year, 7, 15), name: 'Mariä Himmelfahrt' })
    holidays.push({ date: new Date(year, 9, 3), name: 'Tag der Deutschen Einheit' })
    holidays.push({ date: new Date(year, 10, 1), name: 'Allerheiligen' })
    holidays.push({ date: new Date(year, 11, 25), name: '1. Weihnachtsfeiertag' })
    holidays.push({ date: new Date(year, 11, 26), name: '2. Weihnachtsfeiertag' })

    // Bewegliche Feiertage (abhängig von Ostern)
    const easter = calculateEaster(year)

    // Karfreitag (2 Tage vor Ostern)
    const goodFriday = new Date(easter)
    goodFriday.setDate(easter.getDate() - 2)
    holidays.push({ date: goodFriday, name: 'Karfreitag' })

    // Ostermontag (1 Tag nach Ostern)
    const easterMonday = new Date(easter)
    easterMonday.setDate(easter.getDate() + 1)
    holidays.push({ date: easterMonday, name: 'Ostermontag' })

    // Christi Himmelfahrt (39 Tage nach Ostern)
    const ascension = new Date(easter)
    ascension.setDate(easter.getDate() + 39)
    holidays.push({ date: ascension, name: 'Christi Himmelfahrt' })

    // Pfingstmontag (50 Tage nach Ostern)
    const whitMonday = new Date(easter)
    whitMonday.setDate(easter.getDate() + 50)
    holidays.push({ date: whitMonday, name: 'Pfingstmontag' })

    // Fronleichnam (60 Tage nach Ostern)
    const corpusChristi = new Date(easter)
    corpusChristi.setDate(easter.getDate() + 60)
    holidays.push({ date: corpusChristi, name: 'Fronleichnam' })

    return holidays
}

// Gibt alle bayerischen Feiertage für ein bestimmtes Jahr zurück (nur Datum für Rückwärtskompatibilität)
export const getBavarianHolidays = (year: number): Date[] => {
    return getBavarianHolidaysWithNames(year).map(h => h.date)
}

// Gibt den Namen eines Feiertags zurück, oder null wenn kein Feiertag
export const getHolidayName = (date: Date): string | null => {
    const year = date.getFullYear()
    const holidays = getBavarianHolidaysWithNames(year)

    const holiday = holidays.find(h =>
        h.date.getDate() === date.getDate() &&
        h.date.getMonth() === date.getMonth()
    )

    return holiday?.name || null
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