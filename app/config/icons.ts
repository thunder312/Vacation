// config/icons.ts
/**
 * Zentrale Icon-Konfiguration
 *
 * Hier können alle Icons der Software angepasst werden.
 * Unterstützt:
 * - Emojis (Standard)
 * - SVG Pfade (z.B. '/icons/manager.svg')
 * - Icon-Font Klassen (z.B. 'fas fa-user-tie')
 * - Lucide Components (z.B. import { UserTie } from 'lucide-vue-next')
 *
 * Struktur nach Software-Modulen organisiert.
 * Icons können mehrfach in verschiedenen Modulen vorkommen.
 */

export const icons = {
  // ============================================
  // COMMON - Allgemeine, modulübergreifende Icons
  // ============================================
  common: {
    close: '✕',           // Modal/Dialog schließen
    expand: '▼',          // Sektion ausgeklappt
    collapse: '▶',        // Sektion eingeklappt
    arrowLeft: '◀',       // Pfeil links
    arrowRight: '▶',      // Pfeil rechts
    arrowUp: '▲',         // Pfeil hoch
    arrowDown: '▼',       // Pfeil runter
    loading: '⏳',        // Lädt/Verarbeitung
    success: '✓',         // Erfolg
    error: '✗',           // Fehler
    warning: '⚠️',        // Warnung
    info: 'ℹ️',           // Information
    question: '❓',       // Frage
    search: '🔍',         // Suchen
    refresh: '🔄',        // Aktualisieren
    back: '↩️',           // Zurück
  },

  // ============================================
  // ROLES - Benutzerrollen
  // ============================================
  roles: {
    manager: '👔',        // Manager
    teamlead: '👥',       // Teamleiter
    office: '📋',         // Office
    sysadmin: '🔧',       // System-Admin
    administrator: '⚙️',  // Administrator
    employee: '👤',       // Mitarbeiter
    developer: '👨‍💻',     // Entwickler
    boss: '👨‍💼',          // Chef/Vorgesetzter
  },

  // ============================================
  // ACTIONS - Aktions-Buttons
  // ============================================
  actions: {
    edit: '✏️',           // Bearbeiten
    save: '💾',           // Speichern
    delete: '🗑️',         // Löschen
    cancel: '❌',         // Abbrechen
    confirm: '✓',         // Bestätigen
    approve: '✓',         // Genehmigen
    reject: '✗',          // Ablehnen
    add: '➕',            // Hinzufügen
    remove: '➖',         // Entfernen
    password: '🔑',       // Passwort
    regenerate: '🔄',     // Neu generieren
    deactivate: '🚫',     // Deaktivieren
    activate: '✅',       // Aktivieren
    logout: '🚪',         // Abmelden
    settings: '⚙️',       // Einstellungen
    download: '📥',       // Download
    upload: '📤',         // Upload
    preview: '🔍',        // Vorschau
    reset: '↩️',          // Zurücksetzen
  },

  // ============================================
  // STATUS - Statusanzeigen
  // ============================================
  status: {
    active: '✓',          // Aktiv
    inactive: '○',        // Inaktiv
    inactiveBadge: '🚫',  // Inaktiv-Badge
    pending: '⏳',        // Ausstehend
    approved: '✓✓',       // Vollständig genehmigt
    rejected: '✗',        // Abgelehnt
    cancelled: '🚫',      // Abgesagt
    withdrawn: '↩️',      // Zurückgezogen
    success: '✅',        // Erfolg (grün)
    seeding: '🌱',        // Seeding/Initial
    input: '📝',          // Input/Eingabe
  },

  // ============================================
  // UI - Benutzeroberfläche
  // ============================================
  ui: {
    expand: '▼',          // Sektion ausgeklappt
    collapse: '▶',        // Sektion eingeklappt
    sortAsc: '▲',         // Sortierung aufsteigend
    sortDesc: '▼',        // Sortierung absteigend
    loading: '⏳',        // Lädt
    info: 'ℹ️',           // Information
    warning: '⚠️',        // Warnung
    error: '❌',          // Fehler
    success: '✓',         // Erfolg
    calendar: '📅',       // Kalender
    report: '📊',         // Bericht/Report
    document: '📄',       // Dokument
    theme: {
      light: '☀️',        // Hell-Modus
      dark: '🌙',         // Dunkel-Modus
    },
  },

  // ============================================
  // TOAST - Toast-Benachrichtigungen
  // ============================================
  toast: {
    success: '✓',         // Erfolg
    error: '✗',           // Fehler
    warning: '⚠',         // Warnung
    info: 'ℹ',            // Information
  },

  // ============================================
  // MODAL - Modal-Dialoge
  // ============================================
  modal: {
    close: '✕',           // Modal schließen
    warning: '⚠️',        // Warnung-Modal
    danger: '⚠️',         // Gefahr-Modal
    question: '❓',       // Frage-Modal
    info: 'ℹ️',           // Info-Modal
    edit: '✏️',           // Bearbeiten-Modal
  },

  // ============================================
  // VACATION - Urlaubsverwaltung
  // ============================================
  vacation: {
    request: '📝',        // Urlaubsantrag
    approve: '✓',         // Genehmigen
    reject: '✗',          // Ablehnen
    cancel: '🚫',         // Absagen
    withdraw: '↩️',       // Zurückziehen
    days: '📅',           // Urlaubstage
    warning: '⚠️',        // Warnung (z.B. Überziehung)
    note: '📝',           // Notiz/Bemerkung
    exception: '⚠️',      // Rückbuchung/Exception
    time: '⏱️',           // Zeit/Tage
  },

  // ============================================
  // CALENDAR - Kalenderansicht
  // ============================================
  calendar: {
    vacation: '🏖️',       // Urlaub
    weekend: '🏁',        // Wochenende
    halfDay: '🕐',        // Halber Tag
    halfVacation: '⚡',   // Halber Urlaubstag
    pdf: '📄',            // PDF Export
    navPrev: '◀',         // Navigation zurück
    navNext: '▶',         // Navigation vor
  },

  // ============================================
  // CARRYOVER - Urlaubsübertrag
  // ============================================
  carryover: {
    info: '⚠️',           // Info-Hinweis
    comment: '💬',        // Begründung/Kommentar
    edit: '✏️',           // Bearbeiten
    pending: '⏳',        // Ausstehend
    approved: '✓',        // Genehmigt
  },

  // ============================================
  // ADMIN - Administrations-Bereich
  // ============================================
  admin: {
    database: '🗄️',       // Datenbank
    backup: '💾',         // Backup
    clear: '🗑️',          // Löschen/Leeren
    import: '📊',         // Import
    download: '📥',       // Download
    document: '📄',       // Dokument
    success: '✓',         // Erfolg
    error: '✗',           // Fehler
    warning: '⚠️',        // Warnung
    loading: '⏳',        // Lädt
  },

  // ============================================
  // USERS - Benutzerverwaltung
  // ============================================
  users: {
    add: '➕',            // Benutzer hinzufügen
    edit: '✏️',           // Benutzer bearbeiten
    password: '🔑',       // Passwort zurücksetzen
    regenerate: '🔄',     // Passwort neu generieren
    deactivate: '🚫',     // Benutzer deaktivieren
    activate: '✅',       // Benutzer aktivieren
    inactive: '🚫',       // Inaktiv-Badge
    sortAsc: '▲',         // Sortierung auf
    sortDesc: '▼',        // Sortierung ab
  },

  // ============================================
  // ORGANIZATION - Organisationsstruktur
  // ============================================
  organization: {
    chart: '📊',          // Organigramm
    team: '👥',           // Team
    remove: '✕',          // Aus Team entfernen
    boss: '👨‍💼',          // Chef/Manager
    pdf: '📄',            // PDF Export
  },

  // ============================================
  // YEAR_TRANSITION - Jahreswechsel
  // ============================================
  yearTransition: {
    pending: '⏳',        // Ausstehend
    done: '✓',            // Erledigt
    info: 'ℹ️',           // Information
    success: '✅',        // Erfolg
    reset: '↩️',          // Zurücksetzen
    preview: '🔍',        // Vorschau
    close: '✕',           // Schließen
  },

  // ============================================
  // ABOUT - Über-Dialog
  // ============================================
  about: {
    developer: '👨‍💻',     // Entwickler
    tools: '🛠️',          // Werkzeuge/Tech
    nuxt: '⚡',            // Nuxt/Vue
    css: '🎨',            // CSS/Styling
    typescript: '📘',     // TypeScript
    database: '🗄️',       // Datenbank
    i18n: '🌍',           // Internationalisierung
    heart: '❤️',          // Mit Liebe gemacht
  },

  // ============================================
  // FLAGS - Sprach-Flaggen
  // ============================================
  flags: {
    de: '/flags/de.png',        // Deutschland
    en: '/flags/gb.png',        // Großbritannien
    'pt-br': '/flags/br.png',   // Brasilien
  },

  // ============================================
  // LANGUAGE - Sprach-Emojis (für Composables)
  // ============================================
  language: {
    de: '🇩🇪',            // Deutschland
    en: '🇬🇧',            // Großbritannien
    'pt-br': '🇧🇷',       // Brasilien
  },
}

// ============================================
// TYPE DEFINITIONS
// ============================================
export type IconCommon = keyof typeof icons.common
export type IconRole = keyof typeof icons.roles
export type IconAction = keyof typeof icons.actions
export type IconStatus = keyof typeof icons.status
export type IconUI = keyof typeof icons.ui
export type IconToast = keyof typeof icons.toast
export type IconModal = keyof typeof icons.modal
export type IconVacation = keyof typeof icons.vacation
export type IconCalendar = keyof typeof icons.calendar
export type IconCarryover = keyof typeof icons.carryover
export type IconAdmin = keyof typeof icons.admin
export type IconUsers = keyof typeof icons.users
export type IconOrganization = keyof typeof icons.organization
export type IconYearTransition = keyof typeof icons.yearTransition
export type IconAbout = keyof typeof icons.about
export type IconFlag = keyof typeof icons.flags
export type IconLanguage = keyof typeof icons.language

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sichere Icon-Getter mit Fallback
 * Verwendung: getIcon.common('close', '✕')
 */
export const getIcon = {
  common: (key: string, fallback = '?') => icons.common[key as IconCommon] || fallback,
  role: (key: string, fallback = '?') => icons.roles[key as IconRole] || fallback,
  action: (key: string, fallback = '?') => icons.actions[key as IconAction] || fallback,
  status: (key: string, fallback = '?') => icons.status[key as IconStatus] || fallback,
  ui: (key: string, fallback = '?') => icons.ui[key as IconUI] || fallback,
  toast: (key: string, fallback = '?') => icons.toast[key as IconToast] || fallback,
  modal: (key: string, fallback = '?') => icons.modal[key as IconModal] || fallback,
  vacation: (key: string, fallback = '?') => icons.vacation[key as IconVacation] || fallback,
  calendar: (key: string, fallback = '?') => icons.calendar[key as IconCalendar] || fallback,
  carryover: (key: string, fallback = '?') => icons.carryover[key as IconCarryover] || fallback,
  admin: (key: string, fallback = '?') => icons.admin[key as IconAdmin] || fallback,
  users: (key: string, fallback = '?') => icons.users[key as IconUsers] || fallback,
  organization: (key: string, fallback = '?') => icons.organization[key as IconOrganization] || fallback,
  yearTransition: (key: string, fallback = '?') => icons.yearTransition[key as IconYearTransition] || fallback,
  about: (key: string, fallback = '?') => icons.about[key as IconAbout] || fallback,
  flag: (key: string, fallback = '🏳️') => icons.flags[key as IconFlag] || fallback,
  language: (key: string, fallback = '🏳️') => icons.language[key as IconLanguage] || fallback,
}
