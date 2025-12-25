// app/config/i18n/de.ts
/**
 * Deutsche Übersetzungen
 */
export const de = {
  // Allgemein
  common: {
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    back: 'Zurück',
    next: 'Weiter',
    search: 'Suchen',
    filter: 'Filtern',
    export: 'Exportieren',
    loading: 'Lädt...',
    error: 'Fehler',
    success: 'Erfolgreich',
    warning: 'Warnung',
    info: 'Information',
    yes: 'Ja',
    no: 'Nein',
    optional: 'Optional',
    required: 'Erforderlich',
    days: 'Tage',
    day: 'Tag',
    from: 'Von',
    to: 'Bis',
    date: 'Datum',
    reason: 'Grund',
    status: 'Status',
    actions: 'Aktionen',
    year: 'Jahr',
    allYears: 'Alle Jahre'
  },

  // Navigation
  nav: {
    home: 'Startseite',
    vacation: 'Urlaub',
    organization: 'Organigramm',
    users: 'Benutzerverwaltung',
    settings: 'Einstellungen',
    logout: 'Abmelden'
  },

  // Login
  login: {
    title: 'Anmelden',
    username: 'Benutzername',
    password: 'Passwort',
    usernamePlaceholder: 'Benutzername eingeben',
    passwordPlaceholder: 'Passwort eingeben',
    loginButton: 'Anmelden',
    error: 'Benutzername oder Passwort falsch',
    welcome: 'Willkommen zurück!'
  },

  // Rollen
  roles: {
    employee: 'Mitarbeiter',
    teamlead: 'Teamleiter',
    manager: 'Manager',
    office: 'Office',
    sysadmin: 'System-Admin'
  },

  // Status
  status: {
    active: 'Aktiv',
    inactive: 'Inaktiv',
    pending: 'Ausstehend',
    approved: 'Genehmigt',
    rejected: 'Abgelehnt',
    cancelled: 'Abgesagt',
    teamleadApproved: 'Teamleiter genehmigt'
  },

  // Urlaubsverwaltung
  vacation: {
    title: 'Urlaubsverwaltung',
    myVacation: 'Mein Urlaub',
    myRequest: 'Mein Antrag',
    teamRequests: 'Teamleiter-Ansicht',
    managerApproval: 'Manager-Ansicht',
    vacationRules: 'Urlaubsregelung',
    approvedVacations: 'Genehmigte Urlaube',
    reports: 'Berichte',
    calendar: 'Kalender',
    
    // Formular
    requestVacation: 'Urlaub beantragen',
    startDate: 'Startdatum',
    endDate: 'Enddatum',
    reason: 'Grund',
    reasonPlaceholder: 'z.B. Familienurlaub, Erholung...',
    submit: 'Antrag einreichen',
    
    // Übersicht
    vacationDays: 'Urlaubstage',
    remainingDays: 'Verbleibende Tage',
    usedDays: 'Genommene Tage',
    totalDays: 'Gesamt',
    carryover: 'Übertrag',
    standard: 'Standard',
    
    // Aktionen
    approve: 'Genehmigen',
    reject: 'Ablehnen',
    cancel: 'Urlaub absagen',
    cancelReason: 'Grund für die Absage',
    cancelWarning: 'Der genehmigte Urlaub wird abgesagt und die Urlaubstage werden zurückgebucht.',
    
    // Export
    exportPdf: 'PDF exportieren',
    exportTeamPdf: 'Team-PDF exportieren',
    exportAllPdf: 'Alle Urlaube als PDF exportieren',
    exportMyApprovedVacations: 'Genehmigte Urlaube exportieren',
    
    // Meldungen
    requestSubmitted: 'Urlaubsantrag erfolgreich eingereicht',
    requestApproved: 'Urlaubsantrag genehmigt',
    requestRejected: 'Urlaubsantrag abgelehnt',
    requestCancelled: 'Urlaub abgesagt',
    pdfCreated: 'PDF erfolgreich erstellt!',
    pdfGenerating: 'PDF wird erstellt, bitte warten...',
    
    // Halbtags-Regeln
    halfDayRules: 'Halbtags-Regelung',
    addHalfDay: 'Halbtag hinzufügen',
    halfDayDate: 'Datum',
    halfDayDescription: 'Beschreibung',
    halfDayDescriptionPlaceholder: 'z.B. Heiligabend, Silvester...',
    noHalfDayRules: 'Noch keine Halbtags-Regelungen definiert',
    
    // Filter
    filterByEmployee: 'Mitarbeiter filtern:',
    filterByYear: 'Jahr:',
    enterName: 'Name eingeben...',
    requestsShown: '{shown} von {total} Anträgen',
    noRequestsForFilter: 'Keine Urlaube für diesen Filter gefunden',
    noApprovedVacations: 'Keine genehmigten Urlaube',
    
    // Übertrag/Carryover
    carryoverManagement: 'Urlaubstage-Übertrag {action}',
    carryoverManage: 'verwalten',
    carryoverOverview: 'Übersicht',
    carryoverReview: 'Urlaubstage-Übertrag prüfen ({year})',
    carryoverAdjust: 'Übertrag anpassen',
    carryoverAdd: 'Übertrag hinzufügen/bearbeiten',
    carryoverInfo: 'Urlaubstage-Übertrag {year}',
    carryoverPending: 'Urlaubstage-Übertrag wird geprüft',
    carryoverApproved: 'Urlaubstage-Übertrag angepasst',
    carryoverIncluding: 'Inkl. {days} Tage Übertrag aus {year}',
    carryoverCalculated: 'Berechneter Übertrag:',
    carryoverApprovedAmount: 'Genehmigter Übertrag:',
    carryoverNewAmount: 'Neuer Übertrag (Tage) *',
    carryoverReasonLabel: 'Grund für Anpassung *',
    carryoverReasonPlaceholder: 'Bitte begründen Sie die Anpassung des Übertrags...',
    carryoverSave: 'Übertrag speichern',
    carryoverManagerReviewing: 'Ihr Manager prüft derzeit Ihren berechneten Übertrag von {days} Tagen aus {year}.'
  },

  // Berichte
  reports: {
    title: 'Berichte & Statistiken',
    annualReport: 'Jahresbericht Urlaube',
    annualReportDescription: 'Erstellt einen vollständigen Jahresbericht für alle Mitarbeiter mit Gesamtstatistik, individuellen Urlaubsnachweisen und Unterschriftenvorlagen.',
    selectYear: 'Jahr auswählen:',
    preview: 'Vorschau Gesamtstatistik {year}',
    createPdf: 'Jahresbericht als PDF erstellen',
    creating: 'PDF wird erstellt...',
    employees: 'Mitarbeiter',
    totalVacationDays: 'Urlaubstage gesamt',
    averagePerEmployee: 'Ø pro Mitarbeiter',
    taken: 'Genommen',
    remaining: 'Resturlaub',
    quota: 'Quote',
    pdfContains: 'Das PDF enthält:',
    pdfPage1: 'Seite 1: Gesamtstatistik über alle Mitarbeiter',
    pdfPage2Plus: 'Ab Seite 2: Individueller Nachweis pro Mitarbeiter (alphabetisch sortiert)',
    pdfSignatures: 'Jede Mitarbeiterseite enthält eine Unterschriftenvorlage zur Bestätigung',
    loadingStatistics: 'Lade Statistiken...'
  },

  // Benutzerverwaltung
  users: {
    title: 'Benutzerverwaltung',
    addUser: 'Mitarbeiter hinzufügen',
    existingUsers: 'Bestehende Mitarbeiter',
    
    // Formular
    firstName: 'Vorname',
    lastName: 'Nachname',
    generated: 'Generierter',
    username: 'Benutzername',
    role: 'Rolle',
    yourRole: 'Ihre Rolle',
    roleSelect: 'Bitte wählen...',
    teamlead: 'Teamleiter',
    teamleadSelect: 'Teamleiter wählen...',
    yourTeamlead: 'Ihr Teamleiter',
    password: 'Passwort',
    vacationDays: 'Urlaubstage',
    vacationDaysPerYear: 'Urlaubstage pro Jahr',
    
    // Platzhalter
    firstNamePlaceholder: 'Max',
    lastNamePlaceholder: 'Mustermann',
    
    // Tabelle
    name: 'Name',
    displayName: 'Anzeigename',
    
    // Aktionen
    editUser: 'Benutzer bearbeiten',
    resetPassword: 'Passwort zurücksetzen',
    deactivateUser: 'Benutzer deaktivieren',
    activateUser: 'Benutzer aktivieren',
    regeneratePassword: 'Passwort neu generieren',
    
    // Filter
    showInactive: 'Deaktivierte anzeigen',
    searchPlaceholder: 'Nach Vor- oder Nachname suchen...',
    
    // Meldungen
    userCreated: 'Benutzer erfolgreich erstellt',
    userUpdated: 'Benutzer aktualisiert',
    passwordReset: 'Passwort zurückgesetzt',
    userDeactivated: 'Benutzer deaktiviert',
    userActivated: 'Benutzer aktiviert',
    
    // Passwort
    changePassword: 'Passwort ändern',
    oldPassword: 'Altes Passwort',
    newPassword: 'Neues Passwort',
    confirmPassword: 'Passwort bestätigen',
    passwordChanged: 'Passwort erfolgreich geändert',
    passwordsNotMatch: 'Passwörter stimmen nicht überein',
    passwordTooShort: 'Passwort muss mindestens 8 Zeichen lang sein',
    passwordNote: 'Sicheres Passwort - kann bearbeitet werden'
  },

  // Organigramm
  organization: {
    title: 'Organigramm',
    description: 'Überblick über die Organisationsstruktur und Team-Zuordnungen.',
    exportOrgChart: 'Organigramm als PDF',
    exportTeamOverview: 'Teamübersicht als PDF',
    
    // Team-Verwaltung
    teamManagement: 'Team-Verwaltung',
    teams: 'Teams',
    assignEmployeesToTeams: 'Mitarbeiter den Teams zuordnen',
    unassignedEmployees: 'Nicht zugeordnete Mitarbeiter',
    assignToTeam: 'Mitarbeiter einem Team zuordnen',
    employee: 'Mitarbeiter',
    selectEmployee: 'Mitarbeiter wählen...',
    selectTeamlead: 'Teamleiter wählen...',
    assignButton: 'Zuordnung speichern',
    noEmployeesAssigned: 'Keine Mitarbeiter zugeordnet',
    removeFromTeam: 'Aus Team entfernen',
    
    // Organigramm Baum
    orgChart: 'Organigramm',
    graphicalRepresentation: 'Grafische Darstellung der Organisationsstruktur',
    
    // Statistik
    statistics: 'Statistik',
    totalEmployees: 'Gesamt Mitarbeiter',
    teamleads: 'Teamleiter',
    employees: 'Mitarbeiter',
    
    // PDF
    orgChartPdf: 'Organigramm - {company}',
    teamOverviewPdf: 'Teamübersicht - {company}',
    vacationOverviewPdf: 'Urlaubsübersicht - {company}',
    createdOn: 'Erstellt am',
    supervisor: 'Vorgesetzter',
    teamMembers: 'Team-Mitglieder',
    notAssigned: 'Nicht zugeordnet'
  },

  // Fehlermeldungen
  errors: {
    genericError: 'Ein Fehler ist aufgetreten',
    networkError: 'Netzwerkfehler',
    notFound: 'Nicht gefunden',
    unauthorized: 'Nicht autorisiert',
    forbidden: 'Zugriff verweigert',
    serverError: 'Serverfehler',
    validationError: 'Validierungsfehler',
    required: 'Dieses Feld ist erforderlich',
    invalidEmail: 'Ungültige E-Mail-Adresse',
    invalidDate: 'Ungültiges Datum',
    startDateAfterEndDate: 'Startdatum muss vor Enddatum liegen',
    noVacationDaysLeft: 'Keine Urlaubstage mehr verfügbar',
    loadingStatistics: 'Fehler beim Laden der Statistiken',
    creatingPdf: 'Fehler beim Erstellen des PDFs'
  },

  // PDF Texte
  pdf: {
    page: 'Seite',
    totalPages: 'Seite {current}/{total}',
    myApprovedVacations: 'Meine genehmigten Urlaube',
    teamVacations: 'Team-Urlaubsübersicht',
    allVacations: 'Urlaubsübersicht',
    vacationAccount: 'Urlaubskonto',
    totalApprovedDays: 'Gesamt genehmigte Urlaubstage',
    totalRequests: 'Gesamt Anträge',
    fullyApproved: 'Vollständig genehmigt',
    pendingManager: 'Bei Manager ausstehend',
    pendingTeamlead: 'Bei Teamleiter ausstehend',
    totalCancelledDays: 'Abgesagte Urlaubstage gesamt'
  },

  // Bestätigungsdialoge
  confirm: {
    deleteTitle: 'Löschen bestätigen',
    deleteMessage: 'Möchten Sie diesen Eintrag wirklich löschen?',
    cancelTitle: 'Abbrechen bestätigen',
    cancelMessage: 'Möchten Sie diesen Vorgang wirklich abbrechen?',
    logoutTitle: 'Abmelden bestätigen',
    logoutMessage: 'Möchten Sie sich wirklich abmelden?',
    resetPasswordTitle: 'Passwort zurücksetzen',
    resetPasswordMessage: 'Passwort für {name} zurücksetzen?'
  },

  // About Dialog
  about: {
    title: '{appName}',
    version: 'Version {version}',
    developedBy: 'Entwickelt von',
    leadDeveloper: 'Lead Developer',
    aiAssistant: 'AI Assistant by Anthropic',
    techStack: 'Technologie-Stack',
    copyright: '© {year} {company}',
    madeWith: 'Erstellt mit ❤️ in Deutschland'
  }
}

export type Translation = typeof de
