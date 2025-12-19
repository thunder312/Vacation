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
 */

export const icons = {
  /**
   * Rollen-Icons (Organigramm & Listen)
   */
  roles: {
    manager: '👔',      // Manager
    teamlead: '👥',     // Teamleiter
    office: '📋',       // Office
    sysadmin: '🔧',     // System-Admin
    employee: '👤'      // Mitarbeiter
  },

  /**
   * Aktions-Icons (Buttons)
   */
  actions: {
    edit: '✏️',         // Bearbeiten
    password: '🔑',     // Passwort zurücksetzen
    regenerate: '🔄',   // Passwort neu generieren
    deactivate: '🚫',   // Deaktivieren
    activate: '✅',     // Aktivieren
    cancel: '🚫',       // Urlaub absagen
    approve: '✓',       // Genehmigen
    reject: '✗',        // Ablehnen
    pdf: '📄',          // PDF Export
    logout: '🚪'        // Abmelden
  },

  /**
   * UI-Navigation Icons
   */
  ui: {
    expand: '▼',        // Sektion ausgeklappt
    collapse: '▶',      // Sektion eingeklappt
    sortUp: '▲',        // Sortierung aufsteigend
    sortDown: '▼',      // Sortierung absteigend
    search: '🔍'        // Suche
  },

  /**
   * Status-Icons
   */
  status: {
    active: '✓',        // Aktiv
    inactive: '○',      // Inaktiv
    approved: '✓✓',     // Vollständig genehmigt
    pending: '⏳',      // Ausstehend
    rejected: '✗',      // Abgelehnt
    cancelled: '🚫'     // Abgesagt
  }
}

/**
 * Icon-Typen für TypeScript
 */
export type IconRole = keyof typeof icons.roles
export type IconAction = keyof typeof icons.actions
export type IconUI = keyof typeof icons.ui
export type IconStatus = keyof typeof icons.status

/**
 * Helper-Funktion um Icons zu holen
 */
export const getIcon = {
  role: (role: IconRole) => icons.roles[role] || '?',
  action: (action: IconAction) => icons.actions[action] || '?',
  ui: (ui: IconUI) => icons.ui[ui] || '?',
  status: (status: IconStatus) => icons.status[status] || '?'
}

/**
 * Beispiel für SVG Icons:
 * 
 * export const icons = {
 *   roles: {
 *     manager: '/icons/roles/manager.svg',
 *     teamlead: '/icons/roles/teamlead.svg',
 *     ...
 *   }
 * }
 */

/**
 * Beispiel für Font Awesome:
 * 
 * export const icons = {
 *   roles: {
 *     manager: 'fas fa-user-tie',
 *     teamlead: 'fas fa-users',
 *     ...
 *   }
 * }
 * 
 * Verwendung: <i :class="icons.roles.manager"></i>
 */
